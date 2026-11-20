"use client";
import React, { useEffect, useState } from 'react';
import type { PricingOffer } from '@/app/lib/pricingOffer';

type PrefillBadgeProps = {
    offer?: PricingOffer | null;
};

export default function PrefillBadge({ offer }: PrefillBadgeProps) {
    const [hasPrefill, setHasPrefill] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const params = new URLSearchParams(window.location.search);
            const has = !!(params.get('arrival') || params.get('departure') || params.get('numRooms') || params.get('prefill'));
            setHasPrefill(has);
        } catch (err) {
            console.debug('prefill badge parse error', err);
            setHasPrefill(false);
        }
    }, []);

    if (!hasPrefill && !offer) return null;
    return (
        <div className="container" style={{ position: 'relative', zIndex: 2, marginTop: 12 }}>
            <div className="d-flex flex-wrap justify-content-center gap-2">
                {offer && (
                    <span style={{ display: 'inline-block', background: '#fff8e1', color: '#8a5300', border: '1px solid #f5c56b', padding: '6px 12px', borderRadius: 6, fontWeight: 600 }}>
                        Offre sélectionnée : {offer.title} — {String(Math.round(offer.price)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} {offer.currency} {offer.per}
                    </span>
                )}
                {hasPrefill && (
                    <span style={{ display: 'inline-block', background: '#e6f7ff', color: '#0275d8', padding: '6px 10px', borderRadius: 6, fontWeight: 600 }}>
                        Prérempli depuis la recherche
                    </span>
                )}
            </div>
        </div>
    );
}
