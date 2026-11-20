import type { Metadata } from 'next';
import React from 'react';
import BookingPageView from '@/app/components/BookingPageView';
import { getSiteContent } from '@/app/lib/siteContent';
import { resolveOfferFromPricings } from '@/app/lib/pricingOffer';
import { suggestKeywords } from '@/app/lib/seo';

export const dynamic = 'force-dynamic';

const title = 'Réservation - Hôtel Le Pays';
const description =
  "Réservez votre chambre à l'Hôtel Le Pays à Sendou. Choisissez vos dates, le nombre de chambres et prévisualisez votre proforma.";

export const metadata: Metadata = {
  title,
  description,
  keywords: suggestKeywords({ title, description }),
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function BookingPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawOffer = resolvedSearchParams.offer;
  const offerParam = Array.isArray(rawOffer) ? rawOffer[0] : rawOffer;

  const siteContent = await getSiteContent();
  const offer = resolveOfferFromPricings(siteContent.pricings, offerParam);

  return (
    <BookingPageView
      slug={offer?.title || ''}
      offer={offer}
      testimonials={siteContent.testimonials}
    />
  );
}
