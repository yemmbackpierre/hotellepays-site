import { NextResponse } from 'next/server';
import { uploadBuffer } from '@/app/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const entries = form.getAll('files'); // expecting 'files' multiple
    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: 'no files' }, { status: 400 });
    }

    const uploaded: Array<{ url: string; public_id: string }> = [];

    for (const entry of entries) {
      const file = entry as any;
      const buffer = Buffer.from(await file.arrayBuffer());
      const res = await uploadBuffer(buffer);
      uploaded.push({ url: res.secure_url, public_id: res.public_id });
    }

    return NextResponse.json({ uploaded });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

