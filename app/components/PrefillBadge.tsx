"use client";
import React, { useEffect, useState } from 'react';

export default function PrefillBadge() {
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

    if (!hasPrefill) return null;
    return (
        <div style={{ margin: '12px 0' }}>
            <span style={{ display: 'inline-block', background: '#e6f7ff', color: '#0275d8', padding: '6px 10px', borderRadius: 6, fontWeight: 600 }}>
                Prérempli depuis la recherche
            </span>
        </div>
    );
}
