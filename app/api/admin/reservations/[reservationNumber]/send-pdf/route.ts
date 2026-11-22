import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/app/lib/adminAuth';
import {
  appendAuditLog,
  getReservationByNumber,
  updateReservationRecord,
} from '@/app/lib/reservationsStore.server';
import { generateReservationConfirmationPdf } from '@/app/lib/pdfConfirmation.server';
import { sendReservationPdfEmailToClient } from '@/app/lib/email.server';
import {
  getRequestPublicOrigin,
  isSameOriginAdminRequest,
} from '@/app/lib/reservationVerification.server';
import { sendClientReservationWhatsApp } from '@/app/lib/whatsapp.server';
import type { ReservationPdfDispatchSummary } from '@/app/types/reservation';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ reservationNumber: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  if (!isSameOriginAdminRequest(req)) {
    return NextResponse.json({ error: 'Origine de requête non autorisée.' }, { status: 403 });
  }

  try {
    const { reservationNumber: rawRef } = await context.params;
    const ref = decodeURIComponent(rawRef);
    const reservation = await getReservationByNumber(ref);
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 });
    }

    const body = (await req.json()) as { channel?: 'email' | 'whatsapp' };
    const channel = body?.channel === 'whatsapp' ? 'whatsapp' : 'email';

    // Strict business rule (Section 4): do not send an official confirmation document for pending or cancelled bookings
    if (reservation.status === 'pending') {
      return NextResponse.json(
        {
          error:
            "Impossible d'envoyer une confirmation officielle tant que la réservation est en attente : veuillez d'abord valider la réservation.",
        },
        { status: 400 }
      );
    }
    if (reservation.status === 'cancelled') {
      return NextResponse.json(
        {
          error:
            "Impossible d'envoyer une confirmation officielle pour une réservation annulée.",
        },
        { status: 400 }
      );
    }

    const originOverride = getRequestPublicOrigin(req);

    if (channel === 'email') {
      const pdf = await generateReservationConfirmationPdf(reservation, { originOverride });
      const emailRes = await sendReservationPdfEmailToClient({
        reservation,
        pdfBuffer: pdf.buffer,
        filename: pdf.filename,
        verificationUrl: pdf.verificationUrl,
      });

      const entry: ReservationPdfDispatchSummary = {
        channel: 'email',
        sent: emailRes.ok,
        sentAt: new Date().toISOString(),
        sentBy: session.email,
        recipient: emailRes.recipientEmail,
        mode: emailRes.mode,
        messageId: emailRes.messageId,
        ...(emailRes.error ? { error: emailRes.error } : {}),
      };

      const nextHistory = [entry, ...(reservation.pdfHistory || [])].slice(0, 30);
      const updated = await updateReservationRecord(reservation.reservationNumber, {
        pdfHistory: nextHistory,
      });

      await appendAuditLog({
        action: 'reservation.pdf_emailed',
        reservationNumber: reservation.reservationNumber,
        actorEmail: session.email,
        actorRole: 'admin',
        details: emailRes.ok
          ? `PDF officiel envoyé par e-mail à ${emailRes.recipientEmail} (mode: ${emailRes.mode}).`
          : `Échec envoi PDF par e-mail : ${emailRes.error || 'inconnu'}`,
      });

      if (!emailRes.ok) {
        return NextResponse.json(
          { error: emailRes.error || "Échec de l'envoi par e-mail.", reservation: updated },
          { status: 502 }
        );
      }

      return NextResponse.json({
        ok: true,
        channel: 'email',
        result: emailRes,
        reservation: updated,
      });
    }

    // Channel === 'whatsapp'
    const waRes = await sendClientReservationWhatsApp(reservation, originOverride);
    const entry: ReservationPdfDispatchSummary = {
      channel: 'whatsapp',
      sent: waRes.sent,
      sentAt: waRes.sentAt || new Date().toISOString(),
      sentBy: session.email,
      recipient: reservation.customer?.phone || '',
      mode: waRes.provider,
      messageId: waRes.messageId,
      ...(waRes.error ? { error: waRes.error } : {}),
    };

    const nextHistory = [entry, ...(reservation.pdfHistory || [])].slice(0, 30);
    const updated = await updateReservationRecord(reservation.reservationNumber, {
      pdfHistory: nextHistory,
    });

    await appendAuditLog({
      action: 'reservation.pdf_whatsapp_sent',
      reservationNumber: reservation.reservationNumber,
      actorEmail: session.email,
      actorRole: 'admin',
      details: waRes.sent
        ? `Confirmation envoyée par WhatsApp Cloud API (${waRes.messageId}).`
        : `Envoi WhatsApp non effectué : ${waRes.error || 'non configuré'}`,
    });

    if (!waRes.sent) {
      return NextResponse.json(
        {
          error:
            waRes.error ||
            "L'envoi WhatsApp n'a pas été confirmé par le fournisseur Meta Cloud API.",
          result: waRes,
          reservation: updated,
        },
        { status: waRes.configured ? 502 : 422 }
      );
    }

    return NextResponse.json({
      ok: true,
      channel: 'whatsapp',
      result: waRes,
      reservation: updated,
    });
  } catch (err) {
    console.error('[API /admin/reservations/[ref]/send-pdf POST] error:', err);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi au client." },
      { status: 500 }
    );
  }
}
