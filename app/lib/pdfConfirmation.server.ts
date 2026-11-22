import fs from 'fs/promises';
import path from 'path';
import QRCode from 'qrcode';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { StoredReservation } from '@/app/types/reservation';
import { getSiteContent } from '@/app/lib/siteContent';
import { formatEmailDateFr, formatEmailXof, formatNumberFr } from '@/app/lib/emailTemplates';
import { buildReservationVerificationUrl } from '@/app/lib/reservationVerification.server';
import {
  getPaymentStatusLabelFr,
  getReservationStatusLabelFr,
  getServerNotificationSettings,
} from '@/app/lib/whatsapp.server';

function toPdfText(input: unknown): string {
  return String(input ?? '')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/[\u00A0\u202F]/g, ' ')
    .replace(/[^\x20-\x7E\xA1-\xFF]/g, ' ');
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const clean = toPdfText(text);
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        current = word;
      } else {
        // Hard wrap overly long token (e.g. URL)
        let chunk = '';
        for (const ch of word) {
          if (font.widthOfTextAtSize(chunk + ch, fontSize) <= maxWidth) {
            chunk += ch;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawWrappedLines(
  page: PDFPage,
  lines: string[],
  x: number,
  startY: number,
  lineHeight: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>
): number {
  let y = startY;
  for (const line of lines) {
    page.drawText(toPdfText(line), { x, y, size, font, color });
    y -= lineHeight;
  }
  return y;
}

async function loadLogoBytes(): Promise<Buffer | null> {
  const candidates = [
    path.join(process.cwd(), 'public', 'assets', 'images', 'logo-x.png'),
    path.join(process.cwd(), 'public', 'assets', 'images', 'logo.png'),
  ];
  for (const filePath of candidates) {
    try {
      const data = await fs.readFile(filePath);
      if (data.length > 0) return data;
    } catch {
      // try next candidate
    }
  }
  return null;
}

export async function generateReservationConfirmationPdf(
  reservation: StoredReservation,
  options?: { originOverride?: string }
): Promise<{
  buffer: Buffer;
  filename: string;
  verificationUrl: string;
  issuedAt: string;
}> {
  const [siteContent, logoBytes] = await Promise.all([getSiteContent(), loadLogoBytes()]);
  const notifSettings = getServerNotificationSettings();

  const officialEmail =
    notifSettings.notificationEmail ||
    siteContent.emailTemplates?.adminRecipientEmail?.trim() ||
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    siteContent.footer?.contact?.email?.trim() ||
    'hotellepays@gmail.com';
  const officialPhone = siteContent.footer?.contact?.phone || '+221 77 698 63 82';
  const officialAddress = siteContent.footer?.contact?.address || 'Sendou, Dakar, Sénégal';
  const issuedAt = new Date().toISOString();
  const verificationUrl = buildReservationVerificationUrl(
    reservation.reservationNumber,
    reservation.createdAt,
    options?.originOverride
  );

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(toPdfText(`Confirmation de réservation ${reservation.reservationNumber} - Hôtel Le Pays`));
  pdfDoc.setSubject(toPdfText(`Attestation de réservation ${reservation.reservationNumber}`));
  pdfDoc.setCreator('Hôtel Le Pays');
  pdfDoc.setProducer('Hôtel Le Pays Reservation System');

  // A4: 595.28 x 841.89 pt
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 38;
  const contentWidth = pageWidth - margin * 2;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Palette
  const colCharcoal = rgb(0.09, 0.09, 0.11);
  const colGold = rgb(0.71, 0.51, 0.24);
  const colSlate900 = rgb(0.06, 0.09, 0.16);
  const colSlate600 = rgb(0.32, 0.37, 0.46);
  const colBorder = rgb(0.84, 0.82, 0.77);
  const colLightBg = rgb(0.98, 0.97, 0.95);
  const colWhite = rgb(1, 1, 1);

  // Top Header Band
  const headerHeight = 96;
  page.drawRectangle({
    x: 0,
    y: pageHeight - headerHeight,
    width: pageWidth,
    height: headerHeight,
    color: colCharcoal,
  });
  page.drawRectangle({
    x: 0,
    y: pageHeight - headerHeight - 3,
    width: pageWidth,
    height: 3,
    color: colGold,
  });

  let textLeftX = margin;
  if (logoBytes) {
    try {
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const maxLogoH = 54;
      const maxLogoW = 90;
      const scale = Math.min(maxLogoW / logoImage.width, maxLogoH / logoImage.height);
      const drawW = logoImage.width * scale;
      const drawH = logoImage.height * scale;
      page.drawImage(logoImage, {
        x: margin,
        y: pageHeight - 21 - drawH,
        width: drawW,
        height: drawH,
      });
      textLeftX = margin + drawW + 14;
    } catch {
      // ignore invalid logo format
    }
  }

  page.drawText(toPdfText('HOTEL LE PAYS'), {
    x: textLeftX,
    y: pageHeight - 34,
    size: 16,
    font: fontBold,
    color: colWhite,
  });
  page.drawText(toPdfText(officialAddress), {
    x: textLeftX,
    y: pageHeight - 51,
    size: 9,
    font: fontRegular,
    color: rgb(0.85, 0.85, 0.88),
  });
  page.drawText(toPdfText(`Tél : ${officialPhone} | E-mail : ${officialEmail}`), {
    x: textLeftX,
    y: pageHeight - 65,
    size: 8.5,
    font: fontRegular,
    color: colGold,
  });
  page.drawText(toPdfText('Établissement hôtelier officiel · Sendou, République du Sénégal'), {
    x: textLeftX,
    y: pageHeight - 79,
    size: 8,
    font: fontRegular,
    color: rgb(0.68, 0.7, 0.75),
  });

  // Top Right Ref & Issue Info
  const rightBoxW = 165;
  const rightBoxX = pageWidth - margin - rightBoxW;
  page.drawText(toPdfText(`Réf. : ${reservation.reservationNumber}`), {
    x: rightBoxX,
    y: pageHeight - 35,
    size: 9.5,
    font: fontBold,
    color: colGold,
  });
  page.drawText(toPdfText(`Émis le : ${formatEmailDateFr(issuedAt)}`), {
    x: rightBoxX,
    y: pageHeight - 51,
    size: 8.5,
    font: fontRegular,
    color: colWhite,
  });
  page.drawText(toPdfText(`Statut : ${getReservationStatusLabelFr(reservation.status)}`), {
    x: rightBoxX,
    y: pageHeight - 66,
    size: 8.5,
    font: fontBold,
    color: colWhite,
  });

  // Main Document Title
  let cursorY = pageHeight - headerHeight - 30;
  page.drawText(toPdfText('CONFIRMATION DE RÉSERVATION'), {
    x: margin,
    y: cursorY,
    size: 17,
    font: fontBold,
    color: colSlate900,
  });
  page.drawText(
    toPdfText(`Document administratif vérifiable · Référence unique : ${reservation.reservationNumber}`),
    {
      x: margin,
      y: cursorY - 15,
      size: 9,
      font: fontRegular,
      color: colSlate600,
    }
  );
  cursorY -= 32;

  // Honest Real Status & Payment Banner (strictly enforces Section 3 absolute rule)
  const paymentLabel = getPaymentStatusLabelFr(reservation.paymentStatus);
  let bannerBg = rgb(0.99, 0.96, 0.88);
  let bannerBorder = rgb(0.85, 0.62, 0.16);
  let bannerTitleColor = rgb(0.55, 0.34, 0.04);
  let bannerTitle = '';
  let bannerNote = '';

  if (reservation.status === 'confirmed') {
    bannerBg = rgb(0.93, 0.98, 0.95);
    bannerBorder = rgb(0.18, 0.56, 0.36);
    bannerTitleColor = rgb(0.09, 0.38, 0.22);
    bannerTitle = `STATUT RÉEL : RÉSERVATION CONFIRMÉE | PAIEMENT : ${paymentLabel.toUpperCase()}`;
    bannerNote =
      reservation.paymentStatus === 'paid'
        ? "Réservation validée par l'administration et règlement enregistré."
        : "Réservation validée par l'administration. Le règlement s'effectue selon les modalités convenues avec l'établissement (non intégralement prépayé sauf mention contraire).";
  } else if (reservation.status === 'completed') {
    bannerBg = rgb(0.94, 0.96, 0.98);
    bannerBorder = rgb(0.32, 0.42, 0.56);
    bannerTitleColor = rgb(0.16, 0.24, 0.36);
    bannerTitle = `STATUT RÉEL : SÉJOUR TERMINÉ | PAIEMENT : ${paymentLabel.toUpperCase()}`;
    bannerNote = 'Séjour clôturé dans les registres de l’Hôtel Le Pays.';
  } else if (reservation.status === 'cancelled') {
    bannerBg = rgb(0.99, 0.93, 0.93);
    bannerBorder = rgb(0.78, 0.22, 0.22);
    bannerTitleColor = rgb(0.62, 0.11, 0.11);
    bannerTitle = 'STATUT RÉEL : RÉSERVATION ANNULÉE — DOCUMENT NON VALIDE POUR SÉJOUR';
    bannerNote = reservation.cancellationReason
      ? `Motif d'annulation enregistré : ${reservation.cancellationReason}`
      : 'Cette réservation a été annulée et ne donne plus accès à un hébergement.';
  } else {
    bannerTitle = `STATUT RÉEL : EN ATTENTE DE VALIDATION | PAIEMENT : ${paymentLabel.toUpperCase()}`;
    bannerNote =
      'Attention : cette réservation est enregistrée mais n’a pas encore été validée par l’administration ni réglée. Ce document ne constitue pas une confirmation définitive ni un reçu de paiement.';
  }

  const bannerLines = wrapText(bannerNote, fontRegular, 8.5, contentWidth - 20);
  const bannerHeight = 24 + bannerLines.length * 11 + 8;
  page.drawRectangle({
    x: margin,
    y: cursorY - bannerHeight,
    width: contentWidth,
    height: bannerHeight,
    color: bannerBg,
    borderColor: bannerBorder,
    borderWidth: 1,
  });
  page.drawText(toPdfText(bannerTitle), {
    x: margin + 10,
    y: cursorY - 15,
    size: 9.5,
    font: fontBold,
    color: bannerTitleColor,
  });
  drawWrappedLines(
    page,
    bannerLines,
    margin + 10,
    cursorY - 29,
    11,
    fontRegular,
    8.5,
    bannerTitleColor
  );

  cursorY -= bannerHeight + 16;

  // Two-column info cards: Guest Details & Stay Details
  const colGap = 14;
  const colW = (contentWidth - colGap) / 2;
  const cardH = 112;

  // Left card: Client
  page.drawRectangle({
    x: margin,
    y: cursorY - cardH,
    width: colW,
    height: cardH,
    color: colLightBg,
    borderColor: colBorder,
    borderWidth: 0.8,
  });
  page.drawText(toPdfText('COORDONNÉES DU CLIENT'), {
    x: margin + 10,
    y: cursorY - 16,
    size: 8.5,
    font: fontBold,
    color: colGold,
  });
  const guestRows: Array<[string, string]> = [
    ['Nom complet :', reservation.customer?.name || 'Non précisé'],
    ['Adresse e-mail :', reservation.customer?.email || 'Non précisé'],
    ['Téléphone :', reservation.customer?.phone || 'Non précisé'],
    ['Contact WhatsApp :', reservation.customer?.whatsapp ? 'Oui' : 'Non indiqué'],
  ];
  let rowY = cursorY - 34;
  for (const [k, v] of guestRows) {
    page.drawText(toPdfText(k), { x: margin + 10, y: rowY, size: 8.5, font: fontBold, color: colSlate600 });
    const valWrapped = wrapText(v, fontRegular, 8.5, colW - 102);
    page.drawText(toPdfText(valWrapped[0] || ''), {
      x: margin + 96,
      y: rowY,
      size: 8.5,
      font: fontRegular,
      color: colSlate900,
    });
    rowY -= 18;
  }

  // Right card: Stay metadata
  const rightColX = margin + colW + colGap;
  page.drawRectangle({
    x: rightColX,
    y: cursorY - cardH,
    width: colW,
    height: cardH,
    color: colLightBg,
    borderColor: colBorder,
    borderWidth: 0.8,
  });
  page.drawText(toPdfText('INFORMATIONS DU SÉJOUR'), {
    x: rightColX + 10,
    y: cursorY - 16,
    size: 8.5,
    font: fontBold,
    color: colGold,
  });
  const totalGuests = Object.values(reservation.rooms || {}).reduce(
    (sum, r) => sum + Number(r.adults || 0) + Number(r.children || 0),
    0
  );
  const stayRows: Array<[string, string]> = [
    ['Arrivée :', formatEmailDateFr(reservation.arrival)],
    ['Départ :', formatEmailDateFr(reservation.departure)],
    ['Durée / Capacité :', `${reservation.nights} nuit(s) · ${reservation.numRooms} ch. · ${Math.max(1, totalGuests)} pers.`],
    ['Enregistrée le :', formatEmailDateFr(reservation.createdAt)],
  ];
  rowY = cursorY - 34;
  for (const [k, v] of stayRows) {
    page.drawText(toPdfText(k), {
      x: rightColX + 10,
      y: rowY,
      size: 8.5,
      font: fontBold,
      color: colSlate600,
    });
    const valWrapped = wrapText(v, fontRegular, 8.5, colW - 102);
    page.drawText(toPdfText(valWrapped[0] || ''), {
      x: rightColX + 96,
      y: rowY,
      size: 8.5,
      font: fontRegular,
      color: colSlate900,
    });
    rowY -= 18;
  }

  cursorY -= cardH + 18;

  // Accommodation & Pricing Breakdown
  page.drawText(toPdfText("DÉTAIL DE L'HÉBERGEMENT & TARIFICATION"), {
    x: margin,
    y: cursorY,
    size: 10,
    font: fontBold,
    color: colSlate900,
  });
  cursorY -= 8;

  // Table Header
  page.drawRectangle({
    x: margin,
    y: cursorY - 22,
    width: contentWidth,
    height: 22,
    color: colCharcoal,
  });
  page.drawText(toPdfText('Désignation de la chambre / prestation'), {
    x: margin + 10,
    y: cursorY - 15,
    size: 8.5,
    font: fontBold,
    color: colWhite,
  });
  page.drawText(toPdfText('Occupants'), {
    x: margin + contentWidth - 150,
    y: cursorY - 15,
    size: 8.5,
    font: fontBold,
    color: colWhite,
  });
  page.drawText(toPdfText('Nuits'), {
    x: margin + contentWidth - 65,
    y: cursorY - 15,
    size: 8.5,
    font: fontBold,
    color: colWhite,
  });
  cursorY -= 22;

  const roomEntries = Object.entries(reservation.rooms || {});
  if (roomEntries.length === 0) {
    page.drawRectangle({
      x: margin,
      y: cursorY - 24,
      width: contentWidth,
      height: 24,
      borderColor: colBorder,
      borderWidth: 0.6,
    });
    page.drawText(toPdfText(reservation.label || 'Hébergement Hôtel Le Pays'), {
      x: margin + 10,
      y: cursorY - 16,
      size: 8.5,
      font: fontRegular,
      color: colSlate900,
    });
    cursorY -= 24;
  } else {
    for (const [key, room] of roomEntries) {
      const idx = roomEntries.findIndex(([k]) => k === key) + 1;
      const typeLabel = (room.type || 'Chambre').toUpperCase();
      const comfort =
        room.type === 'suite'
          ? 'Climatisation incluse'
          : room.clim === 'oui'
            ? 'Climatisée'
            : 'Ventilée';
      const offerTag =
        key === 'room1' && reservation.offer ? ` - Offre ${reservation.offer.title}` : '';
      const label = `Chambre ${idx} : ${typeLabel} (${comfort})${offerTag}`;
      const occ = `${room.adults || 1} ad. / ${room.children || 0} enf.`;

      page.drawRectangle({
        x: margin,
        y: cursorY - 24,
        width: contentWidth,
        height: 24,
        borderColor: colBorder,
        borderWidth: 0.6,
        color: idx % 2 === 0 ? colLightBg : colWhite,
      });
      page.drawText(toPdfText(label).slice(0, 65), {
        x: margin + 10,
        y: cursorY - 15,
        size: 8.5,
        font: fontRegular,
        color: colSlate900,
      });
      page.drawText(toPdfText(occ), {
        x: margin + contentWidth - 150,
        y: cursorY - 15,
        size: 8.5,
        font: fontRegular,
        color: colSlate600,
      });
      page.drawText(toPdfText(`${reservation.nights} nuit(s)`), {
        x: margin + contentWidth - 65,
        y: cursorY - 15,
        size: 8.5,
        font: fontRegular,
        color: colSlate900,
      });
      cursorY -= 24;
    }
  }

  // Extras line if any
  if (Array.isArray(reservation.extras) && reservation.extras.length > 0) {
    const extrasText = reservation.extras
      .map((ex) =>
        ex.unitPrice === 0 && !ex.paidOnSite
          ? `${ex.name} (Inclus suite)`
          : `${ex.name} (${ex.qty} pers. - payé sur place)`
      )
      .join(' ; ');
    const extrasLines = wrapText(`Extras : ${extrasText}`, fontRegular, 8, contentWidth - 20);
    const extrasH = 10 + extrasLines.length * 10;
    page.drawRectangle({
      x: margin,
      y: cursorY - extrasH,
      width: contentWidth,
      height: extrasH,
      borderColor: colBorder,
      borderWidth: 0.6,
      color: colLightBg,
    });
    drawWrappedLines(page, extrasLines, margin + 10, cursorY - 12, 10, fontRegular, 8, colSlate600);
    cursorY -= extrasH;
  }

  // Total & Payment Box
  const convertedInfo =
    reservation.currency &&
    reservation.currency.code !== 'XOF' &&
    typeof reservation.currency.totalConverted === 'number'
      ? ` (soit ${formatNumberFr(reservation.currency.totalConverted, 2)} ${reservation.currency.symbol})`
      : '';

  page.drawRectangle({
    x: margin,
    y: cursorY - 40,
    width: contentWidth,
    height: 40,
    color: rgb(0.96, 0.94, 0.89),
    borderColor: colGold,
    borderWidth: 1,
  });
  page.drawText(toPdfText('MONTANT TOTAL HÉBERGEMENT (TTC)'), {
    x: margin + 10,
    y: cursorY - 16,
    size: 9,
    font: fontBold,
    color: colSlate900,
  });
  page.drawText(toPdfText(`Statut de paiement enregistré : ${paymentLabel}`), {
    x: margin + 10,
    y: cursorY - 30,
    size: 8,
    font: fontRegular,
    color: colSlate600,
  });

  const amountStr = toPdfText(`${formatEmailXof(reservation.total)}${convertedInfo}`);
  const amountWidth = fontBold.widthOfTextAtSize(amountStr, 11.5);
  page.drawText(amountStr, {
    x: margin + contentWidth - amountWidth - 12,
    y: cursorY - 22,
    size: 11.5,
    font: fontBold,
    color: colGold,
  });

  cursorY -= 56;

  // Conditions de réservation et d'annulation
  page.drawText(toPdfText("CONDITIONS DE RÉSERVATION ET D'ANNULATION"), {
    x: margin,
    y: cursorY,
    size: 9.5,
    font: fontBold,
    color: colSlate900,
  });
  cursorY -= 13;

  const conditions = [
    "- Enregistrement (Check-in) à partir de 14h00 ; Départ (Check-out) au plus tard à 11h00.",
    "- Annulation sans frais possible jusqu'à 5 jours avant la date d'arrivée prévue.",
    "- Une pièce d'identité ou un passeport en cours de validité est exigé à la réception lors de l'arrivée.",
    "- Les extras non inclus (restauration, services complémentaires) sont réglés directement sur place.",
    "- Ce document reflète strictement les données enregistrées au moment de son édition et ne comporte ni paiement ni garantie fictifs.",
  ];
  for (const cond of conditions) {
    const wrapped = wrapText(cond, fontRegular, 8, contentWidth);
    cursorY = drawWrappedLines(page, wrapped, margin, cursorY, 10.5, fontRegular, 8, colSlate600);
  }

  // QR Code & Verification Footer Block (anchored cleanly near bottom)
  const footerBoxY = 58;
  const footerBoxH = 98;
  page.drawRectangle({
    x: margin,
    y: footerBoxY,
    width: contentWidth,
    height: footerBoxH,
    color: colLightBg,
    borderColor: colBorder,
    borderWidth: 0.9,
  });

  // Embed Verification QR Code
  try {
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      type: 'png',
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    const qrSize = 78;
    page.drawImage(qrImage, {
      x: margin + contentWidth - qrSize - 10,
      y: footerBoxY + (footerBoxH - qrSize) / 2,
      width: qrSize,
      height: qrSize,
    });
  } catch {
    // Fallback text if QR embedding fails
  }

  const qrTextMaxW = contentWidth - 110;
  page.drawText(toPdfText("VÉRIFICATION OFFICIELLE D'AUTHENTICITÉ (QR CODE)"), {
    x: margin + 12,
    y: footerBoxY + footerBoxH - 18,
    size: 8.5,
    font: fontBold,
    color: colGold,
  });
  const qrNoteLines = wrapText(
    "Scannez le QR code ci-contre pour vérifier en temps réel l'authenticité et le statut actuel de cette réservation sur le portail officiel de l'Hôtel Le Pays.",
    fontRegular,
    8,
    qrTextMaxW
  );
  const qrY = drawWrappedLines(
    page,
    qrNoteLines,
    margin + 12,
    footerBoxY + footerBoxH - 32,
    10.5,
    fontRegular,
    8,
    colSlate600
  );
  const urlLines = wrapText(verificationUrl, fontRegular, 7, qrTextMaxW);
  drawWrappedLines(page, urlLines.slice(0, 2), margin + 12, qrY - 2, 9, fontRegular, 7, colSlate900);

  // Bottom Contact Line
  page.drawLine({
    start: { x: margin, y: 42 },
    end: { x: pageWidth - margin, y: 42 },
    thickness: 0.6,
    color: colBorder,
  });
  page.drawText(
    toPdfText(
      `Hôtel Le Pays · ${officialAddress} · Tél : ${officialPhone} · E-mail officiel : ${officialEmail}`
    ),
    {
      x: margin,
      y: 28,
      size: 8,
      font: fontRegular,
      color: colSlate600,
    }
  );

  const bytes = await pdfDoc.save();
  return {
    buffer: Buffer.from(bytes),
    filename: `confirmation-reservation-${reservation.reservationNumber}.pdf`,
    verificationUrl,
    issuedAt,
  };
}
