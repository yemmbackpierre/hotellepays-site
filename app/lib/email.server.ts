import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';
import { readAdminsFromFile } from '@/app/lib/adminAuth';
import { getSiteContent } from '@/app/lib/siteContent';
import {
  type EmailHotelContext,
  type EmailTemplatesConfig,
  SAMPLE_RESERVATION_FOR_PREVIEW,
  escapeHtml,
  mergeEmailTemplatesConfig,
  renderEmailFromTemplate,
} from '@/app/lib/emailTemplates';
import type { EmailReceiptSummary, StoredReservation } from '@/app/types/reservation';

const OUTBOX_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'email-outbox.json');

interface OutboxRecord {
  id: string;
  to: string;
  subject: string;
  replyTo?: string;
  reservationNumber: string;
  recipientRole: 'guest' | 'admin';
  html: string;
  text: string;
  sentAt: string;
  mode: 'outbox';
}

async function resolveHotelAndTemplates(
  overrideTemplates?: Partial<EmailTemplatesConfig> | null
): Promise<{
  hotel: EmailHotelContext;
  templates: EmailTemplatesConfig;
}> {
  const [siteContent, admins] = await Promise.all([
    getSiteContent(),
    readAdminsFromFile(),
  ]);

  const templates = overrideTemplates
    ? mergeEmailTemplatesConfig(siteContent.emailTemplates, overrideTemplates)
    : siteContent.emailTemplates;

  const configuredAdmin = templates.adminRecipientEmail?.trim();
  const envAdmin = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  const footerEmail = siteContent.footer?.contact?.email?.trim();
  const fileAdminEmail = admins[0]?.email?.trim();

  return {
    hotel: {
      adminEmail: configuredAdmin || envAdmin || footerEmail || fileAdminEmail || 'hotellepays@gmail.com',
      hotelPhone: siteContent.footer?.contact?.phone || '+221 77 698 63 82',
      hotelAddress: siteContent.footer?.contact?.address || 'Sendou, Dakar, Sénégal',
      hotelName: 'Hôtel Le Pays',
    },
    templates,
  };
}

let outboxWriteQueue: Promise<void> = Promise.resolve();

async function appendOutboxRecord(record: OutboxRecord): Promise<void> {
  const run = async () => {
    let existing: OutboxRecord[] = [];
    try {
      const raw = await fs.readFile(OUTBOX_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) existing = parsed as OutboxRecord[];
    } catch {
      existing = [];
    }
    existing.unshift(record);
    const trimmed = existing.slice(0, 100);
    await fs.mkdir(path.dirname(OUTBOX_FILE_PATH), { recursive: true });
    const tmpPath = `${OUTBOX_FILE_PATH}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(trimmed, null, 2), 'utf-8');
    await fs.rename(tmpPath, OUTBOX_FILE_PATH);
  };

  const next = outboxWriteQueue.then(run, run);
  outboxWriteQueue = next.catch(() => {});
  return next;
}

function resolveResendFromAddress(): string {
  const resendFrom = process.env.RESEND_FROM?.trim();
  if (resendFrom) return resendFrom;

  const smtpFrom = process.env.SMTP_FROM?.trim();
  if (smtpFrom && !/@(gmail|yahoo|hotmail|outlook|live)\./i.test(smtpFrom)) {
    return smtpFrom;
  }

  return 'Hôtel Le Pays <onboarding@resend.dev>';
}

async function dispatchSingleEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  reservationNumber: string;
  recipientRole: 'guest' | 'admin';
}): Promise<{ ok: boolean; mode: 'smtp' | 'resend' | 'outbox'; messageId?: string; error?: string }> {
  const fromAddress =
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    'Hôtel Le Pays <noreply@hotellepays.com>';

  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS;
  const resendKey = process.env.RESEND_API_KEY?.trim();

  const trySmtp = async () => {
    try {
      const port = Number(process.env.SMTP_PORT || 587);
      const secure = process.env.SMTP_SECURE === 'true' || port === 465;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure,
        ...(smtpUser && smtpPass
          ? {
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            }
          : {}),
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        ...(params.replyTo ? { replyTo: params.replyTo } : {}),
      });

      return { ok: true as const, mode: 'smtp' as const, messageId: info.messageId };
    } catch (err) {
      return {
        ok: false as const,
        mode: 'smtp' as const,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  };

  // 1. Prefer Nodemailer SMTP when complete SMTP credentials are configured
  if (smtpHost && smtpUser && smtpPass) {
    return trySmtp();
  }

  // 2. Resend API transport
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resolveResendFromAddress(),
          to: [params.to],
          subject: params.subject,
          html: params.html,
          text: params.text,
          ...(params.replyTo ? { reply_to: params.replyTo } : {}),
        }),
      });
      const json = (await res.json()) as { id?: string; message?: string };
      if (!res.ok) {
        return { ok: false, mode: 'resend', error: json?.message || `HTTP ${res.status}` };
      }
      return { ok: true, mode: 'resend', messageId: json?.id };
    } catch (err) {
      return {
        ok: false,
        mode: 'resend',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // 3. Nodemailer SMTP relay without auth (e.g. local MailHog)
  if (smtpHost) {
    return trySmtp();
  }

  // 4. Local outbox fallback when no external mail provider env vars are configured
  const messageId = `outbox-${params.recipientRole}-${Date.now()}`;
  await appendOutboxRecord({
    id: messageId,
    to: params.to,
    subject: params.subject,
    replyTo: params.replyTo,
    reservationNumber: params.reservationNumber,
    recipientRole: params.recipientRole,
    html: params.html,
    text: params.text,
    sentAt: new Date().toISOString(),
    mode: 'outbox',
  });
  return { ok: true, mode: 'outbox', messageId };
}

export async function sendReservationConfirmationEmails(
  reservation: StoredReservation
): Promise<EmailReceiptSummary> {
  const { hotel, templates } = await resolveHotelAndTemplates();
  const userEmail = (reservation.customer?.email || '').trim();
  const adminEmail = hotel.adminEmail;
  const sentAt = new Date().toISOString();
  const errors: string[] = [];

  const guestMsg = renderEmailFromTemplate('guest', reservation, templates, hotel);
  const adminMsg = renderEmailFromTemplate('admin', reservation, templates, hotel);

  const [userResult, adminResult] = await Promise.all([
    userEmail
      ? dispatchSingleEmail({
          to: userEmail,
          subject: guestMsg.subject,
          html: guestMsg.html,
          text: guestMsg.text,
          replyTo: adminEmail,
          reservationNumber: reservation.reservationNumber,
          recipientRole: 'guest',
        })
      : Promise.resolve<{
          ok: boolean;
          mode: 'smtp' | 'resend' | 'outbox';
          messageId?: string;
          error?: string;
        }>({
          ok: false,
          mode: 'outbox',
          messageId: undefined,
          error: 'Adresse e-mail du client manquante',
        }),
    dispatchSingleEmail({
      to: adminEmail,
      subject: adminMsg.subject,
      html: adminMsg.html,
      text: adminMsg.text,
      replyTo: userEmail || undefined,
      reservationNumber: reservation.reservationNumber,
      recipientRole: 'admin',
    }),
  ]);

  if (!userResult.ok && userResult.error) errors.push(`Client: ${userResult.error}`);
  if (!adminResult.ok && adminResult.error) errors.push(`Admin: ${adminResult.error}`);

  return {
    userSent: userResult.ok,
    adminSent: adminResult.ok,
    mode: userResult.mode || adminResult.mode || 'outbox',
    userEmail,
    adminEmail,
    sentAt,
    userMessageId: userResult.messageId,
    adminMessageId: adminResult.messageId,
    ...(errors.length > 0 ? { errors } : {}),
  };
}

export async function sendTestConfirmationEmail(params: {
  templateType: 'guest' | 'admin';
  recipientEmail: string;
  templateConfig?: Partial<EmailTemplatesConfig> | null;
}): Promise<{
  ok: boolean;
  mode: 'smtp' | 'resend' | 'outbox';
  recipientEmail: string;
  subject: string;
  messageId?: string;
  error?: string;
}> {
  const { hotel, templates } = await resolveHotelAndTemplates(params.templateConfig);
  const sampleReservation: StoredReservation = {
    ...SAMPLE_RESERVATION_FOR_PREVIEW,
    customer: {
      ...SAMPLE_RESERVATION_FOR_PREVIEW.customer,
      email: params.recipientEmail,
    },
  };

  const rendered = renderEmailFromTemplate(
    params.templateType,
    sampleReservation,
    templates,
    hotel,
    { isTest: true }
  );

  const result = await dispatchSingleEmail({
    to: params.recipientEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    replyTo: hotel.adminEmail,
    reservationNumber: sampleReservation.reservationNumber,
    recipientRole: params.templateType,
  });

  return {
    ok: result.ok,
    mode: result.mode,
    recipientEmail: params.recipientEmail,
    subject: rendered.subject,
    messageId: result.messageId,
    ...(result.error ? { error: result.error } : {}),
  };
}

export async function sendClientVerificationCodeEmail(params: {
  email: string;
  code: string;
  expiresInMinutes: number;
}): Promise<{
  ok: boolean;
  mode: 'smtp' | 'resend' | 'outbox';
  messageId?: string;
  error?: string;
}> {
  const { hotel, templates } = await resolveHotelAndTemplates();
  const accentColor = /^#[0-9a-fA-F]{3,8}$/.test(templates.accentColor)
    ? templates.accentColor
    : '#b4833e';
  const subject = `Votre code de vérification (${params.code}) — ${hotel.hotelName}`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f1ea;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background-color:#ffffff;border:1px solid #e5dfd2;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background-color:#18181b;padding:24px 30px;border-bottom:3px solid ${escapeHtml(accentColor)};">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${escapeHtml(accentColor)};font-weight:700;">
                ${escapeHtml(hotel.hotelName)} · Espace Client
              </p>
              <h1 style="margin:0;font-size:20px;line-height:1.3;color:#ffffff;font-weight:700;">
                Code de vérification unique
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 30px;">
              <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#334155;">
                Vous avez demandé l'accès sécurisé à votre espace <strong>Mon Profil &amp; Mes Réservations</strong> avec l'adresse <strong>${escapeHtml(params.email)}</strong>.
              </p>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#334155;">
                Saisissez le code à usage unique ci-dessous pour confirmer votre identité :
              </p>
              <div style="margin:0 0 20px;padding:18px;background-color:#faf8f4;border:1px dashed ${escapeHtml(accentColor)};border-radius:8px;text-align:center;">
                <span style="font-size:32px;letter-spacing:8px;font-weight:700;color:#0f172a;font-family:monospace;">
                  ${escapeHtml(params.code)}
                </span>
              </div>
              <p style="margin:0 0 10px;font-size:13px;color:#475569;line-height:1.6;">
                Ce code est valable pendant <strong>${params.expiresInMinutes} minutes</strong> et ne peut être utilisé qu'une seule fois.
              </p>
              <p style="margin:0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.6;color:#64748b;">
                Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.<br />
                <strong>${escapeHtml(hotel.hotelName)}</strong> · ${escapeHtml(hotel.hotelAddress)}<br />
                Téléphone / WhatsApp : ${escapeHtml(hotel.hotelPhone)} · E-mail : ${escapeHtml(hotel.adminEmail)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `${hotel.hotelName} — Code de vérification unique`,
    '',
    `Votre code de vérification pour accéder à votre espace client (${params.email}) est : ${params.code}`,
    '',
    `Ce code est valable pendant ${params.expiresInMinutes} minutes et à usage unique.`,
    "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.",
    '',
    `${hotel.hotelName} | ${hotel.hotelPhone} | ${hotel.adminEmail}`,
  ].join('\n');

  const result = await dispatchSingleEmail({
    to: params.email,
    subject,
    html,
    text,
    replyTo: hotel.adminEmail,
    reservationNumber: `OTP-${Date.now()}`,
    recipientRole: 'guest',
  });

  return {
    ok: result.ok,
    mode: result.mode,
    messageId: result.messageId,
    ...(result.error ? { error: result.error } : {}),
  };
}

