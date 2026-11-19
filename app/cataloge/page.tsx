import type { Metadata } from 'next';
import { suggestKeywords } from '@/app/lib/seo';

const title = 'Catalogue - Hôtel Le Pays';
const description = 'Consultez le catalogue des services et offres de l\'Hôtel Le Pays.';

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
}

import React from 'react';
import Breadcrumb from "@/app/layouts/Breadcrumb";

export default function Component() {
    const tpaths: { name: string; link?: string; }[] = [
        { name: 'Accueil', link: '/' },
        { name: 'Catalogue', link: '' },
    ];

    return (
        <>
            <Breadcrumb paths={tpaths} title={"Catalogue"} backgroundImage={'/assets/images/resource/page-title-bg.png'} />
            <section className="container pt-60 pb-60">
                <h2>Catalogue</h2>
                <p>Consultez nos offres et prestations dans ce catalogue.</p>
                {/* Vous pouvez ajouter ici une liste de produits/services */}
            </section>
        </>
    );
}
