import crypto from 'crypto';
import type { NextRequest } from 'next/server';

const getVerificationSecret = (): string => {
  if (process.env.ADMIN_SESSION_SECRET) {
    return `${process.env.ADMIN_SESSION_SECRET}:qr-verify`;
  }
  const globalAny = globalThis as unknown as { __lepaysQrSecret?: string };
  if (!globalAny.__lepaysQrSecret) {
    globalAny.__lepaysQrSecret = crypto
      .createHash('sha256')
      .update(`${process.cwd()}:lepays-reservation-qr-verify-key`)
      .digest('hex');
  }
  return globalAny.__lepaysQrSecret;
};

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createReservationVerificationSignature(
  reservationNumber: string,
  createdAt?: string
): string {
  const ref = reservationNumber.trim().toUpperCase();
  const payload = `${ref}:${createdAt || ''}`;
  return crypto
    .createHmac('sha256', getVerificationSecret())
    .update(payload)
    .digest('base64url')
    .slice(0, 22);
}

export function verifyReservationVerificationSignature(
  reservationNumber: string,
  createdAt: string | undefined,
  sig?: string | null
): boolean {
  if (!reservationNumber || !sig) return false;
  const expected = createReservationVerificationSignature(reservationNumber, createdAt);
  return safeEqual(sig.trim(), expected);
}

export function resolvePublicSiteBaseUrl(originOverride?: string): string {
  const raw =
    originOverride ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'https://hotellepays.com';
  return raw.replace(/\/+$/, '');
}

export function buildReservationVerificationUrl(
  reservationNumber: string,
  createdAt?: string,
  originOverride?: string
): string {
  const sig = createReservationVerificationSignature(reservationNumber, createdAt);
  const baseUrl = resolvePublicSiteBaseUrl(originOverride);
  return `${baseUrl}/verify-reservation/?ref=${encodeURIComponent(
    reservationNumber.trim()
  )}&sig=${encodeURIComponent(sig)}`;
}

export function getRequestPublicOrigin(req: NextRequest): string | undefined {
  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost || req.headers.get('host')?.split(',')[0]?.trim();
  if (host && !host.startsWith('0.0.0.0')) {
    const protoHeader = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const proto =
      protoHeader ||
      (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  if (req.nextUrl?.origin && !req.nextUrl.origin.includes('0.0.0.0')) {
    return req.nextUrl.origin;
  }
  return undefined;
}

/**
 * Verifies same-origin for browser state-changing admin requests.
 * Allows requests without an Origin header (e.g., server-to-server or curl),
 * while blocking cross-site Origin mismatches with 403.
 */
export function isSameOriginAdminRequest(req: NextRequest): boolean {
  const originHeader = req.headers.get('origin');
  if (!originHeader) return true;
  try {
    const originHost = new URL(originHeader).host.toLowerCase();
    const requestHost = (
      req.headers.get('x-forwarded-host') ||
      req.headers.get('host') ||
      req.nextUrl.host ||
      ''
    )
      .split(',')[0]
      .trim()
      .toLowerCase();
    if (!requestHost) return true;
    return originHost === requestHost;
  } catch {
    return false;
  }
}

export function escapeCsvCell(value: unknown): string {
  const raw = String(value ?? '');
  // Mitigate CSV formula injection (=, +, -, @, tab, CR)
  const neutralized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${neutralized.replace(/"/g, '""')}"`;
}
