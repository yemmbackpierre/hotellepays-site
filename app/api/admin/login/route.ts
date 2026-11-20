import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  getAdminCookieConfig,
  verifyAdminCredentials,
} from '@/app/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Veuillez saisir votre email et votre mot de passe.' },
        { status: 400 }
      );
    }

    const admin = await verifyAdminCredentials(email, password);
    if (!admin) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect.' },
        { status: 401 }
      );
    }

    const token = createSessionToken(admin);
    const res = NextResponse.json({ ok: true, admin });
    res.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      ...getAdminCookieConfig(req),
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error('[API /admin/login] error:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion.' },
      { status: 500 }
    );
  }
}
