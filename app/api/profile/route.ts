import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/app/lib/adminAuth';
import {
  getClientSession,
  getMergedClientProfile,
  saveClientProfileToServer,
} from '@/app/lib/clientAuth.server';
import { bookingsService } from '@/app/services/bookings.service';

export async function GET() {
  const adminSession = await getAdminSession();
  if (adminSession) {
    return NextResponse.json(
      {
        success: false,
        error: 'Accès refusé : cet espace est exclusivement destiné aux clients.',
      },
      { status: 403 }
    );
  }

  const clientSession = await getClientSession();
  if (!clientSession) {
    return NextResponse.json({
      success: true,
      authenticated: false,
      email: '',
      profile: null,
      reservations: [],
    });
  }

  const [profile, reservations] = await Promise.all([
    getMergedClientProfile(clientSession.email),
    bookingsService.listByEmail(clientSession.email),
  ]);

  return NextResponse.json({
    success: true,
    authenticated: true,
    email: clientSession.email,
    profile,
    reservations,
  });
}

export async function PUT(request: NextRequest) {
  const adminSession = await getAdminSession();
  if (adminSession) {
    return NextResponse.json(
      {
        success: false,
        error: 'Accès refusé : cet espace est exclusivement destiné aux clients.',
      },
      { status: 403 }
    );
  }

  const clientSession = await getClientSession();
  if (!clientSession) {
    return NextResponse.json(
      { success: false, error: 'Authentification client requise.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const profile = await saveClientProfileToServer(clientSession.email, {
      name: typeof body?.name === 'string' ? body.name : undefined,
      phone: typeof body?.phone === 'string' ? body.phone : undefined,
      whatsapp: typeof body?.whatsapp === 'boolean' ? body.whatsapp : undefined,
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
