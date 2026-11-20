import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/app/lib/adminAuth';
import {
  getSiteContent,
  resetSiteContent,
  saveSiteContent,
} from '@/app/lib/siteContent';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const content = await getSiteContent();
  return NextResponse.json({ ok: true, content });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const updated = await saveSiteContent(body);
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, content: updated });
  } catch (err) {
    console.error('[API /admin/content PUT] error:', err);
    return NextResponse.json(
      { error: 'Impossible de sauvegarder le contenu.' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const reset = await resetSiteContent();
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, content: reset });
  } catch (err) {
    console.error('[API /admin/content DELETE] error:', err);
    return NextResponse.json(
      { error: 'Impossible de réinitialiser le contenu.' },
      { status: 500 }
    );
  }
}
