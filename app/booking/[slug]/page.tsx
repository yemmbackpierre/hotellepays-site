import type { Metadata } from 'next';
import React from 'react';
import BookingPageView from '@/app/components/BookingPageView';
import { getSiteContent } from '@/app/lib/siteContent';
import { resolveOfferFromPricings } from '@/app/lib/pricingOffer';
import { suggestKeywords } from '@/app/lib/seo';

export const dynamic = 'force-dynamic';

type RouteParams = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const siteContent = await getSiteContent();
  const offer = resolveOfferFromPricings(siteContent.pricings, slug);

  const title = offer
    ? `Réservation ${offer.title} - Hôtel Le Pays`
    : 'Réservation - Hôtel Le Pays';
  const description = offer
    ? `Réservez l'offre ${offer.title} à ${offer.price.toLocaleString('fr-FR')} ${offer.currency} ${offer.per} à l'Hôtel Le Pays à Sendou.`
    : "Réservez votre chambre à l'Hôtel Le Pays à Sendou. Choisissez vos dates, le nombre de chambres et prévisualisez votre proforma.";

  return {
    title,
    description,
    keywords: suggestKeywords({ title, description }),
  };
}

export default async function BookingSlugPage({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams?: SearchParams;
}) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawOffer = resolvedSearchParams.offer;
  const offerParam = Array.isArray(rawOffer) ? rawOffer[0] : rawOffer;

  const siteContent = await getSiteContent();
  const offer =
    resolveOfferFromPricings(siteContent.pricings, slug) ||
    resolveOfferFromPricings(siteContent.pricings, offerParam);

  return (
    <BookingPageView
      slug={offer?.title || slug}
      offer={offer}
      testimonials={siteContent.testimonials}
    />
  );
}
