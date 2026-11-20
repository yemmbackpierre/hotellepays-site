import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, readAdminsFromFile } from '@/app/lib/adminAuth';
import {
  isValidClientEmail,
  issueClientOtp,
  maskEmail,
  normalizeClientEmail,
} from '@/app/lib/clientAuth.server';
import { sendClientVerificationCodeEmail } from '@/app/lib/email.server';
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

    let targetEmail = rawEmail;
    let resolvedViaReference = false;

    if (!targetEmail && rawReference) {
      const booking = await bookingsService.getByReservationNumber(rawReference);
      if (!booking?.customer?.email) {
        // Generic response avoids confirming existence of arbitrary reservation numbers
        return NextResponse.json({
          success: true,
          viaReference: true,
          maskedEmail: '',
          message:
            'Si cette référence correspond à une réservation, un code de vérification a été envoyé à l’adresse e-mail associée.',
        });
      }
      targetEmail = booking.customer.email;
      resolvedViaReference = true;
    }

    if (!isValidClientEmail(targetEmail)) {
      return NextResponse.json(
        { success: false, error: 'Veuillez saisir une adresse e-mail valide.' },
        { status: 400 }
      );
    }

    const normalized = normalizeClientEmail(targetEmail);
    const admins = await readAdminsFromFile();
    const isAdminEmail = admins.some(
      (a) => normalizeClientEmail(a.email) === normalized
    );

    if (isAdminEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cet espace est exclusivement réservé aux clients. Les comptes administrateurs doivent utiliser l'interface /lepays-dsb.",
        },
        { status: 403 }
      );
    }

    const otpResult = await issueClientOtp(normalized);
    if (!otpResult.ok) {
      return NextResponse.json(
        { success: false, error: otpResult.error },
        { status: otpResult.retryAfterSeconds ? 429 : 400 }
      );
    }

    const mailResult = await sendClientVerificationCodeEmail({
      email: otpResult.email,
      code: otpResult.code,
      expiresInMinutes: otpResult.expiresInMinutes,
    });

    if (!mailResult.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            mailResult.error ||
            "Impossible d'envoyer le code de vérification par e-mail pour le moment.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      viaReference: resolvedViaReference,
      maskedEmail: maskEmail(otpResult.email),
      expiresInMinutes: otpResult.expiresInMinutes,
      mode: mailResult.mode,
      message: resolvedViaReference
        ? `Un code de vérification unique a été envoyé à ${maskEmail(otpResult.email)}.`
        : `Un code de vérification unique vient d'être envoyé à ${otpResult.email}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
