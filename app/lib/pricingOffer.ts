import type { Pricing, RoomParams } from '@/app/types/hotelData';

export interface PricingOffer {
  slug: string;
  title: string;
  name: string;
  price: number;
  currency: string;
  per: string;
  roomType: Exclude<RoomParams['type'], ''>;
  clim: Exclude<RoomParams['clim'], ''>;
}

export function slugifyPricingTitle(value?: string | null): string {
  if (!value) return '';
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function inferRoomConfigFromPricing(pricing: Pricing): {
  roomType: Exclude<RoomParams['type'], ''>;
  clim: Exclude<RoomParams['clim'], ''>;
} {
  const haystack = `${pricing.title || ''} ${pricing.name || ''}`.toLowerCase();

  if (haystack.includes('suite') || Number(pricing.price) >= 60000) {
    return { roomType: 'suite', clim: 'oui' };
  }
  if (haystack.includes('famil')) {
    return { roomType: 'familiale', clim: 'oui' };
  }
  if (
    haystack.includes('nuitee') ||
    haystack.includes('nuitée') ||
    haystack.includes('double') ||
    haystack.includes('clim') ||
    Number(pricing.price) === 25000
  ) {
    return { roomType: 'double', clim: 'oui' };
  }
  return { roomType: 'simple', clim: 'non' };
}

export function toPricingOffer(pricing: Pricing): PricingOffer {
  const { roomType, clim } = inferRoomConfigFromPricing(pricing);
  const slug = slugifyPricingTitle(pricing.title) || slugifyPricingTitle(pricing.name) || 'offre';
  return {
    slug,
    title: pricing.title,
    name: pricing.name || slug,
    price: Number(pricing.price) || 0,
    currency: pricing.currency || 'Fr',
    per: pricing.per || 'par nuit',
    roomType,
    clim,
  };
}

export function getPricingBookingHref(pricing: Pricing): string {
  const rawLink = (pricing.link || '').trim();
  const slug = slugifyPricingTitle(pricing.title) || slugifyPricingTitle(pricing.name);

  if (!rawLink || rawLink.startsWith('/booking')) {
    return slug ? `/booking/${slug}/` : '/booking/';
  }

  return rawLink;
}

const LEGACY_SLUG_ALIASES: Record<string, string[]> = {
  'simple-room': ['chambre-journee', 'simple-room'],
  'double-room': ['chambre-nuitee', 'double-room'],
  'chambre-simple': ['chambre-journee', 'simple-room'],
  'chambre-double': ['chambre-nuitee', 'double-room'],
  suite: ['suite'],
};

export function resolveOfferFromPricings(
  pricings: Pricing[],
  identifier?: string | null
): PricingOffer | null {
  if (!identifier || !Array.isArray(pricings) || pricings.length === 0) {
    return null;
  }

  const normalized = slugifyPricingTitle(decodeURIComponent(String(identifier)));
  if (!normalized) return null;

  // 1. Exact title slug match
  const byTitleSlug = pricings.find((p) => slugifyPricingTitle(p.title) === normalized);
  if (byTitleSlug) return toPricingOffer(byTitleSlug);

  // 2. Alias match (e.g. legacy /booking/simple-room -> Chambre Journée)
  const aliases = LEGACY_SLUG_ALIASES[normalized];
  if (aliases) {
    for (const alias of aliases) {
      const match = pricings.find(
        (p) =>
          slugifyPricingTitle(p.title) === alias ||
          slugifyPricingTitle(p.name) === alias
      );
      if (match) return toPricingOffer(match);
    }
  }

  // 3. Exact `name` match
  const byName = pricings.find((p) => slugifyPricingTitle(p.name) === normalized);
  if (byName) return toPricingOffer(byName);

  // 4. Tail of `link` match
  const byLinkTail = pricings.find((p) => {
    const tail = (p.link || '').split('/').filter(Boolean).pop();
    return tail && slugifyPricingTitle(tail) === normalized;
  });
  if (byLinkTail) return toPricingOffer(byLinkTail);

  return null;
}
