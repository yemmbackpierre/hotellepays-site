import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/app/lib/adminAuth';
import {
  queryAllReservations,
  readAuditLogs,
} from '@/app/lib/reservationsStore.server';
import {
  getPaymentStatusLabelFr,
  getReservationStatusLabelFr,
  getServerNotificationSettings,
} from '@/app/lib/whatsapp.server';
import { escapeCsvCell } from '@/app/lib/reservationVerification.server';
import type { ReservationStatus } from '@/app/types/reservation';

const VALID_STATUSES = new Set(['all', 'pending', 'confirmed', 'cancelled', 'completed']);
const VALID_SORTS = new Set([
  'createdAt_desc',
  'createdAt_asc',
  'arrival_asc',
  'arrival_desc',
  'total_desc',
]);

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get('q') || '';
    const rawStatus = sp.get('status') || 'all';
    const status = VALID_STATUSES.has(rawStatus)
      ? (rawStatus as 'all' | ReservationStatus)
      : 'all';
    const from = sp.get('from') || '';
    const to = sp.get('to') || '';
    const rawSort = sp.get('sort') || 'createdAt_desc';
    const sort = VALID_SORTS.has(rawSort)
      ? (rawSort as
          | 'createdAt_desc'
          | 'createdAt_asc'
          | 'arrival_asc'
          | 'arrival_desc'
          | 'total_desc')
      : 'createdAt_desc';
    const page = Number(sp.get('page') || 1);
    const pageSize = Number(sp.get('pageSize') || 15);
    const format = sp.get('format') || 'json';

    const result = await queryAllReservations({
      q,
      status,
      from,
      to,
      sort,
      page,
      pageSize,
    });

    if (format === 'csv') {
      const headers = [
        'Référence',
        'Client',
        'Téléphone',
        'E-mail',
        'Hébergement',
        'Arrivée',
        'Départ',
        'Nuits',
        'Chambres',
        'Montant (XOF)',
        'Statut',
        'Paiement',
        'Date création',
      ];
      const rows = result.allFiltered.map((r) => {
        const roomDesc = Object.values(r.rooms || {})
          .map((rm) => `${(rm.type || 'Chambre').toUpperCase()} (${rm.clim === 'oui' || rm.type === 'suite' ? 'Clim' : 'Ventilé'})`)
          .join(' | ');
        const lodging = r.offer ? `${r.offer.title} - ${roomDesc}` : roomDesc || 'Chambre';
        return [
          r.reservationNumber,
          r.customer?.name || '',
          r.customer?.phone || '',
          r.customer?.email || '',
          lodging,
          r.arrival || '',
          r.departure || '',
          r.nights,
          r.numRooms,
          r.total,
          getReservationStatusLabelFr(r.status),
          getPaymentStatusLabelFr(r.paymentStatus),
          r.createdAt || '',
        ]
          .map(escapeCsvCell)
          .join(';');
      });

      const csvContent = `\uFEFF${headers.map(escapeCsvCell).join(';')}\n${rows.join('\n')}`;
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="reservations-hotel-le-pays-${new Date()
            .toISOString()
            .slice(0, 10)}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const notif = getServerNotificationSettings();
    const recentAuditLogs = (await readAuditLogs()).slice(0, 40);

    return NextResponse.json({
      ok: true,
      reservations: result.items,
      totalCount: result.totalCount,
      stats: result.stats,
      page: result.page,
      pageSize: result.pageSize,
      auditLogs: recentAuditLogs,
      configStatus: {
        whatsappProviderConfigured: notif.whatsappProviderConfigured,
        notificationNumberConfigured: Boolean(notif.notificationNumber),
        notificationEmailConfigured: Boolean(notif.notificationEmail),
        mailConfigured: Boolean(
          (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
            process.env.RESEND_API_KEY
        ),
      },
    });
  } catch (err) {
    console.error('[API /admin/reservations GET] error:', err);
    return NextResponse.json(
      { error: 'Impossible de charger les réservations.' },
      { status: 500 }
    );
  }
}
