import type { Metadata } from 'next';
import { suggestKeywords } from '@/app/lib/seo';

const title = 'Chambres & Suites - Hôtel Le Pays';
const description = 'Découvrez nos chambres et suites à l\'Hôtel Le Pays : tarifs, équipements et disponibilité.';

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
}

import React from 'react';
import BackToTop from "@/app/layouts/BackToTop";
import TestimonialSection from "@/app/components/TestimonialSection";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import SuitesSection from "@/app/components/SuitesSection";
import RoomSection from "@/app/components/RoomSection";
import { getSiteContent } from "@/app/lib/siteContent";

export const dynamic = 'force-dynamic';

export default async function Component() {
    const siteContent = await getSiteContent();
    const tpaths: { name: string; link?: string; }[]=[
        { name: 'Accueil', link: '/' },
        { name: "Chambres & suites", link:  '' },
    ];
    return   <>

    <Breadcrumb paths={tpaths} title={"Chambres et suites"} backgroundImage={'/assets/images/rooms/room-bg.jpg'} />
    <BackToTop/>
    <SuitesSection suites={siteContent.suites} />
    <RoomSection rooms={siteContent.rooms} />
    <TestimonialSection testimonials={siteContent.testimonials} />

</>; }
