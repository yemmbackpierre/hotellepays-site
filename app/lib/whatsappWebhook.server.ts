import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  appendAuditLog,
  readReservationsFromFile,
  updateReservationRecord,
} from '@/app/lib/reservationsStore.server';
import { normalizeWhatsAppPhoneNumber } from '@/app/lib/whatsapp.server';
import type { WhatsAppWebhookEventRecord } from '@/app/types/reservation';

const WEBHOOK_EVENTS_FILE_PATH = path.join(
  process.cwd(),
  'app',
  'data',
  'whatsapp-webhook-events.json'
);

let webhookEventsQueue: Promise<void> = Promise.resolve();

function enqueueWebhookEventWrite<T>(fn: () => Promise<T>): Promise<T> {
  const next = webhookEventsQueue.then(fn, fn);
  webhookEventsQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function getWhatsAppWebhookVerifyTokenMeta(): {
  token: string;
  source: 'env' | 'derived' | 'ephemeral';
} {
  const envToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();
  if (envToken) {
    return { token: envToken, source: 'env' };
  }

  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (sessionSecret) {
    const derived = crypto
      .createHmac('sha256', sessionSecret)
      .update('lepays-whatsapp-webhook-verify-v1')
      .digest('base64url')
      .slice(0, 32);
    return { token: `lp_wa_${derived}`, source: 'derived' };
  }

  const globalAny = globalThis as unknown as { __lepaysWaVerifyToken?: string };
  if (!globalAny.__lepaysWaVerifyToken) {
    globalAny.__lepaysWaVerifyToken = `lp_wa_${crypto.randomBytes(24).toString('base64url')}`;
  }
  return { token: globalAny.__lepaysWaVerifyToken, source: 'ephemeral' };
}

export function verifyWhatsAppWebhookToken(candidate?: string | null): boolean {
  if (!candidate || typeof candidate !== 'string') return false;
  const { token } = getWhatsAppWebhookVerifyTokenMeta();
  return safeEqual(candidate.trim(), token);
}

export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader?: string | null
): { ok: boolean; enforced: boolean; reason?: string } {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  if (!appSecret) {
    return { ok: true, enforced: false };
  }

  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return {
      ok: false,
      enforced: true,
      reason: 'En-tête X-Hub-Signature-256 manquant ou mal formé.',
    };
  }

  const receivedHex = signatureHeader.slice('sha256='.length).trim().toLowerCase();
  const expectedHex = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody, 'utf-8')
    .digest('hex')
    .toLowerCase();

  if (!safeEqual(receivedHex, expectedHex)) {
    return {
      ok: false,
      enforced: true,
      reason: 'Signature X-Hub-Signature-256 invalide.',
    };
  }

  return { ok: true, enforced: true };
}

export async function readWhatsAppWebhookEvents(
  limit = 50
): Promise<WhatsAppWebhookEventRecord[]> {
  try {
    const raw = await fs.readFile(WEBHOOK_EVENTS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? (parsed as WhatsAppWebhookEventRecord[]) : [];
    return list.slice(0, Math.max(1, limit));
  } catch {
    return [];
  }
}

async function appendWhatsAppWebhookEvents(
  newEvents: WhatsAppWebhookEventRecord[]
): Promise<void> {
  if (newEvents.length === 0) return;
  await enqueueWebhookEventWrite(async () => {
    const existing = await readWhatsAppWebhookEvents(200);
    const merged = [...newEvents, ...existing].slice(0, 200);
    await fs.mkdir(path.dirname(WEBHOOK_EVENTS_FILE_PATH), { recursive: true });
    const tmpPath = `${WEBHOOK_EVENTS_FILE_PATH}.${Date.now()}.${Math.random()
      .toString(36)
      .slice(2)}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(merged, null, 2), 'utf-8');
    await fs.rename(tmpPath, WEBHOOK_EVENTS_FILE_PATH);
  });
}

function maskPhoneForStorage(raw?: string | null): string | undefined {
  const digits = normalizeWhatsAppPhoneNumber(raw);
  if (!digits) return undefined;
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 3)}••••${digits.slice(-4)}`;
}

function sanitizeText(input: unknown, maxLen = 280): string | undefined {
  if (typeof input !== 'string') return undefined;
  const trimmed = input.replace(/[\u0000-\u001F\u007F]/g, ' ').trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

function toIsoFromUnixSeconds(raw?: unknown): string {
  const num = Number(raw);
  if (Number.isFinite(num) && num > 1_000_000_000) {
    return new Date(num * 1000).toISOString();
  }
  return new Date().toISOString();
}

function normalizeWebhookDeliveryStatus(
  raw: unknown
): 'sent' | 'delivered' | 'read' | 'failed' | null {
  if (raw === 'sent' || raw === 'delivered' || raw === 'read' || raw === 'failed') {
    return raw;
  }
  return null;
}

interface MetaWebhookErrorItem {
  code?: number;
  title?: string;
  message?: string;
  error_data?: { details?: string };
}

interface MetaStatusPayload {
  id?: string;
  status?: string;
  timestamp?: string;
  recipient_id?: string;
  errors?: MetaWebhookErrorItem[];
}

interface MetaMessagePayload {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string; payload?: string };
  interactive?: {
    type?: string;
    button_reply?: { id?: string; title?: string };
    list_reply?: { id?: string; title?: string };
  };
}

interface MetaWebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string; display_phone_number?: string };
        contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
        statuses?: MetaStatusPayload[];
        messages?: MetaMessagePayload[];
      };
    }>;
  }>;
}

export async function processWhatsAppWebhookPayload(
  payload: unknown,
  signatureVerified: boolean
): Promise<{
  ok: boolean;
  processedStatuses: number;
  processedMessages: number;
  ignoredReason?: string;
}> {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      processedStatuses: 0,
      processedMessages: 0,
      ignoredReason: 'Corps JSON invalide.',
    };
  }

  const root = payload as MetaWebhookPayload;
  if (root.object !== 'whatsapp_business_account') {
    return {
      ok: false,
      processedStatuses: 0,
      processedMessages: 0,
      ignoredReason: `Objet webhook non pris en charge (${String(root.object || 'inconnu')}).`,
    };
  }

  const entries = Array.isArray(root.entry) ? root.entry : [];
  const reservations = await readReservationsFromFile();
  const eventsToStore: WhatsAppWebhookEventRecord[] = [];
  let processedStatuses = 0;
  let processedMessages = 0;

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      if (change?.field !== 'messages' || !change.value) continue;

      const phoneNumberId = sanitizeText(change.value.metadata?.phone_number_id, 40);
      const contacts = Array.isArray(change.value.contacts) ? change.value.contacts : [];
      const statuses = Array.isArray(change.value.statuses) ? change.value.statuses : [];
      const messages = Array.isArray(change.value.messages) ? change.value.messages : [];

      for (const st of statuses) {
        const deliveryStatus = normalizeWebhookDeliveryStatus(st?.status);
        const wamid = sanitizeText(st?.id, 128);
        if (!deliveryStatus || !wamid) continue;

        const eventTs = toIsoFromUnixSeconds(st.timestamp);
        const errorText = Array.isArray(st.errors) && st.errors.length > 0
          ? st.errors
              .map(
                (e) =>
                  `${e.code ? `[${e.code}] ` : ''}${
                    e.error_data?.details || e.message || e.title || 'Erreur WhatsApp'
                  }`
              )
              .join(' ; ')
              .slice(0, 300)
          : undefined;

        let matchedReservationNumber: string | undefined;

        for (const resv of reservations) {
          let touched = false;
          const patch: {
            whatsappNotification?: typeof resv.whatsappNotification;
            pdfHistory?: typeof resv.pdfHistory;
          } = {};

          if (resv.whatsappNotification?.messageId === wamid) {
            matchedReservationNumber = resv.reservationNumber;
            touched = true;
            patch.whatsappNotification = {
              ...resv.whatsappNotification,
              deliveryStatus,
              ...(deliveryStatus === 'delivered' ? { deliveredAt: eventTs } : {}),
              ...(deliveryStatus === 'read' ? { readAt: eventTs } : {}),
              ...(deliveryStatus === 'failed'
                ? {
                    sent: false,
                    deliveryError: errorText || 'Échec signalé par Meta Webhook.',
                  }
                : {}),
            };
          }

          if (Array.isArray(resv.pdfHistory) && resv.pdfHistory.some((p) => p.messageId === wamid)) {
            matchedReservationNumber = resv.reservationNumber;
            touched = true;
            patch.pdfHistory = resv.pdfHistory.map((p) =>
              p.messageId === wamid
                ? {
                    ...p,
                    deliveryStatus,
                    ...(deliveryStatus === 'failed'
                      ? {
                          sent: false,
                          deliveryError: errorText || 'Échec signalé par Meta Webhook.',
                        }
                      : {}),
                  }
                : p
            );
          }

          if (touched) {
            await updateReservationRecord(resv.reservationNumber, patch);
            await appendAuditLog({
              action: 'whatsapp.webhook_status',
              reservationNumber: resv.reservationNumber,
              actorEmail: 'meta-whatsapp-webhook',
              actorRole: 'system',
              details: errorText
                ? `Webhook WhatsApp (${deliveryStatus}) pour ${wamid} : ${errorText}`
                : `Statut de livraison WhatsApp mis à jour via webhook : ${deliveryStatus}.`,
              metadata: {
                wamid,
                deliveryStatus,
                signatureVerified,
              },
            }).catch(() => {});
          }
        }

        eventsToStore.push({
          id: uuidv4(),
          kind: 'status',
          wamid,
          phoneNumberId,
          fromOrRecipient: maskPhoneForStorage(st.recipient_id),
          status: deliveryStatus,
          reservationNumber: matchedReservationNumber,
          signatureVerified,
          ...(errorText ? { errorDetails: errorText } : {}),
          eventTimestamp: eventTs,
          receivedAt: new Date().toISOString(),
        });
        processedStatuses += 1;
      }

      for (const msg of messages) {
        const wamid = sanitizeText(msg?.id, 128);
        const fromDigits = normalizeWhatsAppPhoneNumber(msg?.from);
        if (!wamid && !fromDigits) continue;

        const matchingContact = contacts.find(
          (c) => normalizeWhatsAppPhoneNumber(c?.wa_id) === fromDigits
        );
        const profileName = sanitizeText(matchingContact?.profile?.name, 80);
        const msgType = sanitizeText(msg?.type, 32) || 'unknown';

        const preview =
          sanitizeText(msg?.text?.body, 280) ||
          sanitizeText(msg?.button?.text || msg?.button?.payload, 180) ||
          sanitizeText(
            msg?.interactive?.button_reply?.title || msg?.interactive?.list_reply?.title,
            180
          ) ||
          `[Message ${msgType}]`;

        let matchedReservationNumber: string | undefined;
        if (fromDigits) {
          const matchingRes = reservations.find(
            (r) => normalizeWhatsAppPhoneNumber(r.customer?.phone) === fromDigits
          );
          if (matchingRes) {
            matchedReservationNumber = matchingRes.reservationNumber;
            await appendAuditLog({
              action: 'whatsapp.message_received',
              reservationNumber: matchingRes.reservationNumber,
              actorEmail: profileName || maskPhoneForStorage(fromDigits) || 'whatsapp-client',
              actorRole: 'client',
              details: `Message WhatsApp reçu (${msgType}) : ${preview}`,
              metadata: {
                ...(wamid ? { wamid } : {}),
                msgType,
                signatureVerified,
              },
            }).catch(() => {});
          }
        }

        eventsToStore.push({
          id: uuidv4(),
          kind: 'message',
          ...(wamid ? { wamid } : {}),
          phoneNumberId,
          fromOrRecipient: maskPhoneForStorage(fromDigits),
          ...(profileName ? { profileName } : {}),
          messageType: msgType,
          preview,
          ...(matchedReservationNumber ? { reservationNumber: matchedReservationNumber } : {}),
          signatureVerified,
          eventTimestamp: toIsoFromUnixSeconds(msg?.timestamp),
          receivedAt: new Date().toISOString(),
        });
        processedMessages += 1;
      }
    }
  }

  await appendWhatsAppWebhookEvents(eventsToStore);

  return {
    ok: true,
    processedStatuses,
    processedMessages,
  };
}
