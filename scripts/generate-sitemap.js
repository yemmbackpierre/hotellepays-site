const fs = require('fs');
const path = require('path');

// Ce script est destiné à être lancé localement (node scripts/generate-sitemap.js)
// Il importe les données de rooms depuis app/types/hotelData.ts en parsant le fichier (sans exécuter TypeScript).

const projectRoot = path.resolve(__dirname, '..');
const hotelDataPath = path.join(projectRoot, 'app', 'types', 'hotelData.ts');
const sitemapPath = path.join(projectRoot, 'public', 'sitemap.xml');
const siteUrl = 'https://hotellepays.com';

function extractSlugs(tsContent) {
    // méthode simple: chercher des occurrences de "slug: '...'", en supportant guillemets doubles ou simples
    const regex = /slug:\s*['"]([a-zA-Z0-9-_.]+)['"]/g;
    const slugs = new Set();
    let m;
    while ((m = regex.exec(tsContent)) !== null) {
        slugs.add(m[1]);
    }
    return Array.from(slugs);
}

function buildUrlEntry(loc, changefreq='weekly', priority='0.8'){
    const lastmod = new Date().toISOString();
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
}

try {
    const ts = fs.readFileSync(hotelDataPath, 'utf8');
    const slugs = extractSlugs(ts);

    const staticEntries = [
        { loc: siteUrl + '/', changefreq: 'daily', priority: '1.0' },
        { loc: siteUrl + '/booking', changefreq: 'daily', priority: '0.9' },
        { loc: siteUrl + '/contact', changefreq: 'weekly', priority: '0.8' },
        { loc: siteUrl + '/chambres', changefreq: 'weekly', priority: '0.9' },
        { loc: siteUrl + '/services', changefreq: 'weekly', priority: '0.7' },
        { loc: siteUrl + '/pricing', changefreq: 'weekly', priority: '0.7' },
        { loc: siteUrl + '/menu', changefreq: 'monthly', priority: '0.5' }
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const e of staticEntries) {
        xml += buildUrlEntry(e.loc, e.changefreq, e.priority);
    }

    // ajout des rooms
    for (const slug of slugs) {
        const loc = `${siteUrl}/room-details/${slug}`;
        xml += buildUrlEntry(loc, 'weekly', '0.8');
    }

    // Optionnel: image OG
    xml += buildUrlEntry(siteUrl + '/assets/images/og-image.jpg', 'monthly', '0.1');

    xml += '</urlset>\n';

    fs.writeFileSync(sitemapPath, xml, 'utf8');
    console.log('Sitemap généré avec', slugs.length, 'rooms.');
} catch (err) {
    console.error('Erreur lors de la génération du sitemap:', err.message);
    process.exit(1);
}

