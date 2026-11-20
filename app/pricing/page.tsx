import type { Metadata } from 'next';
import { suggestKeywords } from '@/app/lib/seo';

const title = 'Tarifs - Hôtel Le Pays';
const description = 'Consultez la grille tarifaire de l\'Hôtel Le Pays : chambres, suites et services.';

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
}

import React from 'react';
import BackToTop from "@/app/layouts/BackToTop";
import AboutSection from "@/app/components/AboutSection";
import GallerySection from "@/app/components/GallerySection";
import TestimonialSection from "@/app/components/TestimonialSection";
import FanfactSection from "@/app/components/FanfactSection";
import ServicesSection from "@/app/components/ServicesSection";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import PricingSection from "@/app/components/PricingSection";
import { getSiteContent } from "@/app/lib/siteContent";

export const dynamic = 'force-dynamic';

export default async function Component() {
    const siteContent = await getSiteContent();
    const tpaths: { name: string; link?: string; }[]=[
        { name: 'Accueil', link: '/' },
        { name: 'Nos tarifs', link:  '' },
    ];
    return   <>

    <Breadcrumb paths={tpaths} title={"À propos de notre grille tarifaire"} backgroundImage={'/assets/images/resource/page-title-bg.png'} />
    <BackToTop/>
    <PricingSection pricings={siteContent.pricings} />
    <TestimonialSection testimonials={siteContent.testimonials} />
</>; }
