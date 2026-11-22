import type {
  PaymentStatus,
  ReservationStatus,
  StoredReservation,
  WhatsAppNotificationSummary,
} from '@/app/types/reservation';
import { formatEmailDateFr, formatEmailXof, formatNumberFr } from '@/app/lib/emailTemplates';
import { buildReservationVerificationUrl } from '@/app/lib/reservationVerification.server';

export function getServerNotificationSettings() {
  const notificationNumber = (process.env.NOTIFICATIONNUMBER || '').trim();
  const notificationEmail = (process.env.NOTIFICATIONEMAIL || '').trim();
  const whatsappAccessToken = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const whatsappPhoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const whatsappApiVersion = (process.env.WHATSAPP_API_VERSION || 'v21.0').trim();
  const whatsappTemplateName = (process.env.WHATSAPP_TEMPLATE_NAME || '').trim();
  const whatsappTemplateLang = (process.env.WHATSAPP_TEMPLATE_LANG || 'fr').trim();

  return {
    notificationNumber,
    notificationEmail,
    whatsappAccessToken,
    whatsappPhoneNumberId,
    whatsappApiVersion,
    whatsappTemplateName,
    whatsappTemplateLang,
    whatsappProviderConfigured: Boolean(whatsappAccessToken && whatsappPhoneNumberId),
  };
}

export function normalizeWhatsAppPhoneNumber(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

export function getReservationStatusLabelFr(status: ReservationStatus): string {
  switch (status) {
    case 'confirmed':
      return 'Confirmée';
    case 'cancelled':
      return 'Annulée';
    case 'completed':
      return 'Terminée';
    case 'pending':
    default:
      return 'En attente de validation';
  }
}

export function getPaymentStatusLabelFr(paymentStatus?: PaymentStatus): string {
  switch (paymentStatus) {
    case 'paid':
      return 'Réglée';
    case 'partial':
      return 'Acompte réglé';
    case 'unpaid':
    default:
      return 'Non réglée (paiement à confirmer)';
  }
}

function summarizeRoomsForWhatsApp(reservation: StoredReservation): string {
  const entries = Object.values(reservation.rooms || {});
  if (entries.length === 0) {
    return `${reservation.numRooms || 1} chambre(s)`;
  }
  const summaryParts = entries.map((r, i) => {
    const type = (r.type || 'Chambre').toUpperCase();
    const comfort = r.type === 'suite' ? 'Clim inclus' : r.clim === 'oui' ? 'Climatisée' : 'Ventilée';
    return `Ch.${i + 1}: ${type} (${comfort}, ${r.adults || 1}A/${r.children || 0}E)`;
  });
  return summaryParts.join(' | ');
}

function countGuests(reservation: StoredReservation): number {
  const entries = Object.values(reservation.rooms || {});
  if (entries.length === 0) return 1;
  return entries.reduce(
    (sum, r) => sum + Math.max(0, Number(r.adults || 0)) + Math.max(0, Number(r.children || 0)),
    0
  );
}

export function buildManagerWhatsAppMessageText(reservation: StoredReservation): string {
  const totalGuests = countGuests(reservation);
  const statusLabel = getReservationStatusLabelFr(reservation.status);
  const roomDetails = summarizeRoomsForWhatsApp(reservation);
  const offerPart = reservation.offer ? ` | Offre: ${reservation.offer.title}` : '';
  const currencyConverted =
    reservation.currency &&
    reservation.currency.code !== 'XOF' &&
    typeof reservation.currency.totalConverted === 'number'
      ? ` (${formatNumberFr(reservation.currency.totalConverted, 2)} ${reservation.currency.symbol})`
      : '';

  return [
    'NOUVELLE RÉSERVATION — HÔTEL LE PAYS',
    '----------------------------------------',
    `Référence : ${reservation.reservationNumber}`,
    `Statut : ${statusLabel}`,
    `Établissement : Hôtel Le Pays (Sendou, Dakar)`,
    `Hébergement : ${roomDetails}${offerPart}`,
    `Client : ${reservation.customer?.name || 'Non précisé'}`,
    `Téléphone : ${reservation.customer?.phone || 'Non précisé'}`,
    `E-mail : ${reservation.customer?.email || 'Non précisé'}`,
    `Arrivée : ${formatEmailDateFr(reservation.arrival)}`,
    `Départ : ${formatEmailDateFr(reservation.departure)}`,
    `Personnes : ${totalGuests} personne(s) · ${reservation.nights} nuit(s)`,
    `Montant total : ${formatEmailXof(reservation.total)}${currencyConverted}`,
    `Créée le : ${formatEmailDateFr(reservation.createdAt)}`,
  ].join('\n');
}

async function sendMetaCloudApiMessage(params: {
  recipientPhoneRaw: string;
  textBody: string;
  templateBodyValues?: string[];
  allowTemplateOverride?: boolean;
}): Promise<WhatsAppNotificationSummary> {
  const cfg = getServerNotificationSettings();
  const attemptedAt = new Date().toISOString();

  if (!cfg.whatsappProviderConfigured) {
    return {
      configured: false,
      sent: false,
      provider: 'meta-cloud-api',
      sentAt: attemptedAt,
      error:
        "Fournisseur WhatsApp Business Cloud API non configuré (WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID manquant).",
    };
  }

  const normalizedTo = normalizeWhatsAppPhoneNumber(params.recipientPhoneRaw);
  if (!normalizedTo) {
    return {
      configured: true,
      sent: false,
      provider: 'meta-cloud-api',
      sentAt: attemptedAt,
      error: 'Numéro WhatsApp destinataire manquant ou invalide.',
    };
  }

  const endpoint = `https://graph.facebook.com/${cfg.whatsappApiVersion}/${encodeURIComponent(
    cfg.whatsappPhoneNumberId
  )}/messages`;

  const useTemplate = Boolean(
    params.allowTemplateOverride &&
      cfg.whatsappTemplateName &&
      Array.isArray(params.templateBodyValues) &&
      params.templateBodyValues.length > 0
  );

  const payload = useTemplate
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedTo,
        type: 'template',
        template: {
          name: cfg.whatsappTemplateName,
          language: { code: cfg.whatsappTemplateLang || 'fr' },
          components: [
            {
              type: 'body',
              parameters: (params.templateBodyValues || []).map((val) => ({
                type: 'text',
                text: String(val).slice(0, 500),
              })),
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedTo,
        type: 'text',
        text: {
          preview_url: false,
          body: params.textBody,
        },
      };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.whatsappAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let json: {
      messages?: Array<{ id?: string }>;
      error?: { message?: string; code?: number };
    } = {};
    try {
      json = (await res.json()) as typeof json;
    } catch {
      json = {};
    }

    const messageId =
      Array.isArray(json.messages) && typeof json.messages[0]?.id === 'string'
        ? json.messages[0].id
        : undefined;

    // Never mark sent unless Meta Cloud API returned HTTP 2xx AND a confirmed message ID
    if (!res.ok || !messageId) {
      return {
        configured: true,
        sent: false,
        provider: 'meta-cloud-api',
        channel: useTemplate ? 'template' : 'text',
        sentAt: attemptedAt,
        error:
          json?.error?.message ||
          `Échec API WhatsApp Cloud (HTTP ${res.status}, aucun identifiant de message confirmé).`,
      };
    }

    return {
      configured: true,
      sent: true,
      provider: 'meta-cloud-api',
      channel: useTemplate ? 'template' : 'text',
      messageId,
      sentAt: attemptedAt,
    };
  } catch (err) {
    return {
      configured: true,
      sent: false,
      provider: 'meta-cloud-api',
      channel: useTemplate ? 'template' : 'text',
      sentAt: attemptedAt,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function sendManagerBookingWhatsApp(
  reservation: StoredReservation
): Promise<WhatsAppNotificationSummary> {
  // Prevent duplicate manager notifications on retries
  if (reservation.whatsappNotification?.sent && reservation.whatsappNotification.messageId) {
    return reservation.whatsappNotification;
  }

  const cfg = getServerNotificationSettings();
  if (!cfg.notificationNumber) {
    return {
      configured: false,
      sent: false,
      provider: 'meta-cloud-api',
      sentAt: new Date().toISOString(),
      error: 'Variable serveur NOTIFICATIONNUMBER non définie.',
    };
  }

  const textBody = buildManagerWhatsAppMessageText(reservation);
  const totalGuests = countGuests(reservation);

  return sendMetaCloudApiMessage({
    recipientPhoneRaw: cfg.notificationNumber,
    textBody,
    allowTemplateOverride: true,
    templateBodyValues: [
      reservation.reservationNumber,
      reservation.customer?.name || 'Client',
      reservation.customer?.phone || '',
      formatEmailDateFr(reservation.arrival),
      formatEmailDateFr(reservation.departure),
      String(totalGuests),
      formatEmailXof(reservation.total),
      getReservationStatusLabelFr(reservation.status),
    ],
  });
}

export async function sendClientReservationWhatsApp(
  reservation: StoredReservation,
  originOverride?: string
): Promise<WhatsAppNotificationSummary> {
  const cfg = getServerNotificationSettings();
  const verificationUrl = buildReservationVerificationUrl(
    reservation.reservationNumber,
    reservation.createdAt,
    originOverride
  );
  const officialEmail =
    cfg.notificationEmail ||
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    'hotellepays@gmail.com';

  const textBody = [
    `HÔTEL LE PAYS — CONFIRMATION DE RÉSERVATION`,
    `Référence : ${reservation.reservationNumber}`,
    `Statut : ${getReservationStatusLabelFr(reservation.status)}`,
    `Client : ${reservation.customer?.name || ''}`,
    `Arrivée : ${formatEmailDateFr(reservation.arrival)}`,
    `Départ : ${formatEmailDateFr(reservation.departure)}`,
    `Montant total : ${formatEmailXof(reservation.total)} (${getPaymentStatusLabelFr(
      reservation.paymentStatus
    )})`,
    `Vérification officielle : ${verificationUrl}`,
    `Contact officiel : ${officialEmail}`,
  ].join('\n');

  return sendMetaCloudApiMessage({
    recipientPhoneRaw: reservation.customer?.phone || '',
    textBody,
    allowTemplateOverride: false,
  });
}
