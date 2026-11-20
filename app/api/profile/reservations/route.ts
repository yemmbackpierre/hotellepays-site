import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/app/lib/adminAuth';
import { getClientSession } from '@/app/lib/clientAuth.server';
import { bookingsService } from '@/app/services/bookings.service';

export async function GET(request: NextRequest) {
  const adminSession = await getAdminSession();
  if (adminSession) {
    return NextResponse.json(
      {
        success: false,
        error: 'Accès refusé : cette interface est exclusivement réservée aux clients.',
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
    const url = new URL(request.url);
    const reference = (url.searchParams.get('reference') || '').trim();
    const allForClient = await bookingsService.listByEmail(clientSession.email);

    if (!reference) {
      return NextResponse.json({
        success: true,
        reference: '',
        reservations: allForClient,
        exactMatch: null,
      });
    }

    const q = reference.toLowerCase();
    const matches = allForClient.filter((item) =>
      (item.reservationNumber || '').toLowerCase().includes(q)
    );
    const exactMatch =
      allForClient.find(
        (item) => (item.reservationNumber || '').toLowerCase() === q
      ) || null;

    return NextResponse.json({
      success: true,
      reference,
      reservations: matches,
      exactMatch,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
