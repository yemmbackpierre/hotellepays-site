import type { Metadata } from 'next';
import React from 'react';
import TestimonialSection from "@/app/components/TestimonialSection";
import ReservationForm from "@/app/components/forms/ReservationForm";
import PrefillBadge from "@/app/components/PrefillBadge";
import styles from './booking.module.css';
import { suggestKeywords } from '@/app/lib/seo';

const title = 'Réservation - Hôtel Le Pays';
const description = "Réservez votre chambre à l'Hôtel Le Pays à Sendou. Choisissez vos dates, le nombre de chambres et prévisualisez votre proforma.";

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
}

export default function Component() {
    const slug='';
    const bookingtitle='Réservation';


    return   <>

        <section
            className={styles.bookingPageTitle}
            style={{ backgroundImage: `url('/assets/images/resource/page-title-bg2.png')` }}
        >
            <div className={styles.bookingAutoContainer}>
                <div className={`${styles.bookingTitleOuter} ${styles.bookingTextCenter}`}>
                    <ul className={styles.bookingPageBreadcrumb}>
                        <li><a href="/">Accueil</a></li>
                        <li>
                            {slug ? (
                                <a href="/booking">{bookingtitle}</a>
                            ) : (
                                bookingtitle
                            )}
                        </li>
                        {/* Afficher le slug uniquement si défini */}
                        {slug && <li>{slug}</li>}
                    </ul>
                </div>
            </div>
            <PrefillBadge />
            <ReservationForm/>
        </section>


        <TestimonialSection/>
    </>;
}
