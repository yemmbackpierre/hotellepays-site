import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, getAdminCookieConfig } from '@/app/lib/adminAuth';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    ...getAdminCookieConfig(req),
    maxAge: 0,
  });
  return res;
}
