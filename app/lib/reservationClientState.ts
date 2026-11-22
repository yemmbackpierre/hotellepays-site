import type { StoredReservation } from '@/app/types/reservation';
import type { UserProfile } from '@/app/types/user';

export const USER_PROFILE_STORAGE_KEY = 'lepays_user_profile';
export const USER_RESERVATIONS_STORAGE_KEY = 'lepays_user_reservations';

export function getStoredUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      whatsapp: Boolean(parsed.whatsapp),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function saveStoredUserProfile(profile: UserProfile): UserProfile {
  const next: UserProfile = {
    name: profile.name.trim(),
    email: profile.email.trim(),
    phone: profile.phone.trim(),
    whatsapp: Boolean(profile.whatsapp),
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota failures
    }
  }
  return next;
}

export function getStoredReservations(): StoredReservation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(USER_RESERVATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredReservation[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredReservationsList(list: StoredReservation[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(USER_RESERVATIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
  } catch {
    // ignore storage quota failures
  }
}

export function upsertStoredReservation(reservation: StoredReservation): StoredReservation[] {
  const current = getStoredReservations();
  const idx = current.findIndex(
    (item) => item.reservationNumber === reservation.reservationNumber
  );
  const next = [...current];
  if (idx >= 0) {
    next[idx] = { ...next[idx], ...reservation };
  } else {
    next.unshift(reservation);
  }
  saveStoredReservationsList(next);
  return next;
}

export function mergeReservations(
  serverReservations: StoredReservation[],
  localReservations: StoredReservation[],
  filterEmail?: string
): StoredReservation[] {
  const byNumber = new Map<string, StoredReservation>();
  const normalizedEmail = (filterEmail || '').trim().toLowerCase();

  for (const item of localReservations) {
    if (!item?.reservationNumber) continue;
    if (
      normalizedEmail &&
      item.customer?.email &&
      item.customer.email.trim().toLowerCase() !== normalizedEmail
    ) {
      continue;
    }
    byNumber.set(item.reservationNumber, item);
  }

  for (const item of serverReservations) {
    if (!item?.reservationNumber) continue;
    const prev = byNumber.get(item.reservationNumber);
    byNumber.set(item.reservationNumber, prev ? { ...prev, ...item } : item);
  }

  return Array.from(byNumber.values()).sort((a, b) => {
    const ta = new Date(a.createdAt || a.arrival || 0).getTime();
    const tb = new Date(b.createdAt || b.arrival || 0).getTime();
    return tb - ta;
  });
}

export function partitionReservations(
  reservations: StoredReservation[],
  referenceDate: Date = new Date()
): {
  upcoming: StoredReservation[];
  past: StoredReservation[];
  cancelled: StoredReservation[];
} {
  const nowMs = referenceDate.getTime();
  const upcoming: StoredReservation[] = [];
  const past: StoredReservation[] = [];
  const cancelled: StoredReservation[] = [];

  for (const item of reservations) {
    if (item.status === 'cancelled') {
      cancelled.push(item);
      continue;
    }
    if (item.status === 'completed') {
      past.push(item);
      continue;
    }
    const endDate = new Date(item.departure || item.arrival || item.createdAt || 0);
    if (!Number.isNaN(endDate.getTime()) && endDate.getTime() >= nowMs) {
      upcoming.push(item);
    } else {
      past.push(item);
    }
  }

  // Sort upcoming soonest first; past & cancelled most recent first
  upcoming.sort((a, b) => {
    const ta = new Date(a.arrival || a.departure || 0).getTime();
    const tb = new Date(b.arrival || b.departure || 0).getTime();
    return ta - tb;
  });

  past.sort((a, b) => {
    const ta = new Date(a.departure || a.arrival || a.createdAt || 0).getTime();
    const tb = new Date(b.departure || b.arrival || b.createdAt || 0).getTime();
    return tb - ta;
  });

  return { upcoming, past, cancelled };
}
