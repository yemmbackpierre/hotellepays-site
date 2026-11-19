//app/blog-details/[slug]/page.tsx

import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { debugLog, debugWarn, defaultPosts } from "@/app/types/hotelData";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import BlogDetails from "@/app/components/BlogDetails";

//
// 🔹 NORMALIZE SLUG
//
const normalizeSlug = (s?: any) => {
    if (!s) return "";
    try {
        return decodeURIComponent(String(s)).replace(/\/+$/, "").toLowerCase();
    } catch (e) {
        console.warn("normalizeSlug error", e);
        return String(s).replace(/\/+$/, "").toLowerCase();
    }
};

//
// 🔹 FIND POST
//
const slugify = (s?: string) => {
    if (!s) return "";
    return String(s)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/(^-+)|(-+$)/g, '')
        .replace(/[^a-z0-9]+/g, '-');
};

const findPostBySlug = (slug: any) => {
    debugLog("🔎 INPUT SLUG:", slug);

    const norm = normalizeSlug(slug);
    debugLog("✅ NORMALIZED INPUT SLUG:", norm);

    debugLog(
        "📚 ALL AVAILABLE SLUGS:",
        defaultPosts.map(p => ({
            slug: p.slug,
            link: p.link,
            normalized: normalizeSlug(p.slug || p.link?.split("/").pop())
        }))
    );

    let found = defaultPosts.find((p, index) => {
        debugLog(`\n📦 POST #${index}`, p);

        const rawSlug = p.slug || p.link || "";
        const pslug = normalizeSlug(rawSlug);

        debugLog("➡️ RAW SLUG:", rawSlug);
        debugLog("➡️ NORMALIZED POST SLUG:", pslug);

        let linkSlug = "";
        try {
            linkSlug = normalizeSlug(p.link?.split("/").pop());
        } catch (e) {
            debugWarn("⚠️ ERROR parsing linkSlug:", e, p.link);
        }

        debugLog("➡️ LINK SLUG:", linkSlug);

        const match = pslug === norm || linkSlug === norm;

        debugLog(
            "🆚 COMPARISON:",
            `pslug === norm → ${pslug} === ${norm} → ${pslug === norm}`,
            `| linkSlug === norm → ${linkSlug} === ${norm} → ${linkSlug === norm}`
        );

        if (match) {
            debugLog("🎯 MATCH FOUND:", p);
        }

        return match;
    });

    // fallback: slugify comparison (removes accents and non-alphanum)
    if (!found && norm) {
        const normSimple = slugify(norm);
        debugLog("Fallback slugify norm:", normSimple);
        found = defaultPosts.find(p => {
            const cand = slugify(normalizeSlug(p.slug || p.link || p.title));
            return cand === normSimple;
        });
        if (found) debugLog("🎯 MATCH FOUND BY SLUGIFY:", found);
    }

    return found;
};

//
// ✅ SEO
//
// 🔹 Ta fonction custom (inchangée)
export async function generateblogMetadata({ params }: any): Promise<Metadata> {
    const { slug: postSlug } = params || {};
    const post = findPostBySlug(postSlug);

    if (!post) return { title: 'Article - Hôtel Le Pays' } as Metadata;

    const title = post.title || 'Article du Blog';
    const description =
        (post.excerpt || '').slice(0, 160) ||
        `Découvrez notre article sur ${post.title}`;

    const image =
        post.images && post.images.length > 0
            ? post.images[0]
            : post.thumb || '/default-image.jpg';

    const url = `https://hotellepays.com/blog-details/${post.slug}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [image],
            url,
            siteName: 'Hôtel Le Pays',
        },
        twitter: {
            title,
            description,
            images: [image],
        },
    };
}

// ✅ Obligatoire pour Next.js
export async function generateMetadata(props: any): Promise<Metadata> {
    return generateblogMetadata(props);
}

//
// ✅ IMPORTANT POUR STATIC EXPORT
//
export const dynamicParams = true; // Allow dynamic rendering/fallbacks to avoid 404 when a slug wasn't pre-rendered

export async function generateStaticParams() {
    const slugs = defaultPosts
        .map((p) => normalizeSlug(p.slug || p.link?.split("/").pop()))
        .filter(Boolean);

    console.log("✅ STATIC SLUGS:", slugs);

    if (slugs.length === 0) {
        console.warn("⚠️ Aucun slug trouvé !");
        return [{ slug: "fallback" }];
    }

    return slugs.map((slug) => ({
        slug: String(slug),
    }));
}

//
// ✅ PAGE
//
export default async function Component({ params }: { readonly params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;

    const slug = resolvedParams?.slug;

    debugLog("Params:", resolvedParams);
    debugLog("SLUG:", slug);

    const post = findPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const tpaths = [
        { name: "Accueil", link: "/" },
        { name: "Blog", link: "/blog" },
        { name: post.title },
    ];

    return (
        <div style={{ padding: 20 }}>
            <Breadcrumb
                paths={tpaths}
                title={post.title}
                backgroundImage={
                    post.images?.[0] || post.thumb || "/default-image.jpg"
                }
            />

            <BlogDetails post={post} />
        </div>
    );
}