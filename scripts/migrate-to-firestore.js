/*
  Script: scripts/migrate-to-firestore.js
  Usage: node scripts/migrate-to-firestore.js [--dry] [--only=defaultRooms,defaultPosts]
  Requirements: set env FIREBASE_SERVICE_ACCOUNT_KEY (JSON string) & CLOUDINARY_* envs
  Behavior: migrates many exports from app/types/hotelData.ts to Firestore, uploading local images
            (paths starting with /assets/) to Cloudinary, except footerData.logo which is left as-is.
*/

const path = require('path');
const fs = require('fs');

// CLI options
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry');
let onlyList = null;
for (const a of args) {
  if (a.startsWith('--only=')) {
    onlyList = a.split('=')[1].split(',').map(s => s.trim()).filter(Boolean);
  }
}

// Lazy-require server helpers so --dry can run without credentials
let adminDb = null;
let uploadBuffer = null;
if (!DRY_RUN) {
  try {
    adminDb = require('../app/lib/firestore.server').adminDb;
  } catch (e) {
    console.warn('Warning: could not require firestore.server (ensure FIREBASE_SERVICE_ACCOUNT_KEY is set).', e.message || e);
    adminDb = null;
  }
  try {
    uploadBuffer = require('../app/lib/cloudinary').uploadBuffer;
  } catch (e) {
    console.warn('Warning: could not require cloudinary helper (ensure CLOUDINARY envs are set).', e.message || e);
    uploadBuffer = null;
  }
} else {
  // DRY run stub for uploadBuffer
  uploadBuffer = async (buffer, publicId) => {
    console.log('[DRY] uploadBuffer called for', publicId || '[buffer]');
    return { secure_url: `[DRY_URL_${publicId || 'file'}]`, public_id: publicId || null };
  };
}

// Exports from hotelData to process. We'll pick most exports except reservations.
const exportsToMigrate = {
  defaultRooms: { type: 'collection', name: 'rooms', key: 'slug' },
  defaultPosts: { type: 'collection', name: 'posts', key: 'slug' },
  defaultFeatures: { type: 'collection', name: 'features', key: null },
  defaultImages: { type: 'collection', name: 'gallery', key: null },
  testimonials: { type: 'collection', name: 'testimonials', key: null },
  instagramFeed: { type: 'collection', name: 'instagram', key: null },
  serviceData: { type: 'collection', name: 'services', key: null },
  defaultDestinations: { type: 'collection', name: 'destinations', key: 'slug' },
  defaultTraditionalFoods: { type: 'collection', name: 'traditionalFoods', key: 'slug' },
  FAQData: { type: 'collection', name: 'faqs', key: null },
  Pricings: { type: 'collection', name: 'pricings', key: null },
  ExtrasExtraData: { type: 'collection', name: 'extras', key: 'name' },
  slidesData: { type: 'collection', name: 'slides', key: null },
  sliderData: { type: 'collection', name: 'slider', key: null },
  fanfactsData: { type: 'document', name: 'site/fanfacts' },
  hotelDefaultInfo: { type: 'document', name: 'site/hotelInfo' },
  footerData: { type: 'document', name: 'site/footer' },
  defaultSeoAboutData: { type: 'document', name: 'site/seo' },
  defaultAboutData: { type: 'document', name: 'site/about' },
  defaultHeroData: { type: 'document', name: 'site/hero' },
};

const publicDir = path.join(__dirname, '..', 'public');

// cache uploads to avoid duplicate uploads
const uploadCache = new Map();

const isLocalAsset = (s) => typeof s === 'string' && s.startsWith('/assets/');

// upload one local asset and return cloudinary url (cached)
const uploadAsset = async (assetPath) => {
  if (!assetPath) return null;
  if (!isLocalAsset(assetPath)) return assetPath; // already an http url or other
  if (uploadCache.has(assetPath)) return uploadCache.get(assetPath);
  const p = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const abs = path.join(publicDir, p);
  if (!fs.existsSync(abs)) {
    console.warn('Asset not found, skipping upload:', abs);
    uploadCache.set(assetPath, assetPath);
    return assetPath;
  }
  if (DRY_RUN) {
    console.log('[DRY] would upload', assetPath);
    uploadCache.set(assetPath, assetPath);
    return assetPath;
  }
  const buffer = fs.readFileSync(abs);
  try {
    if (!uploadBuffer) throw new Error('uploadBuffer not available');
    const res = await uploadBuffer(buffer, path.basename(abs, path.extname(abs)));
    uploadCache.set(assetPath, res.secure_url);
    return res.secure_url;
  } catch (err) {
    console.error('uploadAsset error for', assetPath, err);
    uploadCache.set(assetPath, assetPath);
    return assetPath;
  }
};

// Recursively walk object and replace local asset paths with uploaded urls using uploadAsset
const replaceAssetsInObject = async (obj, options = {}) => {
  const { skipPaths = new Set() } = options;
  if (Array.isArray(obj)) {
    const res = [];
    for (const item of obj) {
      if (typeof item === 'string' && isLocalAsset(item) && !skipPaths.has(item)) {
        res.push(await uploadAsset(item));
      } else if (typeof item === 'object' && item !== null) {
        res.push(await replaceAssetsInObject(item, options));
      } else {
        res.push(item);
      }
    }
    return res;
  } else if (typeof obj === 'object' && obj !== null) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      // Do not upload logo field in footer
      if (options.skipLogo && k === 'logo') {
        out[k] = v; // keep as is
        continue;
      }

      if (typeof v === 'string') {
        if (isLocalAsset(v) && !skipPaths.has(v)) {
          out[k] = await uploadAsset(v);
        } else {
          out[k] = v;
        }
      } else if (Array.isArray(v)) {
        out[k] = await replaceAssetsInObject(v, options);
      } else if (typeof v === 'object' && v !== null) {
        out[k] = await replaceAssetsInObject(v, options);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return obj;
};

/* Parsing helper: extract top-level export const NAME = <literal> from a TS file */
function extractExportLiteralsFromTS(tsPath, names) {
  const content = fs.readFileSync(tsPath, 'utf8');
  const results = {};
  for (const name of names) {
    const regex = new RegExp('export\\s+const\\s+' + name + '\\s*=');
    const m = content.match(regex);
    if (!m) {
      results[name] = undefined;
      continue;
    }
    const startIdx = content.indexOf(m[0]) + m[0].length;
    // skip whitespace
    let i = startIdx;
    while (i < content.length && /[\s]/.test(content[i])) i++;
    if (i >= content.length) { results[name] = undefined; continue; }
    const startChar = content[i];
    // if starts with [ or { capture balanced
    if (startChar === '[' || startChar === '{') {
      const stack = [startChar];
      let j = i + 1;
      let inSingle = false, inDouble = false, inTemplate = false, escaped = false;
      for (; j < content.length; j++) {
        const ch = content[j];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (inSingle) {
          if (ch === "'" ) inSingle = false;
          continue;
        }
        if (inDouble) {
          if (ch === '"') inDouble = false;
          continue;
        }
        if (inTemplate) {
          if (ch === '`') inTemplate = false;
          continue;
        }
        if (ch === "'") { inSingle = true; continue; }
        if (ch === '"') { inDouble = true; continue; }
        if (ch === '`') { inTemplate = true; continue; }
        if (ch === '[') { stack.push('['); continue; }
        if (ch === '{') { stack.push('{'); continue; }
        if (ch === ']') { if (stack[stack.length-1] === '[') stack.pop(); else { /* mismatch */ } }
        if (ch === '}') { if (stack[stack.length-1] === '{') stack.pop(); else { /* mismatch */ } }
        if (stack.length === 0) break;
      }
      const endIdx = j+1;
      const literalText = content.slice(i, endIdx);
      // evaluate safely by wrapping in parentheses
      try {
        /* eslint-disable no-eval */
        const val = eval('(' + literalText + ')');
        results[name] = val;
      } catch (e) {
        console.warn('Could not eval export', name, e.message || e);
        results[name] = undefined;
      }
    } else if (startChar === '`' || startChar === '"' || startChar === "'") {
      // string literal
      let j = i+1;
      let escaped = false;
      const quote = startChar;
      for (; j < content.length; j++) {
        const ch = content[j];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === quote) break;
      }
      const literalText = content.slice(i, j+1);
      try { results[name] = eval(literalText); } catch (e) { results[name] = undefined; }
    } else {
      // fallback: try to read until semicolon (may be expression)
      const semi = content.indexOf(';', i);
      if (semi === -1) { results[name] = undefined; continue; }
      const literalText = content.slice(i, semi);
      try { results[name] = eval('(' + literalText + ')'); } catch (e) { results[name] = undefined; }
    }
  }
  return results;
}

// Try requiring the TS module directly (works when running with ts-node/register)
let typesModule = null;
try {
  typesModule = require('../app/types/hotelData');
  console.log('Loaded hotelData via require');
} catch (e) {
  // ignore — we'll fallback to parsing
  // console.warn('Require hotelData failed, falling back to parser:', e.message || e);
}

// Replace earlier parsing usage: if typesModule available, use it; else parse
const allExportNames = Object.keys(exportsToMigrate);
let typesExports = {};
if (typesModule) {
  // copy only exports we need
  for (const name of allExportNames) {
    typesExports[name] = typesModule[name];
  }
} else {
  try {
    const tsPath = path.join(__dirname, '..', 'app', 'types', 'hotelData.ts');
    typesExports = extractExportLiteralsFromTS(tsPath, allExportNames);
  } catch (e) {
    console.warn('Failed to parse hotelData.ts:', e.message || e);
    typesExports = {};
  }
}

// Then later use typesExports[exportName] instead of types[exportName]
// Modify references in main loop accordingly by replacing `const data = types[exportName];` with:
// const data = typesExports[exportName];

// We now patch the main loop by replacing the variable access. Locate the loop and adjust.
// main
(async () => {
  console.log('Starting comprehensive migration to Firestore (idempotent).');
  if (DRY_RUN) console.log('DRY RUN enabled: no uploads/writes will be performed.');
  if (onlyList) console.log('Only processing exports:', onlyList.join(','));

  // helper to write a collection item idempotently by slug or key
  const writeCollectionItem = async (collectionName, item, keyName) => {
    try {
      if (DRY_RUN) {
        return { action: 'dry', id: null };
      }
      if (!adminDb) throw new Error('adminDb not available');
      if (keyName && item[keyName]) {
        const q = await adminDb.collection(collectionName).where(keyName, '==', item[keyName]).limit(1).get();
        if (!q.empty) {
          const ref = q.docs[0].ref;
          await ref.set(item, { merge: true });
          return { action: 'updated', id: ref.id };
        }
      }
      const ref = await adminDb.collection(collectionName).add(item);
      return { action: 'created', id: ref.id };
    } catch (err) {
      return { action: 'error', error: String(err) };
    }
  };

  // iterate over exportsToMigrate
  for (const [exportName, meta] of Object.entries(exportsToMigrate)) {
    if (onlyList && !onlyList.includes(exportName)) {
      console.log('Skipping (not in --only):', exportName);
      continue;
    }

    const data = typesExports[exportName];
    if (data === undefined) {
      console.log('Export not found, skipping:', exportName);
      continue;
    }

    console.log('\nProcessing export:', exportName, '->', JSON.stringify(meta));

    if (meta.type === 'collection') {
      if (!Array.isArray(data)) {
        console.warn('Expected array for', exportName, 'skipping');
        continue;
      }
      for (const item of data) {
        // skip reservations if any
        if (item && item.reservation) {
          console.log('Skipping reservation item (per user request)');
          continue;
        }
        const processed = await replaceAssetsInObject(item, { skipLogo: true });
        const result = await writeCollectionItem(meta.name, processed, meta.key);
        console.log(meta.name, item.slug || item.name || '(no key)', '=>', result.action, result.id || result.error);
      }
    } else if (meta.type === 'document') {
      const processed = await replaceAssetsInObject(data, { skipLogo: true });
      try {
        if (DRY_RUN) {
          console.log('[DRY] would upsert document', meta.name);
        } else {
          if (!adminDb) throw new Error('adminDb not available');
          await adminDb.doc(meta.name).set(processed, { merge: true });
          console.log('Upserted document', meta.name);
        }
      } catch (err) {
        console.error('Error writing document', meta.name, err);
      }
    }
  }

  console.log('\nComprehensive migration complete');
  process.exit(0);
})();
