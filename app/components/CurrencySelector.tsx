// components/CurrencySelector.tsx
"use client";

import React, { useState, useEffect } from "react";
import { currencies } from "@/app/types/hotelData";

const STORAGE_KEY = "lepays_currency";

const CurrencySelector: React.FC = () => {
    // état local : utiliser une valeur fixe pour le rendu serveur/initial client
    // puis synchroniser depuis localStorage après le montage pour éviter les
    // différences de rendu (hydration mismatch)
    const [currency, setCurrency] = useState<string>("XOF");

    // Après le montage, lire la devise sauvegardée (si présente) et appliquer
    // ce chargement uniquement côté client pour garantir un rendu identique
    // serveur/client au premier rendu.
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setCurrency(stored);
        } catch (err) {
            console.debug('CurrencySelector: localStorage read failed', err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // valeur du symbole courante pour affichage
    const currentSymbol = currencies.find((c) => c.code === currency)?.symbol ?? "";

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(STORAGE_KEY, currency);
            // Notifier les listeners (y compris dans la même fenêtre)
            // Certains handlers écoutent l'événement 'storage' ; on le déclenche manuellement
            // pour s'assurer que les hooks locaux se mettent à jour.
            try { window.dispatchEvent(new Event('storage')); } catch (e) { /* ignore */ }
        } catch (err) {
            // debug en cas d'échec (ex: mode private qui bloque localStorage)
            // eslint-disable-next-line no-console
            console.debug('CurrencySelector: localStorage set failed', err);
        }
    }, [currency]);

    const onChange = (value: string) => {
        setCurrency(value);
    };

    return (
        <div className="position-absolute" style={{ top: 12, right: 12, zIndex: 60 }}>
            <div className="input-group input-group-sm" style={{ minWidth: 180 }}>
                <label htmlFor="currency-select" className="input-group-text visually-hidden">
                    Devise
                </label>
                <select
                    id="currency-select"
                    className="form-select"
                    aria-label="Sélection de la devise"
                    value={currency}
                    onChange={(e) => onChange(e.target.value)}
                    title={`Devise actuelle : ${currency}`}
                >
                    {currencies.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.code} — {c.name}
                        </option>
                    ))}
                </select>
                <span className="input-group-text" aria-hidden>
                    {currentSymbol}
                </span>
            </div>
        </div>
    );
};

export default CurrencySelector;
