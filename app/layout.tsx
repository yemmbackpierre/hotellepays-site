import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/app/layouts/Footer";
import Header from "@/app/layouts/Header";
import LegacyScripts from "@/app/components/LegacyScripts";
import PublicShell from "@/app/components/PublicShell";
import { getSiteContent } from "@/app/lib/siteContent";
import React from "react";

export const dynamic = 'force-dynamic';

// Fonts
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Simple metadata constants
const siteUrl = 'https://hotellepays.com';
const metaTitle = 'Hôtel Le Pays — Hôtel 3★ à Sendou (Dakar)';
const metaDescription = "Site officiel de l’hôtel Le Pays — Hôtel 3 étoiles à Sendou. Réservez votre chambre, consultez nos services (restaurant, bar, piscine, salle de réunion) et contactez-nous.";
const ogImage = `${siteUrl}/assets/images/og-image.jpg`;

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    robots: 'index, follow',
    alternates: {
        canonical: siteUrl,
        languages: {
            fr: siteUrl,
        },
    },
    icons: {
        icon: [
            { url: '/assets/images/logo-x.png', sizes: '32x32', type: 'image/png' },
            { url: '/assets/images/logo-x.png', sizes: '16x16', type: 'image/png' },
        ],
        shortcut: '/assets/images/favicon.png',
        apple: '/assets/images/logo-x.png',
    },
    openGraph: {
        siteName: 'Hôtel Le Pays',
        title: metaTitle,
        description: metaDescription,
        type: 'website',
        url: siteUrl,
        images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: [ogImage],
    },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const siteContent = await getSiteContent();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Hotel",
        "name": "Hôtel Le Pays",
        "description": metaDescription,
        "url": siteUrl,
        "telephone": siteContent.footer.contact.phone || "+221776986382",
        "email": siteContent.footer.contact.email || "contact@hotellepays.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Sendou",
            "addressLocality": "Sendou",
            "addressRegion": "Dakar",
            "addressCountry": "SN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 14.654,
            "longitude": -17.040
        },
        "openingHours": "Mo-Su 00:00-23:59",
        "priceRange": "20 000 - 60 000 XOF",
        "image": [ogImage],
        "sameAs": [
            "https://www.facebook.com/",
            "https://www.instagram.com/"
        ]
    };

    return (
        <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <head>
            <link rel="sitemap" type="application/xml" title="Sitemap" href={siteUrl + '/sitemap.xml'}/>
            <link href="/assets/css/bootstrap.min.css" rel="stylesheet"/>
            <link href="/assets/css/flatpickr.min.css" rel="stylesheet"/>
            <link href="/assets/css/style.css" rel="stylesheet"/>
            <link rel="stylesheet" type="text/css" href="/assets/css/slick-theme.css"/>
            <link rel="stylesheet" type="text/css" href="/assets/css/slick.css"/>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"/>
        </head>
        <body suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}/>
        <PublicShell
            header={<Header data={siteContent.header} />}
            footer={<Footer data={siteContent.footer} />}
            scripts={<LegacyScripts />}
        >
            {children}
        </PublicShell>
        </body>
        </html>
    );
}
