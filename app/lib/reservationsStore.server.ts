import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  AdminAuditEntry,
  PaymentStatus,
  ReservationStatus,
  StoredReservation,
} from '@/app/types/reservation';

const RESERVATIONS_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'reservations.json');
const AUDIT_LOG_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'admin-audit-logs.json');

let reservationsWriteQueue: Promise<void> = Promise.resolve();
let auditWriteQueue: Promise<void> = Promise.resolve();

function enqueueReservationsMutation<T>(fn: () => Promise<T>): Promise<T> {
  const next = reservationsWriteQueue.then(fn, fn);
  reservationsWriteQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

function enqueueAuditMutation<T>(fn: () => Promise<T>): Promise<T> {
  const next = auditWriteQueue.then(fn, fn);
  auditWriteQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export function normalizeReservationStatus(status?: unknown): ReservationStatus {
  if (
    status === 'pending' ||
    status === 'confirmed' ||
    status === 'cancelled' ||
    status === 'completed'
  ) {
    return status;
  }
  return 'pending';
}

export function normalizePaymentStatus(paymentStatus?: unknown): PaymentStatus {
  if (paymentStatus === 'paid' || paymentStatus === 'partial' || paymentStatus === 'unpaid') {
    return paymentStatus;
  }
  return 'unpaid';
}

export function normalizeStoredReservation(raw: StoredReservation): StoredReservation {
  return {
    ...raw,
    status: normalizeReservationStatus(raw.status),
    paymentStatus: normalizePaymentStatus(raw.paymentStatus),
    numRooms: Number(raw.numRooms || 1),
    nights: Number(raw.nights || 1),
    total: Number(raw.total || 0),
    extras: Array.isArray(raw.extras) ? raw.extras : [],
    rooms: raw.rooms && typeof raw.rooms === 'object' ? raw.rooms : {},
    pdfHistory: Array.isArray(raw.pdfHistory) ? raw.pdfHistory : [],
  };
}

export async function readReservationsFromFile(): Promise<StoredReservation[]> {
  try {
    const raw = await fs.readFile(RESERVATIONS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as StoredReservation[]).map(normalizeStoredReservation);
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
    const nextRecord = normalizeStoredReservation({
      ...reservation,
      createdAt: reservation.createdAt || nowIso,
      updatedAt: nowIso,
    });

    if (idx >= 0) {
      existing[idx] = normalizeStoredReservation({ ...existing[idx], ...nextRecord });
    } else {
      existing.unshift(nextRecord);
    }

    await writeReservationsToFile(existing);
    return existing[idx >= 0 ? idx : 0];
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
  const target = reservationNumber.trim().toLowerCase();
  const all = await readReservationsFromFile();
  return (
    all.find((item) => (item.reservationNumber || '').trim().toLowerCase() === target) || null
  );
}

export async function updateReservationRecord(
  reservationNumber: string,
  patch: Partial<StoredReservation> & { status?: ReservationStatus }
): Promise<StoredReservation | null> {
  return enqueueReservationsMutation(async () => {
    const all = await readReservationsFromFile();
    const target = reservationNumber.trim().toLowerCase();
    const idx = all.findIndex(
      (item) => (item.reservationNumber || '').trim().toLowerCase() === target
    );
    if (idx < 0) return null;

    const updated = normalizeStoredReservation({
      ...all[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    });
    all[idx] = updated;
    await writeReservationsToFile(all);
    return updated;
  });
}

export async function deleteReservationRecord(
  reservationNumber: string
): Promise<StoredReservation | null> {
  return enqueueReservationsMutation(async () => {
    const all = await readReservationsFromFile();
    const target = reservationNumber.trim().toLowerCase();
    const idx = all.findIndex(
      (item) => (item.reservationNumber || '').trim().toLowerCase() === target
    );
    if (idx < 0) return null;

    const [removed] = all.splice(idx, 1);
    await writeReservationsToFile(all);
    return removed;
  });
}

export interface ReservationQueryOptions {
  q?: string;
  status?: 'all' | ReservationStatus;
  from?: string;
  to?: string;
  sort?: 'createdAt_desc' | 'createdAt_asc' | 'arrival_asc' | 'arrival_desc' | 'total_desc';
  page?: number;
  pageSize?: number;
}

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export function computeReservationStats(items: StoredReservation[]): ReservationStats {
  const stats: ReservationStats = {
    total: items.length,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  };
  for (const item of items) {
    const st = normalizeReservationStatus(item.status);
    if (st === 'pending') stats.pending += 1;
    else if (st === 'confirmed') stats.confirmed += 1;
    else if (st === 'cancelled') stats.cancelled += 1;
    else if (st === 'completed') stats.completed += 1;
  }
  return stats;
}

export async function queryAllReservations(options: ReservationQueryOptions = {}): Promise<{
  items: StoredReservation[];
  allFiltered: StoredReservation[];
  totalCount: number;
  stats: ReservationStats;
  page: number;
  pageSize: number;
}> {
  const all = await readReservationsFromFile();
  const stats = computeReservationStats(all);

  const q = (options.q || '').trim().toLowerCase();
  const statusFilter = options.status && options.status !== 'all' ? options.status : null;
  const fromMs = options.from ? new Date(options.from).getTime() : NaN;
  const toMs = options.to ? new Date(`${options.to}T23:59:59.999Z`).getTime() : NaN;

  const filtered = all.filter((item) => {
    if (statusFilter && item.status !== statusFilter) {
      return false;
    }

    if (q) {
      const haystack = [
        item.reservationNumber,
        item.customer?.name,
        item.customer?.phone,
        item.customer?.email,
        item.offer?.title,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (!Number.isNaN(fromMs) || !Number.isNaN(toMs)) {
      const dateRef = new Date(item.arrival || item.createdAt || 0).getTime();
      if (Number.isNaN(dateRef)) return false;
      if (!Number.isNaN(fromMs) && dateRef < fromMs) return false;
      if (!Number.isNaN(toMs) && dateRef > toMs) return false;
    }

    return true;
  });

  const sortMode = options.sort || 'createdAt_desc';
  filtered.sort((a, b) => {
    if (sortMode === 'createdAt_asc') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortMode === 'arrival_asc') {
      return new Date(a.arrival || 0).getTime() - new Date(b.arrival || 0).getTime();
    }
    if (sortMode === 'arrival_desc') {
      return new Date(b.arrival || 0).getTime() - new Date(a.arrival || 0).getTime();
    }
    if (sortMode === 'total_desc') {
      return Number(b.total || 0) - Number(a.total || 0);
    }
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize || 15)));
  const page = Math.max(1, Number(options.page || 1));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    allFiltered: filtered,
    totalCount: filtered.length,
    stats,
    page,
    pageSize,
  };
}

export async function readAuditLogs(reservationNumber?: string): Promise<AdminAuditEntry[]> {
  try {
    const raw = await fs.readFile(AUDIT_LOG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? (parsed as AdminAuditEntry[]) : [];
    if (!reservationNumber) return list;
    const target = reservationNumber.trim().toLowerCase();
    return list.filter((e) => (e.reservationNumber || '').trim().toLowerCase() === target);
  } catch {
    return [];
  }
}

export async function appendAuditLog(
  entry: Omit<AdminAuditEntry, 'id' | 'createdAt'>
): Promise<AdminAuditEntry> {
  return enqueueAuditMutation(async () => {
    const existing = await readAuditLogs();
    const nextEntry: AdminAuditEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    existing.unshift(nextEntry);
    const trimmed = existing.slice(0, 500);
    await fs.mkdir(path.dirname(AUDIT_LOG_FILE_PATH), { recursive: true });
    const tmpPath = `${AUDIT_LOG_FILE_PATH}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(trimmed, null, 2), 'utf-8');
    await fs.rename(tmpPath, AUDIT_LOG_FILE_PATH);
    return nextEntry;
  });
}
