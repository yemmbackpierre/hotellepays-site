import { NextResponse } from 'next/server';
import { getAdminSession } from '@/app/lib/adminAuth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    admin: {
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
