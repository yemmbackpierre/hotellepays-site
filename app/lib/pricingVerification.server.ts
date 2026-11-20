import { getSiteContent } from '@/app/lib/siteContent';
import { resolveOfferFromPricings, type PricingOffer } from '@/app/lib/pricingOffer';
import type { RoomParams } from '@/app/types/hotelData';

export const STANDARD_PRICES = {
  suite: 60000,
  clim: 25000,
  vent: 20000,
} as const;

export interface VerifyBookingPricingInput {
  arrival?: string | null;
  departure?: string | null;
  numRooms?: number;
  rooms?: Record<string, RoomParams>;
  offerSlug?: string | null;
  offerPrice?: number;
  total?: number;
}

export interface VerifiedBookingPricingResult {
  nights: number;
  roomTotalPerNight: number;
  verifiedTotal: number;
  offer: PricingOffer | null;
  roomBreakdown: Array<{
    key: string;
    type: string;
    clim: string;
    pricePerNight: number;
    subtotal: number;
  }>;
}

export function computeNightsServer(arrival?: string | null, departure?: string | null): number {
  if (!arrival || !departure) return 1;
  const a = new Date(arrival);
  const d = new Date(departure);
  if (Number.isNaN(a.getTime()) || Number.isNaN(d.getTime())) return 1;
  const diff = d.getTime() - a.getTime();
  const nights = Math.ceil(diff / (1000 * 3600 * 24));
  return nights > 0 ? nights : 1;
}

export async function verifyAndComputeBookingPricing(
  input: VerifyBookingPricingInput
): Promise<VerifiedBookingPricingResult> {
  const siteContent = await getSiteContent();

  let verifiedOffer: PricingOffer | null = null;
  if (input.offerSlug) {
    verifiedOffer = resolveOfferFromPricings(siteContent.pricings, input.offerSlug);
    if (!verifiedOffer) {
      throw new Error("L'offre tarifaire sélectionnée est introuvable ou n'est plus disponible.");
    }
    if (
      input.offerPrice !== undefined &&
      Number.isFinite(Number(input.offerPrice)) &&
      Number(input.offerPrice) !== verifiedOffer.price
    ) {
      throw new Error("Le tarif de l'offre ne correspond pas au prix vérifié sur le serveur.");
    }
  }

  const nights = computeNightsServer(input.arrival, input.departure);
  const rooms = input.rooms && typeof input.rooms === 'object' ? input.rooms : {};
  const entries = Object.entries(rooms);

  let roomTotalPerNight = 0;
  const roomBreakdown: VerifiedBookingPricingResult['roomBreakdown'] = [];

  for (const [key, room] of entries) {
    if (!room || typeof room !== 'object' || !room.type) continue;

    let pricePerNight: number;
    if (key === 'room1' && verifiedOffer) {
      if (room.type !== verifiedOffer.roomType) {
        throw new Error("Le type de chambre ne correspond pas à l'offre sélectionnée.");
      }
      if (verifiedOffer.roomType !== 'suite' && room.clim !== verifiedOffer.clim) {
        throw new Error("L'option de confort ne correspond pas à l'offre sélectionnée.");
      }
      pricePerNight = verifiedOffer.price;
    } else if (room.type === 'suite') {
      pricePerNight = STANDARD_PRICES.suite;
    } else {
      pricePerNight = room.clim === 'oui' ? STANDARD_PRICES.clim : STANDARD_PRICES.vent;
    }

    roomTotalPerNight += pricePerNight;
    roomBreakdown.push({
      key,
      type: room.type,
      clim: room.clim,
      pricePerNight,
      subtotal: pricePerNight * nights,
    });
  }

  const verifiedTotal = roomTotalPerNight * nights;

  if (
    input.total !== undefined &&
    Number.isFinite(Number(input.total)) &&
    Number(input.total) !== verifiedTotal
  ) {
    throw new Error('Le montant total envoyé ne correspond pas au tarif vérifié côté serveur.');
  }

  return {
    nights,
    roomTotalPerNight,
    verifiedTotal,
    offer: verifiedOffer,
    roomBreakdown,
  };
}
