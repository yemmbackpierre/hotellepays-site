import { v4 as uuidv4 } from 'uuid';
import { isPBEnabled, getServerPocketBase } from '../lib/pocketbase';
import {
  getReservationByNumber,
  getReservationsByEmail,
  saveReservationToFile,
  updateReservationRecord,
} from '../lib/reservationsStore.server';
import type {
  EmailReceiptSummary,
  ReservationCurrencyInfo,
  ReservationExtraDetail,
  ReservationStatus,
  StoredReservation,
} from '../types/reservation';
import type { Customer, RoomParams } from '../types/hotelData';
import type { PricingOffer } from '../lib/pricingOffer';

export interface CreateBookingInput {
  reservationNumber?: string;
  arrival?: string | null;
  departure?: string | null;
  nights?: number;
  numRooms?: number;
  num_rooms?: number;
  rooms?: Record<string, RoomParams>;
  extras?: ReservationExtraDetail[];
  customer?: Customer;
  total_amount?: number;
  total?: number;
  currency?: ReservationCurrencyInfo;
  offer?: PricingOffer | null;
  label?: string;
  note_private?: string;
  notes?: string;
  emailReceipt?: EmailReceiptSummary;
  createdAt?: string;
}

const isValidEmail = (email: string) => {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
};

const validateBookingPayload = (payload: CreateBookingInput) => {
  if (!payload) throw new Error('Payload missing');
  const { customer, arrival, departure, numRooms } = payload;
  if (!customer || !customer.name) throw new Error('Customer name is required');
  if (!customer || !customer.email || !isValidEmail(customer.email)) {
    throw new Error('Customer email is required and must be valid');
  }
  if (!arrival) throw new Error('Arrival date is required');
  if (!departure) throw new Error('Departure date is required');
  const a = new Date(arrival);
  const d = new Date(departure);
  if (Number.isNaN(a.getTime()) || Number.isNaN(d.getTime()) || a >= d) {
    throw new Error('Invalid dates');
  }
  if (!numRooms || Number(numRooms) <= 0) throw new Error('numRooms must be at least 1');
};

export const bookingsService = {
  createBooking: async (payload: CreateBookingInput) => {
    validateBookingPayload(payload);

    const reservationNumber =
      payload.reservationNumber?.trim() ||
      `RCHLP00${uuidv4().split('-')[0].toUpperCase()}`;

    const id = uuidv4();
    const storedRecord: StoredReservation = {
      id,
      reservationNumber,
      arrival: new Date(payload.arrival as string).toISOString(),
      departure: new Date(payload.departure as string).toISOString(),
      nights: Number(payload.nights || 1),
      numRooms: Number(payload.numRooms || payload.num_rooms || 1),
      rooms: payload.rooms || {},
      extras: Array.isArray(payload.extras) ? payload.extras : [],
      customer: payload.customer as Customer,
      total: Number(payload.total_amount ?? payload.total ?? 0),
      currency: payload.currency,
      offer: payload.offer ?? null,
      label: payload.label,
      note_private: payload.note_private || payload.notes,
      status: 'pending',
      paymentStatus: 'unpaid',
      emailReceipt: payload.emailReceipt,
      createdAt: payload.createdAt || new Date().toISOString(),
    };

    // Always persist in local JSON store so My Reservations & server lookups work reliably
    const savedLocal = await saveReservationToFile(storedRecord);

    if (!isPBEnabled()) {
      return {
        reservation_number: reservationNumber,
        persisted: true,
        reservation: savedLocal,
      };
    }

    // Optional PocketBase persistence when explicitly enabled
    const pb = await getServerPocketBase();
    try {
      const pbCollection = pb as unknown as {
        collection: (name: string) => {
          create: (data: Record<string, unknown>) => Promise<{ reservation_number?: string }>;
        };
      };
      const created = await pbCollection.collection('bookings').create({
        reservation_number: reservationNumber,
        checkIn: storedRecord.arrival,
        checkOut: storedRecord.departure,
        numRooms: storedRecord.numRooms,
        rooms: storedRecord.rooms,
        extras: storedRecord.extras,
        customer: storedRecord.customer,
        status: storedRecord.status,
        total_amount: storedRecord.total,
        currency: storedRecord.currency?.code || 'XOF',
        offer: storedRecord.offer || null,
        nights: storedRecord.nights,
        notes: storedRecord.note_private || '',
      });
      return {
        reservation_number: created.reservation_number || reservationNumber,
        persisted: true,
        pbRecord: created,
        reservation: savedLocal,
      };
    } catch (err) {
      console.error('PocketBase booking creation failed (kept in local store)', err);
      return {
        reservation_number: reservationNumber,
        persisted: true,
        reservation: savedLocal,
        warning: String(err),
      };
    }
  },

  listByEmail: async (email?: string | null): Promise<StoredReservation[]> => {
    return getReservationsByEmail(email);
  },

  getByReservationNumber: async (
    reservationNumber?: string | null
  ): Promise<StoredReservation | null> => {
    return getReservationByNumber(reservationNumber);
  },

  updateStatus: async (
    reservationNumber: string,
    email: string,
    status: ReservationStatus
  ): Promise<StoredReservation | null> => {
    const existing = await getReservationByNumber(reservationNumber);
    if (!existing) return null;
    if (
      existing.customer?.email?.trim().toLowerCase() !== email.trim().toLowerCase()
    ) {
      throw new Error('Accès non autorisé pour cette réservation.');
    }
    return updateReservationRecord(reservationNumber, { status });
  },
};
