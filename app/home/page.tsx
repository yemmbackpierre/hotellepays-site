// app/pages/home/page.tsx
import type { Metadata } from 'next';
import React from 'react';
import Preloader from "@/app/layouts/Preloader";
import BackToTop from "@/app/layouts/BackToTop";
import BannerSlider from "@/app/components/BannerSlider";
import CheckoutFormSection from "@/app/components/CheckoutFormSection";
import AboutSection from "@/app/components/AboutSection";
import DestinationSection from "@/app/components/DestinationSection";
import FeaturesSection from "@/app/components/FeaturesSection";
import GallerySection from "@/app/components/GallerySection";
import SuitesSection from '@/app/components/SuitesSection';
import TestimonialSection from "@/app/components/TestimonialSection";
import BlogSection from "@/app/components/BlogSection";
import InstagramSection from "@/app/components/InstagramSection";
import PresentationRomsSection from "@/app/components/PresentationRomsSection";
import FoodExploreSection from "@/app/components/FoodExploreSection";
import { suggestKeywords } from '@/app/lib/seo';

const title = "Hôtel Le Pays — Hôtel 3 étoiles à Sendou (Dakar)";
const description = "Hôtel Le Pays à Sendou (Dakar) : chambres, suites, restaurant, bar, piscine et salle de réunion. Réservez maintenant au meilleur tarif.";

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
}

const HomePage = () => {
    return (
        <>

            <Preloader/>
            <BackToTop/>
            <BannerSlider/>
            <CheckoutFormSection/>
            <AboutSection page="home" />
            <PresentationRomsSection/>
            <FeaturesSection/>
            <GallerySection/>
            <SuitesSection/>
            <FoodExploreSection/>
            <DestinationSection/>
            <TestimonialSection/>
            <BlogSection/>
            <InstagramSection/>

        </>
    );
};

export default HomePage;
/*
  <Header/>

<ExploreSection/>
<TestimonialSection/>
<BlogSection/>
<InstagramSection/>

 */