import { NextRequest, NextResponse } from 'next/server';
import { bookingsService } from '@/app/services/bookings.service';
import { sendReservationConfirmationEmails } from '@/app/lib/email.server';
import { updateReservationRecord } from '@/app/lib/reservationsStore.server';
import { getAdminSession } from '@/app/lib/adminAuth';
import { getClientSession } from '@/app/lib/clientAuth.server';

export async function POST(request: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (adminSession) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé : espace exclusivement réservé aux clients.' },
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

    const body = await request.json();
    const reservationNumber =
      typeof body?.reservationNumber === 'string' ? body.reservationNumber.trim() : '';

    if (!reservationNumber) {
      return NextResponse.json(
        { success: false, error: 'Numéro de réservation requis.' },
        { status: 400 }
      );
    }

    const existing = await bookingsService.getByReservationNumber(reservationNumber);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Réservation introuvable.' },
        { status: 404 }
      );
    }

    if (
      existing.customer?.email?.trim().toLowerCase() !==
      clientSession.email.trim().toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé pour renvoyer ce reçu.' },
        { status: 403 }
      );
    }

    const emailReceipt = await sendReservationConfirmationEmails(existing);
    const updated =
      (await updateReservationRecord(existing.reservationNumber, { emailReceipt })) || {
        ...existing,
        emailReceipt,
      };

    return NextResponse.json({
      success: true,
      emailReceipt,
      reservation: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
