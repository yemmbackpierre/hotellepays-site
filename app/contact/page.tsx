import type { Metadata } from 'next';
import { suggestKeywords } from '@/app/lib/seo';

const title = 'Contact - Hôtel Le Pays';
const description = 'Contactez l\'Hôtel Le Pays à Sendou — téléphone, email et WhatsApp pour toute demande ou réservation.';

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
}

import React from 'react';
import TestimonialSection from "@/app/components/TestimonialSection";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import ContactSection from "@/app/components/ContactSection";
export default function Component() {
    const tpaths: { name: string; link?: string; }[]=[
        { name: 'Accueil', link: '/' },
        { name: "Contact", link:  '' },
    ];
    return   <>

        <Breadcrumb paths={tpaths} title={"Contactez nous"} backgroundImage={'/assets/images/resource/service-island1-3.jpg'} />
        <ContactSection/>
        <TestimonialSection/>

    </>; }
