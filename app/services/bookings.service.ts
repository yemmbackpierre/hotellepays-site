import { BookingInfos, Customer } from '../types/hotelData';
import { isPBEnabled, getServerPocketBase } from '../lib/pocketbase';
import { v4 as uuidv4 } from 'uuid';

const isValidEmail = (email: string) => {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
};

const validateBookingPayload = (payload: any) => {
  if (!payload) throw new Error('Payload missing');
  const { customer, arrival, departure, numRooms } = payload;
  if (!customer || !customer.name) throw new Error('Customer name is required');
  if (!customer || !customer.email || !isValidEmail(customer.email)) throw new Error('Customer email is required and must be valid');
  if (!arrival) throw new Error('Arrival date is required');
  if (!departure) throw new Error('Departure date is required');
  const a = new Date(arrival);
  const d = new Date(departure);
  if (isNaN(a.getTime()) || isNaN(d.getTime()) || a >= d) throw new Error('Invalid dates');
  if (!numRooms || Number(numRooms) <= 0) throw new Error('numRooms must be at least 1');
};

export const bookingsService = {
  createBooking: async (payload: any) => {
    validateBookingPayload(payload);

    const reservation_number = `LP-${uuidv4().split('-')[0].toUpperCase()}`;

    const recordData = {
      reservation_number,
      checkIn: new Date(payload.arrival).toISOString(),
      checkOut: new Date(payload.departure).toISOString(),
      numRooms: Number(payload.numRooms || payload.num_rooms || 1),
      rooms: payload.rooms || {},
      extras: payload.extras || [],
      customer: payload.customer || {},
      status: 'pending',
      total_amount: payload.total_amount || 0,
      currency: payload.currency || 'XOF',
      notes: payload.notes || ''
    };

    if (!isPBEnabled()) {
      // fallback: log to server and return a fake reservation (non-persisted)
      // eslint-disable-next-line no-console
      console.warn('PocketBase not enabled - booking fallback', recordData);
      return { reservation_number, persisted: false };
    }

    // create in PocketBase using server/admin client
    const pb = await getServerPocketBase();
    try {
      // using any to call SDK create (types may differ)
      const created = await (pb as any).collection('bookings').create(recordData);
      return { reservation_number: created.reservation_number || reservation_number, persisted: true, pbRecord: created };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PocketBase booking creation failed', err);
      // fall back to returning reservation number but mark not persisted
      return { reservation_number, persisted: false, error: String(err) };
    }
  }
};

