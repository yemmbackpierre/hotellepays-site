import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'lepays_admin_session';

export function getAdminCookieConfig(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto') || '';
  const origin = req.headers.get('origin') || '';
  const referer = req.headers.get('referer') || '';
  const isHttps =
    proto.includes('https') ||
    origin.startsWith('https://') ||
    referer.startsWith('https://') ||
    req.url.startsWith('https://');

  return {
    httpOnly: true,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    secure: isHttps,
    ...(isHttps ? { partitioned: true } : {}),
    path: '/',
  };
}

export interface AdminRecord {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export interface AdminSession {
  email: string;
  name: string;
  role: string;
  exp: number;
}

const ADMINS_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'admins.json');

const getSessionSecret = (): string => {
  if (process.env.ADMIN_SESSION_SECRET) {
    return process.env.ADMIN_SESSION_SECRET;
  }
  const globalAny = globalThis as unknown as { __lepaysSessionSecret?: string };
  if (!globalAny.__lepaysSessionSecret) {
    // Derive deterministic per-machine fallback secret when env var is not explicitly configured
    globalAny.__lepaysSessionSecret = crypto
      .createHash('sha256')
      .update(`${process.cwd()}:lepays-dsb-session-key`)
      .digest('hex');
  }
  return globalAny.__lepaysSessionSecret;
};

export async function readAdminsFromFile(): Promise<AdminRecord[]> {
  try {
    const raw = await fs.readFile(ADMINS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is AdminRecord =>
          Boolean(item && typeof item.email === 'string' && typeof item.password === 'string')
      );
    }
    return [];
  } catch (err) {
    console.error('[AdminAuth] Failed to read admins.json:', err);
    return [];
  }
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyPassword(inputPassword: string, storedPassword: string): boolean {
  if (storedPassword.startsWith('sha256:')) {
    const expected = storedPassword.slice('sha256:'.length);
    const actual = crypto.createHash('sha256').update(inputPassword).digest('hex');
    return safeCompare(actual, expected);
  }
  if (storedPassword.startsWith('scrypt:')) {
    const parts = storedPassword.split(':');
    if (parts.length === 3) {
      const [, salt, expectedHex] = parts;
      const derived = crypto.scryptSync(inputPassword, salt, 64).toString('hex');
      return safeCompare(derived, expectedHex);
    }
    return false;
  }
  return safeCompare(inputPassword, storedPassword);
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<Omit<AdminRecord, 'password'> | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;

  const admins = await readAdminsFromFile();
  const match = admins.find((a) => a.email.trim().toLowerCase() === normalizedEmail);
  if (!match) return null;

  if (!verifyPassword(password, match.password)) {
    return null;
  }

  return {
    email: match.email,
    name: match.name || match.email.split('@')[0],
    role: match.role || 'admin',
  };
}

export function createSessionToken(admin: { email: string; name?: string; role?: string }): string {
  const payload: AdminSession = {
    email: admin.email,
    name: admin.name || admin.email,
    role: admin.role || 'admin',
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifySessionToken(token?: string | null): AdminSession | null {
  if (!token || !token.includes('.')) return null;
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return null;

    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(payloadB64)
      .digest('base64url');

    if (!safeCompare(sig, expectedSig)) return null;

    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as AdminSession;
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

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
