//app/blog-details/[slug]/page.tsx

import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { defaultPosts } from "@/app/types/hotelData"; // Import des posts du blog
import Breadcrumb from "@/app/layouts/Breadcrumb";
import BlogDetails from "@/app/components/BlogDetails";

// Helper pour normaliser un slug (décodage et suppression de slash final)
const normalizeSlug = (s?: any) => {
    if (!s) return "";
    try {
        const decoded = decodeURIComponent(String(s));
        return decoded.replace(/\/+$/, "").toLowerCase();
    } catch (e) {
        // Loger l'erreur pour satisfaire l'analyse statique et retourner une valeur de repli
        // eslint-disable-next-line no-console
        console.warn('normalizeSlug: decodeURIComponent failed', { input: s, error: e });
        return String(s).replace(/\/+$/, "").toLowerCase();
    }
};

const findPostBySlug = (slug: any) => {
    const norm = normalizeSlug(slug);
    return defaultPosts.find((p) => {
        const pslug = normalizeSlug(p.slug || p.link || "");
        // comparer slug normalisé, et aussi comparer à la partie finale du champ link si présent
        const linkSlug = normalizeSlug(p.link.split("/").pop());
        return pslug === norm || linkSlug === norm;
    });
};

// Génération dynamique des métadonnées pour chaque article de blog
export async function generateMetadata({ params }: any): Promise<Metadata> {
    const { slug: postSlug } = params || {};
    const post = findPostBySlug(postSlug);

    if (!post) return { title: 'Article - Hôtel Le Pays' } as Metadata;

    const title = post.title || 'Article du Blog';
    const description = (post.excerpt || '').slice(0, 160) || `Découvrez notre article sur ${post.title}`;
    const image = post.images && post.images.length > 0 ? post.images[0] : post.thumb || '/default-image.jpg'; // Image de fallback
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

// Fonction pour générer les chemins statiques
const getAllSlugs = () => {
    return defaultPosts
        .map((p) => normalizeSlug(p.slug || p.link?.split("/").pop()))
        .filter(Boolean); // Retire les undefined, null, ou chaînes vides
};

// 1. On indique à Next.js de ne pas essayer de générer des pages non spécifiées
export const dynamicParams = false;

export async function generateStaticParams() {
    const slugs = getAllSlugs();

    // 2. Sécurité vitale pour l'export statique :
    // Si la liste est vide, on doit retourner au moins un paramètre factice
    // pour empêcher le crash de compilation.
    if (slugs.length === 0) {
        console.warn("⚠️ Aucun article trouvé lors du build, génération d'un slug par défaut.");
        return [{ slug: 'aucun-article' }];
    }

    // 3. On s'assure de forcer le type en String
    return slugs.map((slug) => ({
        slug: String(slug)
    }));
}

// Page dynamique pour afficher l'article de blog
export default async function Component({ params }: any) {
    const { slug: postSlug } = params || {};

    // Trouver l'article correspondant au slug (gestion des encodages et slash)
    const post = findPostBySlug(postSlug);

    if (!post) {
        notFound(); // Si l'article n'est pas trouvé, afficher la page 404
    }

    // Fil d'Ariane dynamique basé sur l'article
    const tpaths = [
        { name: "Accueil", link: "/" },
        { name: "Blog", link: "/blog" },
        { name: post.title }, // Utilisation du titre de l'article
    ];

    return (
        <div style={{ padding: 20 }}>
            {/* Breadcrumb dynamique avec le titre de l'article */}
            <Breadcrumb
                paths={tpaths}
                title={post.title}
                backgroundImage={post.images && post.images.length > 0 ? post.images[0] : post.thumb || '/default-image.jpg'}
            />

            {/* Affichage du contenu de l'article */}

            <h3> <BlogDetails post={post} /> </h3>
        </div>
    );
}