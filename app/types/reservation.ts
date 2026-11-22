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

export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface WhatsAppNotificationSummary {
  configured: boolean;
  sent: boolean;
  provider: 'meta-cloud-api';
  messageId?: string;
  sentAt?: string;
  error?: string;
  channel?: 'text' | 'template';
}

export interface ReservationPdfDispatchSummary {
  channel: 'email' | 'whatsapp';
  sent: boolean;
  sentAt: string;
  sentBy?: string;
  recipient?: string;
  mode?: string;
  messageId?: string;
  error?: string;
}

export interface AdminAuditEntry {
  id: string;
  action:
    | 'booking.created'
    | 'reservation.validated'
    | 'reservation.cancelled'
    | 'reservation.completed'
    | 'reservation.payment_updated'
    | 'reservation.deleted'
    | 'reservation.pdf_exported'
    | 'reservation.pdf_emailed'
    | 'reservation.pdf_whatsapp_sent'
    | 'reservation.whatsapp_manager_notified';
  reservationNumber: string;
  actorEmail: string;
  actorRole: 'admin' | 'client' | 'system';
  details?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}

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
  paymentStatus?: PaymentStatus;
  validatedAt?: string;
  validatedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  completedAt?: string;
  completedBy?: string;
  emailReceipt?: EmailReceiptSummary;
  whatsappNotification?: WhatsAppNotificationSummary;
  pdfHistory?: ReservationPdfDispatchSummary[];
  createdAt: string;
  updatedAt?: string;
}
