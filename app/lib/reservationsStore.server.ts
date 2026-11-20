import fs from 'fs/promises';
import path from 'path';
import type { ReservationStatus, StoredReservation } from '@/app/types/reservation';

const RESERVATIONS_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'reservations.json');

let reservationsWriteQueue: Promise<void> = Promise.resolve();

function enqueueReservationsMutation<T>(fn: () => Promise<T>): Promise<T> {
  const next = reservationsWriteQueue.then(fn, fn);
  reservationsWriteQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export async function readReservationsFromFile(): Promise<StoredReservation[]> {
  try {
    const raw = await fs.readFile(RESERVATIONS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredReservation[]) : [];
  } catch {
    return [];
  }
}

async function writeReservationsToFile(items: StoredReservation[]): Promise<void> {
  await fs.mkdir(path.dirname(RESERVATIONS_FILE_PATH), { recursive: true });
  const tmpPath = `${RESERVATIONS_FILE_PATH}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(items, null, 2), 'utf-8');
  await fs.rename(tmpPath, RESERVATIONS_FILE_PATH);
}

export async function saveReservationToFile(
  reservation: StoredReservation
): Promise<StoredReservation> {
  return enqueueReservationsMutation(async () => {
    const existing = await readReservationsFromFile();
    const idx = existing.findIndex(
      (item) => item.reservationNumber === reservation.reservationNumber
    );

    const nowIso = new Date().toISOString();
    const nextRecord: StoredReservation = {
      ...reservation,
      createdAt: reservation.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...nextRecord };
    } else {
      existing.unshift(nextRecord);
    }

    await writeReservationsToFile(existing);
    return nextRecord;
  });
}

export async function getReservationsByEmail(email?: string | null): Promise<StoredReservation[]> {
  const all = await readReservationsFromFile();
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return [];

  return all
    .filter((item) => (item.customer?.email || '').trim().toLowerCase() === normalized)
    .sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });
}

export async function getReservationByNumber(
  reservationNumber?: string | null
): Promise<StoredReservation | null> {
  if (!reservationNumber) return null;
  const all = await readReservationsFromFile();
  return all.find((item) => item.reservationNumber === reservationNumber) || null;
}

export async function updateReservationRecord(
  reservationNumber: string,
  patch: Partial<StoredReservation> & { status?: ReservationStatus }
): Promise<StoredReservation | null> {
  return enqueueReservationsMutation(async () => {
    const all = await readReservationsFromFile();
    const idx = all.findIndex((item) => item.reservationNumber === reservationNumber);
    if (idx < 0) return null;

    const updated: StoredReservation = {
      ...all[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    await writeReservationsToFile(all);
    return updated;
  });
}
