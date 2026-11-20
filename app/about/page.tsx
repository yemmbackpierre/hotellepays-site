import React from 'react';
import BackToTop from "@/app/layouts/BackToTop";
import AboutSection from "@/app/components/AboutSection";
import TestimonialSection from "@/app/components/TestimonialSection";
import FanfactSection from "@/app/components/FanfactSection";
import ServicesSection from "@/app/components/ServicesSection";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import { getSiteContent } from "@/app/lib/siteContent";

export const dynamic = 'force-dynamic';

export default async function Component() {
    const siteContent = await getSiteContent();
    const tpaths: { name: string; link?: string; }[]=[
        { name: 'Accueil', link: '/' },
        { name: 'À propos', link:  '' },
    ];
    return   <>

    <Breadcrumb paths={tpaths} title={"À propos de l'Hotel lepays"} backgroundImage={'/assets/images/about/about-bg.jpg'} />
    <BackToTop/>
    <AboutSection data={siteContent.about} page="about" />
    <FanfactSection/>
    <ServicesSection services={siteContent.services} />
    <TestimonialSection testimonials={siteContent.testimonials} />

</>; }
