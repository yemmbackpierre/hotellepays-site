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
import { getSiteContent } from '@/app/lib/siteContent';

export const dynamic = 'force-dynamic';

const title = "Hôtel Le Pays — Hôtel 3 étoiles à Sendou (Dakar)";
const description = "Hôtel Le Pays à Sendou (Dakar) : chambres, suites, restaurant, bar, piscine et salle de réunion. Réservez maintenant au meilleur tarif.";

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
}

const HomePage = async () => {
    const siteContent = await getSiteContent();

    return (
        <>

            <Preloader/>
            <BackToTop/>
            <BannerSlider slides={siteContent.slider} />
            <CheckoutFormSection/>
            <AboutSection data={siteContent.about} page="home" />
            <PresentationRomsSection rooms={siteContent.presentationRooms} />
            <FeaturesSection features={siteContent.features} />
            <GallerySection images={siteContent.gallery} />
            <SuitesSection suites={siteContent.suites} />
            <FoodExploreSection items={siteContent.foods} />
            <DestinationSection destinations={siteContent.destinations} />
            <TestimonialSection testimonials={siteContent.testimonials} />
            <BlogSection posts={siteContent.posts} />
            <InstagramSection items={siteContent.instagram} />

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