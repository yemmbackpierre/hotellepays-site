import type { RoomParams } from '@/app/types/hotelData';
import type { StoredReservation } from '@/app/types/reservation';

export interface EmailTemplateConfig {
  subject: string;
  heading: string;
  introText: string;
  footerNote: string;
  ctaLabel: string;
  useCustomHtml: boolean;
  customHtml: string;
}

export interface EmailTemplatesConfig {
  accentColor: string;
  adminRecipientEmail: string;
  guest: EmailTemplateConfig;
  admin: EmailTemplateConfig;
}

export interface EmailHotelContext {
  hotelName: string;
  adminEmail: string;
  hotelPhone: string;
  hotelAddress: string;
  siteUrl?: string;
}

export const EMAIL_TEMPLATE_PLACEHOLDERS: Array<{ token: string; description: string }> = [
  { token: '{{hotelName}}', description: "Nom de l'hôtel" },
  { token: '{{reservationNumber}}', description: 'Numéro de réservation' },
  { token: '{{guestName}}', description: 'Nom du client' },
  { token: '{{guestEmail}}', description: 'E-mail du client' },
  { token: '{{guestPhone}}', description: 'Téléphone du client' },
  { token: '{{arrivalDate}}', description: "Date et heure d'arrivée" },
  { token: '{{departureDate}}', description: 'Date et heure de départ' },
  { token: '{{nights}}', description: 'Nombre de nuits' },
  { token: '{{numRooms}}', description: 'Nombre de chambres' },
  { token: '{{offerTitle}}', description: "Nom de l'offre tarifaire" },
  { token: '{{totalPrice}}', description: 'Prix total TTC formaté' },
  { token: '{{roomsTable}}', description: 'Tableau HTML détaillé des chambres' },
  { token: '{{extrasSection}}', description: 'Liste HTML des extras' },
  { token: '{{bookingSummary}}', description: 'Bloc HTML récapitulatif complet' },
  { token: '{{profileUrl}}', description: 'Lien vers Mes Réservations' },
  { token: '{{hotelPhone}}', description: "Téléphone de l'hôtel" },
  { token: '{{hotelEmail}}', description: "E-mail de l'hôtel" },
  { token: '{{hotelAddress}}', description: "Adresse de l'hôtel" },
];

export const SAMPLE_RESERVATION_FOR_PREVIEW: StoredReservation = {
  id: 'preview-sample-01',
  reservationNumber: 'RCHLP0020261120143000',
  arrival: '2026-12-18T14:00:00.000Z',
  departure: '2026-12-21T11:00:00.000Z',
  nights: 3,
  numRooms: 1,
  rooms: {
    room1: {
      type: 'suite',
      adults: 2,
      children: 1,
      clim: 'oui',
    },
  },
  extras: [
    { name: 'Piscine', unitPrice: 0, qty: 3, total: 0, paidOnSite: false },
    { name: 'Salle de sport', unitPrice: 0, qty: 3, total: 0, paidOnSite: false },
    { name: 'Petit-déjeuner', unitPrice: 2500, qty: 3, total: 7500, paidOnSite: true },
  ],
  customer: {
    name: 'Awa Diop',
    email: 'awa.diop@exemple.com',
    phone: '+221 77 123 45 67',
    whatsapp: true,
  },
  total: 180000,
  currency: {
    code: 'XOF',
    symbol: 'FCFA',
    totalConverted: 180000,
  },
  offer: {
    slug: 'suite',
    title: 'Suite',
    name: 'suite',
    price: 60000,
    currency: 'Fr',
    per: 'par nuit',
    roomType: 'suite',
    clim: 'oui',
  },
  label: 'Réservation de 1 chambre pour le vendredi 18/12/2026 à 14h 00 mn',
  status: 'confirmed',
  createdAt: '2026-11-20T09:00:00.000Z',
};

const DEFAULT_GUEST_CUSTOM_HTML = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f1ea;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background-color:#ffffff;border:1px solid #e5dfd2;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background-color:#18181b;padding:28px 32px;border-bottom:3px solid {{accentColor}};">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:{{accentColor}};font-weight:700;">{{hotelName}} · Sendou, Sénégal</p>
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">Confirmation de réservation</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Bonjour <strong>{{guestName}}</strong>,</p>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.65;color:#475569;">Nous avons le plaisir de confirmer votre réservation. Conservez ce reçu officiel pour votre arrivée à la réception.</p>
              {{bookingSummary}}
              <div style="margin:24px 0 8px;text-align:center;">
                <a href="{{profileUrl}}" style="display:inline-block;background-color:{{accentColor}};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:6px;">Consulter Mes Réservations</a>
              </div>
              <p style="margin:22px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.6;color:#64748b;">
                {{hotelName}} · {{hotelAddress}}<br />
                Téléphone / WhatsApp : {{hotelPhone}} · E-mail : {{hotelEmail}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const DEFAULT_ADMIN_CUSTOM_HTML = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#eef2f7;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background-color:#ffffff;border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background-color:#0f172a;padding:22px 28px;border-bottom:3px solid {{accentColor}};">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:{{accentColor}};font-weight:700;">Administration · {{hotelName}}</p>
              <h1 style="margin:0;font-size:20px;line-height:1.3;color:#ffffff;font-weight:700;">Nouvelle réservation {{reservationNumber}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">
                Une nouvelle réservation vient d'être confirmée par <strong>{{guestName}}</strong> ({{guestEmail}} · {{guestPhone}}).
              </p>
              {{bookingSummary}}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export function getDefaultEmailTemplatesConfig(): EmailTemplatesConfig {
  return {
    accentColor: '#b4833e',
    adminRecipientEmail: '',
    guest: {
      subject: 'Confirmation de réservation {{reservationNumber}} — {{hotelName}}',
      heading: 'Reçu de confirmation de réservation',
      introText:
        'Nous avons le plaisir de confirmer votre réservation à {{hotelName}}. Vous trouverez ci-dessous le récapitulatif complet de votre séjour, vos dates et le montant total.',
      footerNote:
        "Arrivée à partir de 14h00 · Départ avant 11h00. Annulation gratuite jusqu'à 5 jours avant l'arrivée. Les extras sélectionnés sont réglés sur place.",
      ctaLabel: 'Voir Mes Réservations',
      useCustomHtml: false,
      customHtml: DEFAULT_GUEST_CUSTOM_HTML,
    },
    admin: {
      subject: '[Nouvelle Réservation] {{reservationNumber}} — {{guestName}}',
      heading: 'Nouvelle réservation enregistrée',
      introText:
        'Une nouvelle réservation vient d’être soumise et vérifiée côté serveur. Retrouvez ci-dessous les coordonnées du client, les dates du séjour et le détail tarifaire.',
      footerNote:
        'Notification automatique générée par le système de réservation Hôtel Le Pays.',
      ctaLabel: 'Ouvrir le tableau de bord',
      useCustomHtml: false,
      customHtml: DEFAULT_ADMIN_CUSTOM_HTML,
    },
  };
}

export function mergeEmailTemplatesConfig(
  defaults: EmailTemplatesConfig,
  saved?: Partial<EmailTemplatesConfig> | null
): EmailTemplatesConfig {
  if (!saved || typeof saved !== 'object') return structuredClone(defaults);
  return {
    accentColor: saved.accentColor || defaults.accentColor,
    adminRecipientEmail:
      typeof saved.adminRecipientEmail === 'string'
        ? saved.adminRecipientEmail
        : defaults.adminRecipientEmail,
    guest: {
      ...defaults.guest,
      ...(saved.guest || {}),
    },
    admin: {
      ...defaults.admin,
      ...(saved.admin || {}),
    },
  };
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const MONTHS_SHORT_FR = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

export function formatEmailDateFr(iso?: string | null): string {
  if (!iso) return 'Non précisée';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const day = d.getUTCDate();
  const month = MONTHS_SHORT_FR[d.getUTCMonth()] || '';
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hh}:${mm}`;
}

export function formatNumberFr(amount: number, decimals = 0): string {
  const safe = Number(amount) || 0;
  const fixed = decimals > 0 ? safe.toFixed(decimals) : String(Math.round(safe));
  const [intPart, decPart] = fixed.split('.');
  const spaced = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return decPart !== undefined ? `${spaced},${decPart}` : spaced;
}

export function formatEmailXof(amount: number): string {
  return `${formatNumberFr(amount, 0)} FCFA`;
}

function getRoomDescription(room: RoomParams): string {
  const typeLabel = room.type ? room.type.toUpperCase() : 'CHAMBRE';
  const comfort =
    room.type === 'suite' ? 'Climatisation incluse' : room.clim === 'oui' ? 'Climatisée' : 'Ventilée';
  return `${typeLabel} (${comfort}) — ${room.adults || 1} adulte(s), ${room.children || 0} enfant(s)`;
}

function buildRoomsTableHtml(reservation: StoredReservation, accentColor: string): string {
  const entries = Object.entries(reservation.rooms || {});
  const rows =
    entries.length === 0
      ? '<tr><td colspan="2" style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#475569;">Aucune chambre précisée</td></tr>'
      : entries
          .map(([key, room], idx) => {
            const offerBadge =
              key === 'room1' && reservation.offer
                ? `<br /><span style="font-size:12px;color:${escapeHtml(accentColor)};font-weight:700;">Offre : ${escapeHtml(reservation.offer.title)} (${escapeHtml(formatEmailXof(reservation.offer.price))} ${escapeHtml(reservation.offer.per)})</span>`
                : '';
            return `<tr>
              <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#0f172a;font-weight:600;vertical-align:top;width:38%;">
                Chambre ${idx + 1}${offerBadge}
              </td>
              <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#334155;vertical-align:top;">
                ${escapeHtml(getRoomDescription(room))}
              </td>
            </tr>`;
          })
          .join('');

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin:0;">
    ${rows}
  </table>`;
}

function buildExtrasHtml(reservation: StoredReservation): string {
  if (!Array.isArray(reservation.extras) || reservation.extras.length === 0) {
    return '<p style="margin:6px 0 0;color:#64748b;font-size:13px;">Aucun extra sélectionné.</p>';
  }
  return `<ul style="margin:6px 0 0;padding-left:18px;color:#334155;font-size:13px;line-height:1.6;">
    ${reservation.extras
      .map((ex) =>
        ex.unitPrice === 0 && !ex.paidOnSite
          ? `<li>${escapeHtml(ex.name)} <strong>(Inclus avec la suite)</strong></li>`
          : `<li>${escapeHtml(ex.name)} — ${ex.qty} personne(s) (payé sur place)</li>`
      )
      .join('')}
  </ul>`;
}

export function buildExtrasPlainText(reservation: StoredReservation): string {
  if (!Array.isArray(reservation.extras) || reservation.extras.length === 0) {
    return 'Aucun extra sélectionné.';
  }
  return reservation.extras
    .map((ex) =>
      ex.unitPrice === 0 && !ex.paidOnSite
        ? `- ${ex.name} (Inclus avec la suite)`
        : `- ${ex.name} (${ex.qty} pers. — payé sur place)`
    )
    .join('\n');
}

function buildBookingSummaryBlockHtml(
  reservation: StoredReservation,
  accentColor: string,
  includeGuestDetails: boolean
): string {
  const convertedInfo =
    reservation.currency &&
    reservation.currency.code !== 'XOF' &&
    typeof reservation.currency.totalConverted === 'number'
      ? ` (${formatNumberFr(reservation.currency.totalConverted, 2)} ${reservation.currency.symbol})`
      : '';

  const offerBanner = reservation.offer
    ? `<div style="margin:0 0 16px;padding:12px 14px;background-color:#fbf7ef;border:1px solid #eadcc2;border-radius:6px;color:#6d4916;font-size:13px;">
         <strong>Offre sélectionnée :</strong> ${escapeHtml(reservation.offer.title)} — ${escapeHtml(formatEmailXof(reservation.offer.price))} ${escapeHtml(reservation.offer.per)}
       </div>`
    : '';

  const guestRows = includeGuestDetails
    ? `<tr>
         <td style="padding:10px 12px;background-color:#f8fafc;border-bottom:1px solid #e5e7eb;font-size:13px;color:#64748b;width:38%;">Client</td>
         <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#0f172a;">
           <strong>${escapeHtml(reservation.customer?.name)}</strong><br />
           ${escapeHtml(reservation.customer?.email)} · ${escapeHtml(reservation.customer?.phone)}${reservation.customer?.whatsapp ? ' (WhatsApp)' : ''}
         </td>
       </tr>`
    : '';

  return `
    ${offerBanner}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;margin:0 0 16px;">
      <tr>
        <td style="padding:10px 12px;background-color:#f8fafc;border-bottom:1px solid #e5e7eb;font-size:13px;color:#64748b;width:38%;">N° de réservation</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(reservation.reservationNumber)}</td>
      </tr>
      ${guestRows}
      <tr>
        <td style="padding:10px 12px;background-color:#f8fafc;border-bottom:1px solid #e5e7eb;font-size:13px;color:#64748b;">Dates du séjour</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#0f172a;">
          <strong>Arrivée :</strong> ${escapeHtml(formatEmailDateFr(reservation.arrival))}<br />
          <strong>Départ :</strong> ${escapeHtml(formatEmailDateFr(reservation.departure))}
        </td>
      </tr>
      <tr>
        <td style="padding:10px 12px;background-color:#f8fafc;border-bottom:1px solid #e5e7eb;font-size:13px;color:#64748b;">Durée &amp; Chambres</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#0f172a;">${reservation.nights} nuit(s) · ${reservation.numRooms} chambre(s)</td>
      </tr>
      <tr>
        <td style="padding:12px;background-color:#f8fafc;font-size:14px;font-weight:700;color:#0f172a;">Montant Total TTC</td>
        <td style="padding:12px;font-size:17px;font-weight:700;color:${escapeHtml(accentColor)};">${escapeHtml(formatEmailXof(reservation.total))}${escapeHtml(convertedInfo)}</td>
      </tr>
    </table>
    <div style="margin:0 0 14px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0f172a;">Détails des chambres</p>
      ${buildRoomsTableHtml(reservation, accentColor)}
    </div>
    <div style="margin:0;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Extras &amp; Services</p>
      ${buildExtrasHtml(reservation)}
    </div>
  `;
}

function interpolateTokens(
  rawTemplate: string,
  tokens: Record<string, string>,
  rawHtmlTokens: Record<string, string> = {}
): string {
  return rawTemplate.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (full, key: string) => {
    if (key in rawHtmlTokens) return rawHtmlTokens[key];
    if (key in tokens) return tokens[key];
    return full;
  });
}

export function renderEmailFromTemplate(
  role: 'guest' | 'admin',
  reservation: StoredReservation,
  config: EmailTemplatesConfig,
  hotel: EmailHotelContext,
  options?: { isTest?: boolean }
): { subject: string; html: string; text: string } {
  const defaults = getDefaultEmailTemplatesConfig();
  const merged = mergeEmailTemplatesConfig(defaults, config);
  const tpl = role === 'guest' ? merged.guest : merged.admin;
  const accentColor = /^#[0-9a-fA-F]{3,8}$/.test(merged.accentColor)
    ? merged.accentColor
    : '#b4833e';

  const baseSiteUrl = (hotel.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://hotellepays.com').replace(/\/+$/, '');
  const profileUrl = role === 'guest' ? `${baseSiteUrl}/profile/` : `${baseSiteUrl}/lepays-dsb/`;

  const convertedInfo =
    reservation.currency &&
    reservation.currency.code !== 'XOF' &&
    typeof reservation.currency.totalConverted === 'number'
      ? ` (${formatNumberFr(reservation.currency.totalConverted, 2)} ${reservation.currency.symbol})`
      : '';

  const totalPriceDisplay = `${formatEmailXof(reservation.total)}${convertedInfo}`;
  const arrivalStr = formatEmailDateFr(reservation.arrival);
  const departureStr = formatEmailDateFr(reservation.departure);

  const plainTokens: Record<string, string> = {
    hotelName: hotel.hotelName,
    reservationNumber: reservation.reservationNumber,
    guestName: reservation.customer?.name || 'Client',
    guestEmail: reservation.customer?.email || '',
    guestPhone: reservation.customer?.phone || '',
    arrivalDate: arrivalStr,
    departureDate: departureStr,
    nights: String(reservation.nights || 1),
    numRooms: String(reservation.numRooms || 1),
    offerTitle: reservation.offer?.title || 'Tarif standard',
    totalPrice: totalPriceDisplay,
    profileUrl,
    hotelPhone: hotel.hotelPhone,
    hotelEmail: hotel.adminEmail,
    hotelAddress: hotel.hotelAddress,
    accentColor,
  };

  const escapedTokens: Record<string, string> = Object.fromEntries(
    Object.entries(plainTokens).map(([k, v]) => [k, escapeHtml(v)])
  );

  const roomsTableHtml = buildRoomsTableHtml(reservation, accentColor);
  const extrasHtml = buildExtrasHtml(reservation);
  const bookingSummaryHtml = buildBookingSummaryBlockHtml(
    reservation,
    accentColor,
    role === 'admin'
  );

  const testPrefix = options?.isTest ? '[TEST] ' : '';
  const subject = `${testPrefix}${interpolateTokens(tpl.subject, plainTokens)}`;

  const heading = interpolateTokens(tpl.heading, plainTokens);
  const introText = interpolateTokens(tpl.introText, plainTokens);
  const footerNote = interpolateTokens(tpl.footerNote, plainTokens);
  const ctaLabel = interpolateTokens(tpl.ctaLabel, plainTokens);

  let html: string;
  if (tpl.useCustomHtml && tpl.customHtml.trim()) {
    html = interpolateTokens(tpl.customHtml, escapedTokens, {
      roomsTable: roomsTableHtml,
      extrasSection: extrasHtml,
      bookingSummary: bookingSummaryHtml,
    });
  } else {
    const headerBg = role === 'guest' ? '#18181b' : '#0f172a';
    const outerBg = role === 'guest' ? '#f4f1ea' : '#eef2f7';
    const badgeSubtitle =
      role === 'guest'
        ? `${escapeHtml(hotel.hotelName)} · Sendou, Sénégal`
        : `Administration · ${escapeHtml(hotel.hotelName)}`;
    const greetingHtml =
      role === 'guest'
        ? `<p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#0f172a;">Bonjour <strong>${escapeHtml(plainTokens.guestName)}</strong>,</p>`
        : '';

    const testBanner = options?.isTest
      ? `<div style="margin:0 0 16px;padding:10px 14px;background-color:#fef3c7;border:1px solid #f59e0b;border-radius:6px;color:#92400e;font-size:12px;font-weight:700;">
           Ceci est un e-mail de test envoyé depuis l'interface d'administration (/lepays-dsb) avec des données de démonstration.
         </div>`
      : '';

    const ctaHtml = ctaLabel.trim()
      ? `<div style="margin:24px 0 8px;text-align:center;">
           <a href="${escapeHtml(profileUrl)}" style="display:inline-block;background-color:${escapeHtml(accentColor)};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:6px;">
             ${escapeHtml(ctaLabel)}
           </a>
         </div>`
      : '';

    html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${outerBg};font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${outerBg};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background-color:#ffffff;border:1px solid #e2ddd2;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background-color:${headerBg};padding:26px 30px;border-bottom:3px solid ${escapeHtml(accentColor)};">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${escapeHtml(accentColor)};font-weight:700;">
                ${badgeSubtitle}
              </p>
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">
                ${escapeHtml(heading)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 30px;">
              ${testBanner}
              ${greetingHtml}
              <p style="margin:0 0 20px;font-size:14px;line-height:1.65;color:#475569;">
                ${escapeHtml(introText)}
              </p>
              ${bookingSummaryHtml}
              ${ctaHtml}
              <div style="margin:22px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.6;color:#64748b;">
                <p style="margin:0 0 10px;">${escapeHtml(footerNote)}</p>
                <p style="margin:0;">
                  <strong>${escapeHtml(hotel.hotelName)}</strong> · ${escapeHtml(hotel.hotelAddress)}<br />
                  Téléphone / WhatsApp : ${escapeHtml(hotel.hotelPhone)} · E-mail : ${escapeHtml(hotel.adminEmail)}
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  const text = [
    subject,
    '',
    role === 'guest' ? `Bonjour ${plainTokens.guestName},` : '',
    introText,
    '',
    `Référence : ${reservation.reservationNumber}`,
    `Client : ${plainTokens.guestName} (${plainTokens.guestEmail} · ${plainTokens.guestPhone})`,
    reservation.offer
      ? `Offre : ${reservation.offer.title} (${formatEmailXof(reservation.offer.price)} ${reservation.offer.per})`
      : '',
    `Arrivée : ${arrivalStr}`,
    `Départ : ${departureStr}`,
    `Durée : ${reservation.nights} nuit(s) · ${reservation.numRooms} chambre(s)`,
    `Montant total TTC : ${totalPriceDisplay}`,
    '',
    'Extras :',
    buildExtrasPlainText(reservation),
    '',
    footerNote,
    `${hotel.hotelName} | ${hotel.hotelPhone} | ${hotel.adminEmail} | ${hotel.hotelAddress}`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}
