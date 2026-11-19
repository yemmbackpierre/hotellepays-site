// app/room-details/[slug]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { defaultRooms, defaultPresentationRoms, defaultSuites, debugLog, debugWarn } from "@/app/types/hotelData";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import RoomDetails from "@/app/components/RoomDetails";

// 🔹 NORMALIZE SLUG
const normalizeSlug = (s?: any) => {
    if (!s) return "";
    try {
        return decodeURIComponent(String(s)).replace(/\/+$/, "").toLowerCase();
    } catch (e) {
        console.warn("normalizeSlug error", e);
        return String(s).replace(/\/+$/, "").toLowerCase();
    }
};

// 🔹 FIND ROOM
const findRoomBySlug = (slug: any) => {
    debugLog("🔎 INPUT SLUG:", slug);

    const norm = normalizeSlug(slug);
    debugLog("✅ NORMALIZED INPUT SLUG:", norm);

    const allRooms = [...defaultRooms, ...defaultPresentationRoms, ...defaultSuites];

    debugLog(
        "📚 ALL AVAILABLE ROOM SLUGS:",
        allRooms.map(r => ({
            slug: r.slug,
            normalized: normalizeSlug(r.slug)
        }))
    );

    return allRooms.find((r, index) => {
        debugLog(`\n📦 ROOM #${index}`, r);

        const rslug = normalizeSlug(r.slug);
        debugLog("➡️ NORMALIZED ROOM SLUG:", rslug);

        const match = rslug === norm;

        debugLog("🆚 COMPARISON:", `rslug === norm → ${rslug} === ${norm} → ${match}`);

        if (match) debugLog("🎯 MATCH FOUND:", r);

        return match;
    });
};

// ✅ METADATA
export async function generateRoomMetadata({ params }: any) {
    const { slug: roomSlug } = params || {};
    const room = findRoomBySlug(roomSlug);

    if (!room) return { title: "Chambre - Hôtel Le Pays" };

    const title = `${room.title || room.name} — Hôtel Le Pays, Sendou`;
    const description =
        (room.subtitle || room.description || "").slice(0, 160) ||
        `Réservez ${room.title || room.name} à l'Hôtel Le Pays à Sendou (Dakar).`;

    const image = room.images && room.images.length > 0 ? room.images[0] : room.image;
    const url = `https://hotellepays.com/room-details/${room.slug}`;

    return {
        title,
        description,
        openGraph: { title, description, images: [image], url, siteName: "Hôtel Le Pays" },
        twitter: { title, description, images: [image] },
    };
}

export async function generateMetadata(props: any) {
    return generateRoomMetadata(props);
}

// ✅ STATIC EXPORT
export const dynamicParams = false;

export async function generateStaticParams() {
    const allRooms = [...defaultRooms, ...defaultPresentationRoms, ...defaultSuites];
    const slugs = allRooms.map(r => normalizeSlug(r.slug)).filter(Boolean);

    console.log("✅ STATIC ROOM SLUGS:", slugs);

    if (slugs.length === 0) return [{ slug: "fallback" }];

    return slugs.map(slug => ({ slug }));
}

// ✅ PAGE COMPONENT
export default async function Component({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    debugLog("Params:", params);
    debugLog("SLUG:", slug);

    const room = findRoomBySlug(slug);

    if (!room) notFound();

    const tpaths = [
        { name: "Accueil", link: "/" },
        { name: "Chambres", link: "/rooms-suites" },
        { name: room.title || room.name },
    ];

    const backgroundImage = room.images?.[0] || room.image || "/default-image.jpg";

    // JSON-LD
    const roomJsonLd = {
        "@context": "https://schema.org",
        "@type": "HotelRoom",
        name: room.title || room.name,
        description: room.description || room.subtitle || "",
        url: `https://hotellepays.com/room-details/${room.slug}`,
        image: room.images?.length ? room.images : [room.image],
        occupancy: { "@type": "QuantitativeValue", value: room.guests || 2 },
        bed: room.size || undefined,
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: tpaths.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            item: p.link ? `https://hotellepays.com${p.link}` : undefined,
        })),
    };

    return (
        <div style={{ padding: 20 }}>
            <Breadcrumb paths={tpaths} title={room.title || room.name} backgroundImage={backgroundImage} />

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(roomJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <RoomDetails roomSlug={room.slug} />
        </div>
    );
}