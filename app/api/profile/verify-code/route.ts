import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, readAdminsFromFile } from '@/app/lib/adminAuth';
import {
  CLIENT_SESSION_COOKIE,
  createClientSessionToken,
  getClientCookieConfig,
  getMergedClientProfile,
  normalizeClientEmail,
  verifyClientOtp,
} from '@/app/lib/clientAuth.server';
import { bookingsService } from '@/app/services/bookings.service';

export async function POST(request: NextRequest) {
  const adminSession = await getAdminSession();
  if (adminSession) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Accès refusé : cet espace est exclusivement destiné aux clients. Déconnectez-vous de l'interface administrateur pour y accéder.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const rawEmail = typeof body?.email === 'string' ? body.email.trim() : '';
    const rawReference =
      typeof body?.reservationNumber === 'string' ? body.reservationNumber.trim() : '';
    const rawCode = typeof body?.code === 'string' ? body.code.trim() : '';

    let targetEmail = rawEmail;
    if (!targetEmail && rawReference) {
      const booking = await bookingsService.getByReservationNumber(rawReference);
      targetEmail = booking?.customer?.email || '';
    }

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Adresse e-mail ou référence invalide.' },
        { status: 400 }
      );
    }

    const normalized = normalizeClientEmail(targetEmail);
    const admins = await readAdminsFromFile();
    if (admins.some((a) => normalizeClientEmail(a.email) === normalized)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cet espace est exclusivement réservé aux clients. Les comptes administrateurs ne peuvent pas s'y connecter.",
        },
        { status: 403 }
      );
    }

    const verifyResult = await verifyClientOtp(normalized, rawCode);
    if (!verifyResult.ok) {
      return NextResponse.json(
        { success: false, error: verifyResult.error },
        { status: 401 }
      );
    }

    const [profile, reservations] = await Promise.all([
      getMergedClientProfile(verifyResult.email),
      bookingsService.listByEmail(verifyResult.email),
    ]);

    const token = createClientSessionToken(verifyResult.email);
    const res = NextResponse.json({
      success: true,
      authenticated: true,
      email: verifyResult.email,
      profile,
      reservations,
    });

    res.cookies.set({
      name: CLIENT_SESSION_COOKIE,
      value: token,
      ...getClientCookieConfig(request),
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
