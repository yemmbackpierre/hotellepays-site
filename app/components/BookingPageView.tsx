import React from 'react';
import Link from 'next/link';
import TestimonialSection from '@/app/components/TestimonialSection';
import ReservationForm from '@/app/components/forms/ReservationForm';
import PrefillBadge from '@/app/components/PrefillBadge';
import type { PricingOffer } from '@/app/lib/pricingOffer';
import type { Testimonial } from '@/app/types/hotelData';

interface BookingPageViewProps {
  slug?: string;
  offer?: PricingOffer | null;
  testimonials?: Testimonial[];
}

export default function BookingPageView({
  slug = '',
  offer = null,
  testimonials,
}: BookingPageViewProps) {
  const bookingTitle = 'Réservation';
  const breadcrumbLabel = offer?.title || slug;

  return (
    <>
      <section
        className="bookingPageTitle"
        style={{ backgroundImage: `url('/assets/images/resource/page-title-bg2.png')` }}
      >
        <div className="bookingAutoContainer">
          <div className="bookingTitleOuter bookingTextCenter">
            <ul className="bookingPageBreadcrumb">
              <li>
                <Link href="/">Accueil</Link>
              </li>
              <li>
                {breadcrumbLabel ? (
                  <Link href="/booking/">{bookingTitle}</Link>
                ) : (
                  bookingTitle
                )}
              </li>
              {breadcrumbLabel && <li>{breadcrumbLabel}</li>}
            </ul>
          </div>
        </div>
        <PrefillBadge offer={offer} />
        <ReservationForm initialOffer={offer} />
      </section>

      <TestimonialSection testimonials={testimonials} />
    </>
  );
}
