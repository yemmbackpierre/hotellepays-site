import type { Customer, RoomParams } from './hotelData';
import type { PricingOffer } from '@/app/lib/pricingOffer';

export interface ReservationExtraDetail {
  name: string;
  unitPrice: number;
  qty: number;
  total: number;
  paidOnSite: boolean;
}

export interface ReservationCurrencyInfo {
  code: string;
  symbol: string;
  totalConverted?: number;
}

export interface EmailReceiptSummary {
  userSent: boolean;
  adminSent: boolean;
  mode: 'smtp' | 'resend' | 'outbox';
  userEmail: string;
  adminEmail: string;
  sentAt: string;
  userMessageId?: string;
  adminMessageId?: string;
  errors?: string[];
}

export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled';

export interface StoredReservation {
  id: string;
  reservationNumber: string;
  arrival: string | null;
  departure: string | null;
  nights: number;
  numRooms: number;
  rooms: Record<string, RoomParams>;
  extras: ReservationExtraDetail[];
  customer: Customer;
  total: number;
  currency?: ReservationCurrencyInfo;
  offer?: PricingOffer | null;
  label?: string;
  note_private?: string;
  status: ReservationStatus;
  emailReceipt?: EmailReceiptSummary;
  createdAt: string;
  updatedAt?: string;
}
