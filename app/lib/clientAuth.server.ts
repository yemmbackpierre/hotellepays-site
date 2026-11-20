import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getAdminCookieConfig } from '@/app/lib/adminAuth';
import { readReservationsFromFile } from '@/app/lib/reservationsStore.server';
import type { UserProfile } from '@/app/types/user';

export const CLIENT_SESSION_COOKIE = 'lepays_client_session';

const OTP_STORE_PATH = path.join(process.cwd(), 'app', 'data', 'client-otps.json');
const CLIENT_PROFILES_PATH = path.join(process.cwd(), 'app', 'data', 'client-profiles.json');

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 5 * 1000; // 5 seconds
const OTP_MAX_ATTEMPTS = 5;
const CLIENT_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ClientSession {
  email: string;
  verifiedAt: string;
  exp: number;
}

interface StoredOtpRecord {
  email: string;
  codeHash: string;
  salt: string;
  expiresAt: number;
  createdAt: number;
  lastSentAt: number;
  attempts: number;
  used: boolean;
}

const getClientSessionSecret = (): string => {
  if (process.env.CLIENT_SESSION_SECRET) {
    return process.env.CLIENT_SESSION_SECRET;
  }
  if (process.env.ADMIN_SESSION_SECRET) {
    return `${process.env.ADMIN_SESSION_SECRET}:client`;
  }
  const globalAny = globalThis as unknown as { __lepaysClientSessionSecret?: string };
  if (!globalAny.__lepaysClientSessionSecret) {
    globalAny.__lepaysClientSessionSecret = crypto
      .createHash('sha256')
      .update(`${process.cwd()}:lepays-client-session-key`)
      .digest('hex');
  }
  return globalAny.__lepaysClientSessionSecret;
};

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function hashOtp(salt: string, code: string): string {
  return crypto.createHash('sha256').update(`${salt}:${code}`).digest('hex');
}

export function normalizeClientEmail(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

export function isValidClientEmail(email?: string | null): boolean {
  const trimmed = (email || '').trim();
  return Boolean(trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed));
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

export function createClientSessionToken(email: string): string {
  const normalized = normalizeClientEmail(email);
  const payload: ClientSession = {
    email: normalized,
    verifiedAt: new Date().toISOString(),
    exp: Date.now() + CLIENT_SESSION_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getClientSessionSecret())
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifyClientSessionToken(token?: string | null): ClientSession | null {
  if (!token || !token.includes('.')) return null;
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return null;

    const expectedSig = crypto
      .createHmac('sha256', getClientSessionSecret())
      .update(payloadB64)
      .digest('base64url');

    if (!safeCompare(sig, expectedSig)) return null;

    const parsed = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    ) as ClientSession;

    if (!parsed || typeof parsed.email !== 'string' || typeof parsed.exp !== 'number') {
      return null;
    }
    if (Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function getClientSession(): Promise<ClientSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  return verifyClientSessionToken(token);
}

export { getAdminCookieConfig as getClientCookieConfig };

let otpWriteQueue: Promise<void> = Promise.resolve();
function enqueueOtpMutation<T>(fn: () => Promise<T>): Promise<T> {
  const next = otpWriteQueue.then(fn, fn);
  otpWriteQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

async function readOtps(): Promise<StoredOtpRecord[]> {
  try {
    const raw = await fs.readFile(OTP_STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredOtpRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeOtps(records: StoredOtpRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(OTP_STORE_PATH), { recursive: true });
  const tmpPath = `${OTP_STORE_PATH}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(records, null, 2), 'utf-8');
  await fs.rename(tmpPath, OTP_STORE_PATH);
}

export async function issueClientOtp(rawEmail: string): Promise<
  | { ok: true; email: string; code: string; expiresInMinutes: number }
  | { ok: false; error: string; retryAfterSeconds?: number }
> {
  const email = normalizeClientEmail(rawEmail);
  if (!isValidClientEmail(email)) {
    return { ok: false, error: 'Veuillez saisir une adresse e-mail valide.' };
  }

  return enqueueOtpMutation(async () => {
    const now = Date.now();
    const existingAll = await readOtps();
    const current = existingAll.find((item) => item.email === email);

    if (current && !current.used && now - current.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS - (now - current.lastSentAt)) / 1000
      );
      return {
        ok: false,
        error: `Veuillez patienter ${retryAfterSeconds} seconde(s) avant de demander un nouveau code.`,
        retryAfterSeconds,
      };
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const salt = crypto.randomBytes(16).toString('hex');
    const codeHash = hashOtp(salt, code);

    // Purge expired/used records older than 1 hour and replace current email record
    const filtered = existingAll.filter(
      (item) => item.email !== email && item.expiresAt > now - 60 * 60 * 1000
    );

    filtered.unshift({
      email,
      codeHash,
      salt,
      expiresAt: now + OTP_TTL_MS,
      createdAt: now,
      lastSentAt: now,
      attempts: 0,
      used: false,
    });

    await writeOtps(filtered.slice(0, 500));

    return {
      ok: true,
      email,
      code,
      expiresInMinutes: Math.round(OTP_TTL_MS / 60000),
    };
  });
}

export async function verifyClientOtp(
  rawEmail: string,
  rawCode: string
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const email = normalizeClientEmail(rawEmail);
  const code = (rawCode || '').replace(/\s+/g, '').trim();

  if (!isValidClientEmail(email)) {
    return { ok: false, error: 'Adresse e-mail invalide.' };
  }
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: 'Le code de vérification doit contenir 6 chiffres.' };
  }

  return enqueueOtpMutation(async () => {
    const now = Date.now();
    const records = await readOtps();
    const idx = records.findIndex((item) => item.email === email);

    if (idx < 0) {
      return {
        ok: false,
        error: "Aucun code actif trouvé pour cet e-mail. Veuillez demander un nouveau code.",
      };
    }

    const record = records[idx];
    if (record.used) {
      return {
        ok: false,
        error: 'Ce code a déjà été utilisé. Veuillez demander un nouveau code.',
      };
    }
    if (now > record.expiresAt) {
      return {
        ok: false,
        error: 'Ce code de vérification a expiré. Veuillez en demander un nouveau.',
      };
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return {
        ok: false,
        error: 'Trop de tentatives incorrectes. Veuillez demander un nouveau code.',
      };
    }

    const candidateHash = hashOtp(record.salt, code);
    if (!safeCompare(candidateHash, record.codeHash)) {
      records[idx] = { ...record, attempts: record.attempts + 1 };
      await writeOtps(records);
      const remaining = Math.max(0, OTP_MAX_ATTEMPTS - (record.attempts + 1));
      return {
        ok: false,
        error:
          remaining > 0
            ? `Code de vérification incorrect (${remaining} tentative(s) restante(s)).`
            : 'Code incorrect. Veuillez demander un nouveau code.',
      };
    }

    // Consume OTP immediately (single-use)
    records[idx] = { ...record, used: true };
    await writeOtps(records);

    return { ok: true, email };
  });
}

let profileWriteQueue: Promise<void> = Promise.resolve();
function enqueueProfileMutation<T>(fn: () => Promise<T>): Promise<T> {
  const next = profileWriteQueue.then(fn, fn);
  profileWriteQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

async function readProfiles(): Promise<Record<string, UserProfile>> {
  try {
    const raw = await fs.readFile(CLIENT_PROFILES_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, UserProfile>)
      : {};
  } catch {
    return {};
  }
}

async function writeProfiles(map: Record<string, UserProfile>): Promise<void> {
  await fs.mkdir(path.dirname(CLIENT_PROFILES_PATH), { recursive: true });
  const tmpPath = `${CLIENT_PROFILES_PATH}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(map, null, 2), 'utf-8');
  await fs.rename(tmpPath, CLIENT_PROFILES_PATH);
}

export async function getMergedClientProfile(rawEmail: string): Promise<UserProfile> {
  const email = normalizeClientEmail(rawEmail);
  const [profiles, allReservations] = await Promise.all([
    readProfiles(),
    readReservationsFromFile(),
  ]);

  const saved = profiles[email];
  const latestReservationCustomer = allReservations
    .filter((r) => normalizeClientEmail(r.customer?.email) === email)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0]
    ?.customer;

  return {
    name: saved?.name || latestReservationCustomer?.name || '',
    email,
    phone: saved?.phone || latestReservationCustomer?.phone || '',
    whatsapp: saved?.whatsapp ?? Boolean(latestReservationCustomer?.whatsapp),
    updatedAt: saved?.updatedAt,
  };
}

export async function saveClientProfileToServer(
  rawEmail: string,
  patch: { name?: string; phone?: string; whatsapp?: boolean }
): Promise<UserProfile> {
  const email = normalizeClientEmail(rawEmail);
  return enqueueProfileMutation(async () => {
    const profiles = await readProfiles();
    const prev = profiles[email];
    const next: UserProfile = {
      name: typeof patch.name === 'string' ? patch.name.trim() : prev?.name || '',
      email,
      phone: typeof patch.phone === 'string' ? patch.phone.trim() : prev?.phone || '',
      whatsapp: typeof patch.whatsapp === 'boolean' ? patch.whatsapp : Boolean(prev?.whatsapp),
      updatedAt: new Date().toISOString(),
    };
    profiles[email] = next;
    await writeProfiles(profiles);
    return next;
  });
}
