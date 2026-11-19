import type { Metadata } from 'next';
import { suggestKeywords } from '@/app/lib/seo';
import React from 'react';
import Breadcrumb from "@/app/layouts/Breadcrumb";

const title = 'Menu - Hôtel Le Pays';
const description = 'Consultez le menu du restaurant de l\'Hôtel Le Pays.';

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
}

export default function MenuPage() {
    const tpaths: { name: string; link?: string; }[] = [
        { name: 'Accueil', link: '/' },
        { name: 'Menu', link: '' },
    ];

    return (
        <>
            <Breadcrumb paths={tpaths} title={"Menu"} backgroundImage={'/assets/images/resource/page-title-bg.png'} />
            <section className="container pt-40 pb-40">
                <div style={{ position: 'relative', paddingBottom: '75%', height: 0, overflow: 'hidden' }}>
                    <iframe
                        src="https://sendou.hotellepays.com/takepos/public/menu.php"
                        title="Menu Hôtel Le Pays"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                        sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                        loading="lazy"
                    />
                </div>
            </section>
        </>
    );
}
