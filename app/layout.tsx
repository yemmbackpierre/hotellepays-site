import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Footer from "@/app/layouts/Footer";
import Header from "@/app/layouts/Header";
import React from "react";

// Fonts
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Simple metadata constants (avoid complex Next metadata types in manual head markup)
const siteUrl = 'https://hotellepays.com';
const metaTitle = 'Hôtel Le Pays — Hôtel 3★ à Sendou (Dakar)';
const metaDescription = "Site officiel de l’hôtel Le Pays — Hôtel 3 étoiles à Sendou. Réservez votre chambre, consultez nos services (restaurant, bar, piscine, salle de réunion) et contactez-nous.";
const ogImage = `${siteUrl}/assets/images/og-image.jpg`;

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    // NOTE: Les coordonnées geo ci-dessous sont des placeholders approximatifs pour Sendou. Remplacez-les par les coordonnées exactes de l'hôtel si disponibles.
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Hotel",
        "name": "Hôtel Le Pays",
        "description": metaDescription,
        "url": siteUrl,
        "telephone": "+221776986382",
        "email": "contact@hotellepays.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Sendou",
            "addressLocality": "Sendou",
            "addressRegion": "Dakar",
            "addressCountry": "SN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 14.654, // placeholder
            "longitude": -17.040 // placeholder
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
        <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
        <head>
            <meta charSet="utf-8"/>
            <title>{metaTitle}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="description" content={metaDescription}/>
            <meta name="robots" content="index, follow"/>

            {/* Canonical */}
            <link rel="canonical" href={siteUrl}/>

            {/* Sitemap declaration */}
            <link rel="sitemap" type="application/xml" title="Sitemap" href={siteUrl + '/sitemap.xml'}/>

            {/* OpenGraph */}
            <meta property="og:site_name" content="Hôtel Le Pays"/>
            <meta property="og:title" content={metaTitle}/>
            <meta property="og:description" content={metaDescription}/>
            <meta property="og:type" content="hotel"/>
            <meta property="og:url" content={siteUrl}/>
            <meta property="og:image" content={ogImage}/>
            <meta property="og:image:width" content="1200"/>
            <meta property="og:image:height" content="630"/>

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image"/>
            <meta name="twitter:title" content={metaTitle}/>
            <meta name="twitter:description" content={metaDescription}/>
            <meta name="twitter:image" content={ogImage}/>

            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}/>

            {/* CSS */}
            <link href="/assets/css/bootstrap.min.css" rel="stylesheet"/>
            <link href="/assets/css/flatpickr.min.css" rel="stylesheet"/>
            <link href="/assets/css/style.css" rel="stylesheet"/>
            <link rel="stylesheet" type="text/css" href="/assets/css/slick-theme.css"/>
            <link rel="stylesheet" type="text/css" href="/assets/css/slick.css"/>
            <link rel="shortcut icon" href="/assets/images/favicon.png" type="image/x-icon"/>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"/>

            {/* Favicon / Site icon - utilise le logo fourni */}
            <link rel="icon" href="/assets/images/logo-x.png" />
            <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/logo-x.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/logo-x.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/logo-x.png" />

            {/* Hreflang (site en français) */}
            <link rel="alternate" hrefLang="fr" href={siteUrl}/>
            <script src='https://kit.fontawesome.com/a076d05399.js' crossOrigin='anonymous'></script>

        </head>
        <body suppressHydrationWarning>
        <div className="page-wrapper">
            <Header/>
            {children}
            <Footer/>
        </div>

        <script src='https://cdn.jotfor.ms/agent/embedjs/019ba0e88d9a75818a9eb585e5e34a649697/embed.js'></script>

        {/* Load jQuery first */}
        <Script src="/assets/js/jquery.js" strategy="beforeInteractive"/>

        {/* Load other dependencies after jQuery */}
        <Script src="/assets/js/popper.min.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/bootstrap.min.js" strategy="beforeInteractive"/>

        {/* Plugins that depend on jQuery */}
        <Script src="/assets/js/slick.min.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/slick-animation.min.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/jquery.fancybox.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/wow.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/appear.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/nice-select.min.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/mixitup.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/flatpickr.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/bxslider.js" strategy="beforeInteractive"/>

        {/* Other scripts */}
        <Script src="/assets/js/aos.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/gsap.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/ScrollTrigger.min.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/SplitText.min.js" strategy="beforeInteractive"/>
        <Script src="/assets/js/splitType.js" strategy="beforeInteractive"/>

        {/* Your custom scripts */}
        <Script src="/assets/js/script-gsap.js" strategy="afterInteractive"/>
        <Script src="/assets/js/script.js" strategy="afterInteractive"/>
        </body>
        </html>
    );
}
