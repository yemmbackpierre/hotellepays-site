import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/app/lib/adminAuth';
import {
  appendAuditLog,
  deleteReservationRecord,
  getReservationByNumber,
  readAuditLogs,
  updateReservationRecord,
} from '@/app/lib/reservationsStore.server';
import {
  buildReservationVerificationUrl,
  getRequestPublicOrigin,
  isSameOriginAdminRequest,
} from '@/app/lib/reservationVerification.server';
import type { PaymentStatus, StoredReservation } from '@/app/types/reservation';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ reservationNumber: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { reservationNumber } = await context.params;
  const reservation = await getReservationByNumber(decodeURIComponent(reservationNumber));
  if (!reservation) {
    return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 });
  }

  const auditLogs = await readAuditLogs(reservation.reservationNumber);
  const verificationUrl = buildReservationVerificationUrl(
    reservation.reservationNumber,
    reservation.createdAt,
    getRequestPublicOrigin(req)
  );
  return NextResponse.json({ ok: true, reservation, auditLogs, verificationUrl });
}

export async function PATCH(
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
    const existing = await getReservationByNumber(ref);
    if (!existing) {
      return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 });
    }

    const body = (await req.json()) as {
      action?: 'validate' | 'cancel' | 'complete' | 'updatePayment';
      cancellationReason?: string;
      paymentStatus?: PaymentStatus;
    };

    const action = body?.action;
    const nowIso = new Date().toISOString();

    if (action === 'validate') {
      if (existing.status === 'cancelled') {
        return NextResponse.json(
          { error: 'Une réservation annulée ne peut pas être validée.' },
          { status: 400 }
        );
      }

      if (existing.status === 'confirmed') {
        return NextResponse.json({
          ok: true,
          reservation: existing,
          alreadyValidated: true,
        });
      }

      const patch: Partial<StoredReservation> = {
        status: 'confirmed',
        validatedAt: nowIso,
        validatedBy: session.email,
      };
      if (
        body.paymentStatus === 'paid' ||
        body.paymentStatus === 'partial' ||
        body.paymentStatus === 'unpaid'
      ) {
        patch.paymentStatus = body.paymentStatus;
      }

      const updated = await updateReservationRecord(existing.reservationNumber, patch);
      if (updated) {
        await appendAuditLog({
          action: 'reservation.validated',
          reservationNumber: updated.reservationNumber,
          actorEmail: session.email,
          actorRole: 'admin',
          details: `Réservation validée (${existing.status} -> confirmed).`,
        });
      }
      return NextResponse.json({ ok: true, reservation: updated });
    }

    if (action === 'complete') {
      if (existing.status === 'cancelled') {
        return NextResponse.json(
          { error: 'Une réservation annulée ne peut pas être marquée comme terminée.' },
          { status: 400 }
        );
      }
      if (existing.status === 'completed') {
        return NextResponse.json({ ok: true, reservation: existing });
      }
      const updated = await updateReservationRecord(existing.reservationNumber, {
        status: 'completed',
        completedAt: nowIso,
        completedBy: session.email,
      });
      if (updated) {
        await appendAuditLog({
          action: 'reservation.completed',
          reservationNumber: updated.reservationNumber,
          actorEmail: session.email,
          actorRole: 'admin',
          details: 'Séjour marqué comme terminé par l’administrateur.',
        });
      }
      return NextResponse.json({ ok: true, reservation: updated });
    }

    if (action === 'cancel') {
      const reason =
        typeof body?.cancellationReason === 'string' ? body.cancellationReason.trim() : '';
      if (!reason || reason.length < 3) {
        return NextResponse.json(
          { error: "Un motif d'annulation explicite (min. 3 caractères) est obligatoire." },
          { status: 400 }
        );
      }
      const updated = await updateReservationRecord(existing.reservationNumber, {
        status: 'cancelled',
        cancelledAt: nowIso,
        cancelledBy: session.email,
        cancellationReason: reason,
      });
      if (updated) {
        await appendAuditLog({
          action: 'reservation.cancelled',
          reservationNumber: updated.reservationNumber,
          actorEmail: session.email,
          actorRole: 'admin',
          details: `Réservation annulée. Motif : ${reason}`,
        });
      }
      return NextResponse.json({ ok: true, reservation: updated });
    }

    if (action === 'updatePayment') {
      const paymentStatus = body?.paymentStatus;
      if (
        paymentStatus !== 'unpaid' &&
        paymentStatus !== 'partial' &&
        paymentStatus !== 'paid'
      ) {
        return NextResponse.json(
          { error: 'Statut de paiement invalide.' },
          { status: 400 }
        );
      }
      const updated = await updateReservationRecord(existing.reservationNumber, {
        paymentStatus,
      });
      if (updated) {
        await appendAuditLog({
          action: 'reservation.payment_updated',
          reservationNumber: updated.reservationNumber,
          actorEmail: session.email,
          actorRole: 'admin',
          details: `Statut de paiement mis à jour : ${paymentStatus}.`,
        });
      }
      return NextResponse.json({ ok: true, reservation: updated });
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 });
  } catch (err) {
    console.error('[API /admin/reservations/[ref] PATCH] error:', err);
    return NextResponse.json(
      { error: 'Impossible de mettre à jour la réservation.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const removed = await deleteReservationRecord(ref);
    if (!removed) {
      return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 });
    }

    await appendAuditLog({
      action: 'reservation.deleted',
      reservationNumber: removed.reservationNumber,
      actorEmail: session.email,
      actorRole: 'admin',
      details: `Réservation supprimée (${removed.customer?.name || ''} · ${removed.total} XOF).`,
    });

    return NextResponse.json({ ok: true, deletedReservationNumber: removed.reservationNumber });
  } catch (err) {
    console.error('[API /admin/reservations/[ref] DELETE] error:', err);
    return NextResponse.json(
      { error: 'Impossible de supprimer la réservation.' },
      { status: 500 }
    );
  }
}
