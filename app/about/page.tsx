import React from 'react';
import BackToTop from "@/app/layouts/BackToTop";
import AboutSection from "@/app/components/AboutSection";
import GallerySection from "@/app/components/GallerySection";
import TestimonialSection from "@/app/components/TestimonialSection";
import FanfactSection from "@/app/components/FanfactSection";
import ServicesSection from "@/app/components/ServicesSection";
import Breadcrumb from "@/app/layouts/Breadcrumb";
export default function Component() {
    const tpaths: { name: string; link?: string; }[]=[
        { name: 'Accueil', link: '/' },
        { name: 'À propos', link:  '' },
    ];
    return   <>

    <Breadcrumb paths={tpaths} title={"À propos de l'Hotel lepays"} backgroundImage={'/assets/images/about/about-bg.jpg'} />
    <BackToTop/>
    <AboutSection page="about" />
    <FanfactSection/>
    <ServicesSection/>
    <TestimonialSection/>

</>; }
