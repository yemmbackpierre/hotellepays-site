import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/app/lib/adminAuth';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Image trop volumineuse (max 10 Mo).' },
        { status: 400 }
      );
    }

    const originalExt = path.extname(file.name).toLowerCase() || '.jpg';
    const ext = ALLOWED_EXTENSIONS.has(originalExt) ? originalExt : '.jpg';
    const baseName = path
      .basename(file.name, path.extname(file.name))
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'image';

    const filename = `${Date.now()}-${baseName}${ext}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({
      ok: true,
      url: `/api/uploads/${filename}`,
      filename,
    });
  } catch (err) {
    console.error('[API /admin/upload] error:', err);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'image." },
      { status: 500 }
    );
  }
}
