import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/app/lib/adminAuth';
import {
  appendAuditLog,
  getReservationByNumber,
} from '@/app/lib/reservationsStore.server';
import { generateReservationConfirmationPdf } from '@/app/lib/pdfConfirmation.server';
import { getRequestPublicOrigin } from '@/app/lib/reservationVerification.server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ reservationNumber: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { reservationNumber: rawRef } = await context.params;
    const ref = decodeURIComponent(rawRef);
    const reservation = await getReservationByNumber(ref);
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 });
    }

    const pdf = await generateReservationConfirmationPdf(reservation, {
      originOverride: getRequestPublicOrigin(req),
    });

    await appendAuditLog({
      action: 'reservation.pdf_exported',
      reservationNumber: reservation.reservationNumber,
      actorEmail: session.email,
      actorRole: 'admin',
      details: `PDF généré et téléchargé (Statut au moment de l'export : ${reservation.status}).`,
    }).catch(() => {});

    return new NextResponse(new Uint8Array(pdf.buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdf.filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[API /admin/reservations/[ref]/pdf GET] error:', err);
    return NextResponse.json(
      { error: 'Impossible de générer la confirmation PDF.' },
      { status: 500 }
    );
  }
}
