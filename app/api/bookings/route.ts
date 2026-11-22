import { NextRequest, NextResponse } from 'next/server';
import { bookingsService } from '@/app/services/bookings.service';
import { verifyAndComputeBookingPricing } from '@/app/lib/pricingVerification.server';
import { sendReservationConfirmationEmails } from '@/app/lib/email.server';
import {
  appendAuditLog,
  updateReservationRecord,
} from '@/app/lib/reservationsStore.server';
import { sendManagerBookingWhatsApp } from '@/app/lib/whatsapp.server';
import { getAdminCookieConfig, getAdminSession } from '@/app/lib/adminAuth';
import { getClientSession, GUEST_EMAIL_COOKIE } from '@/app/lib/clientAuth.server';
import type { EmailReceiptSummary, WhatsAppNotificationSummary } from '@/app/types/reservation';

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

    // Send confirmation emails (non-blocking if SMTP/Resend fails)
    let emailReceipt: EmailReceiptSummary | undefined;
    try {
      emailReceipt = await sendReservationConfirmationEmails(result.reservation);
    } catch (emailErr) {
      console.error('[API /bookings POST] Email dispatch failed:', emailErr);
    }

    // Send automatic WhatsApp notification to manager (strictly non-blocking, never simulated)
    let whatsappNotification: WhatsAppNotificationSummary;
    try {
      whatsappNotification = await sendManagerBookingWhatsApp(result.reservation);
    } catch (waErr) {
      whatsappNotification = {
        configured: false,
        sent: false,
        provider: 'meta-cloud-api',
        sentAt: new Date().toISOString(),
        error: waErr instanceof Error ? waErr.message : String(waErr),
      };
    }

    const updatedReservation =
      (await updateReservationRecord(result.reservation.reservationNumber, {
        ...(emailReceipt ? { emailReceipt } : {}),
        whatsappNotification,
      })) || {
        ...result.reservation,
        ...(emailReceipt ? { emailReceipt } : {}),
        whatsappNotification,
      };

    // Log creation & manager WhatsApp attempt cleanly without exposing secrets
    try {
      await appendAuditLog({
        action: 'booking.created',
        reservationNumber: updatedReservation.reservationNumber,
        actorEmail: updatedReservation.customer?.email || 'client',
        actorRole: 'client',
        details: `Nouvelle réservation enregistrée (Statut: ${updatedReservation.status}, Total: ${updatedReservation.total} XOF).`,
        metadata: {
          whatsappSent: Boolean(whatsappNotification.sent),
          whatsappConfigured: Boolean(whatsappNotification.configured),
          emailUserSent: Boolean(emailReceipt?.userSent),
          emailAdminSent: Boolean(emailReceipt?.adminSent),
        },
      });
    } catch {
      // Never block booking completion due to audit write failure
    }

    const response = NextResponse.json({
      success: true,
      data: {
        ...result,
        reservation: updatedReservation,
        verified,
        emailReceipt,
        whatsappNotification: {
          configured: whatsappNotification.configured,
          sent: whatsappNotification.sent,
          provider: whatsappNotification.provider,
          ...(whatsappNotification.sentAt ? { sentAt: whatsappNotification.sentAt } : {}),
        },
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

    const finalized =
      (await updateReservationRecord(reservationNumber, {
        cancelledAt: new Date().toISOString(),
        cancelledBy: email,
        cancellationReason: 'Annulation demandée par le client depuis son espace personnel',
      })) || updated;

    await appendAuditLog({
      action: 'reservation.cancelled',
      reservationNumber,
      actorEmail: email,
      actorRole: 'client',
      details: 'Annulation effectuée depuis l’espace client.',
    }).catch(() => {});

    return NextResponse.json({ success: true, reservation: finalized });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
