import React from 'react';
import TestimonialSection from "@/app/components/TestimonialSection";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import FAQSection from "@/app/components/FAQSection";
import { getSiteContent } from "@/app/lib/siteContent";

export const dynamic = 'force-dynamic';

export default async function Component() {
    const siteContent = await getSiteContent();
    const tpaths: { name: string; link?: string; }[]=[
        { name: 'Accueil', link: '/' },
        { name: "Foire aux questions", link:  '' },
    ];
    return   <>

        <Breadcrumb paths={tpaths} title={"Questions fréquemment posées"} backgroundImage={'/assets/images/resource/service-island1-3.jpg'} />
        <FAQSection faqs={siteContent.faqs} />
        <TestimonialSection testimonials={siteContent.testimonials} />

    </>; }
