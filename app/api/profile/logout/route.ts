import { NextRequest, NextResponse } from 'next/server';
import { CLIENT_SESSION_COOKIE, getClientCookieConfig } from '@/app/lib/clientAuth.server';
import { GUEST_EMAIL_COOKIE } from '@/app/api/bookings/route';

export async function POST(request: NextRequest) {
  const res = NextResponse.json({ success: true });
  const cookieCfg = getClientCookieConfig(request);
  res.cookies.set({
    name: CLIENT_SESSION_COOKIE,
    value: '',
    ...cookieCfg,
    maxAge: 0,
  });
  res.cookies.set({
    name: GUEST_EMAIL_COOKIE,
    value: '',
    ...cookieCfg,
    maxAge: 0,
  });
  return res;
}
