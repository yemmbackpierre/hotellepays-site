import type { Metadata } from 'next';
import { suggestKeywords } from '@/app/lib/seo';

const title = 'Services - Hôtel Le Pays';
const description = 'Découvrez les services de l\'Hôtel Le Pays : piscine, salle de sport, spa, restauration et plus.';

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
}

import React from 'react';
import BackToTop from "@/app/layouts/BackToTop";
import TestimonialSection from "@/app/components/TestimonialSection";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import ServicesSection from "@/app/components/ServicesSection";
import ServiceSectionWinter from "@/app/components/ServiceSectionWinter";
export default function Component() {
    const tpaths: { name: string; link?: string; }[]=[
        { name: 'Accueil', link: '/' },
        { name: "Services", link:  '' },
    ];
    return   <>

        <Breadcrumb paths={tpaths} title={"Nos Services"} backgroundImage={'/assets/images/resource/service-island1-3.jpg'} />
        <BackToTop/>
        <ServiceSectionWinter/>
        <ServicesSection/>
        <TestimonialSection/>

    </>; }
