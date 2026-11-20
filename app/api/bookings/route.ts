import { NextRequest, NextResponse } from 'next/server';
import { bookingsService } from '@/app/services/bookings.service';
import { verifyAndComputeBookingPricing } from '@/app/lib/pricingVerification.server';
import { sendReservationConfirmationEmails } from '@/app/lib/email.server';
import { updateReservationRecord } from '@/app/lib/reservationsStore.server';
import { getAdminCookieConfig, getAdminSession } from '@/app/lib/adminAuth';
import { getClientSession } from '@/app/lib/clientAuth.server';

export const GUEST_EMAIL_COOKIE = 'lepays_guest_email';

export async function GET() {
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

    const reservations = await bookingsService.listByEmail(clientSession.email);
    return NextResponse.json({
      success: true,
      email: clientSession.email,
      reservations,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const verified = await verifyAndComputeBookingPricing(payload);
    const result = await bookingsService.createBooking({
      ...payload,
      total_amount: verified.verifiedTotal,
      total: verified.verifiedTotal,
      offer: verified.offer,
      nights: verified.nights,
    });

    const emailReceipt = await sendReservationConfirmationEmails(result.reservation);
    const updatedReservation =
      (await updateReservationRecord(result.reservation.reservationNumber, {
        emailReceipt,
      })) || {
        ...result.reservation,
        emailReceipt,
      };

    const response = NextResponse.json({
      success: true,
      data: {
        ...result,
        reservation: updatedReservation,
        verified,
        emailReceipt,
      },
    });

    const customerEmail = updatedReservation.customer?.email?.trim();
    if (customerEmail) {
      response.cookies.set({
        name: GUEST_EMAIL_COOKIE,
        value: customerEmail,
        ...getAdminCookieConfig(request),
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const status = body?.status === 'cancelled' ? 'cancelled' : null;
    const email = clientSession.email;

    if (!reservationNumber || !status || !email) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants pour mettre à jour la réservation.' },
        { status: 400 }
      );
    }

    const updated = await bookingsService.updateStatus(reservationNumber, email, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Réservation introuvable.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, reservation: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
