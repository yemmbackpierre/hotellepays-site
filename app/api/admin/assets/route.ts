import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/app/lib/adminAuth';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

async function collectImages(dir: string, urlPrefix: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = await collectImages(fullPath, `${urlPrefix}/${entry.name}`);
        results.push(...nested);
      } else if (IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())) {
        results.push(`${urlPrefix}/${entry.name}`);
      }
    }
  } catch {
    // directory may not exist yet
  }
  return results;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const publicDir = path.join(process.cwd(), 'public');
  const uploaded = await collectImages(path.join(publicDir, 'uploads'), '/api/uploads');
  const assets = await collectImages(
    path.join(publicDir, 'assets', 'images'),
    '/assets/images'
  );

  return NextResponse.json({
    ok: true,
    images: [...uploaded.reverse(), ...assets],
  });
}
