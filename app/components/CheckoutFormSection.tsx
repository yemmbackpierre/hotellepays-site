"use client";

import React, { useState } from "react";
import { BookingData, defaultHotelData, defaultContactInfos, HotelData } from "@/app/types/hotelData";

// Helpers utilitaires au niveau module pour la lecture du select stylisé
const parseRoomsString = (s?: string | null | undefined) => {
    if (!s) return undefined;
    const m = (/^(\d+)/).exec(String(s).trim());
    if (!m) return undefined;
    const n = Number(m[1]);
    if (!Number.isFinite(n)) return undefined;
    return Math.min(10, Math.max(1, Math.floor(n)));
};

type BookingFormProps = {
    hotel?: HotelData;
};

// Constant pour déterminer si WhatsApp doit être ouvert ou non
const useWhatsApp = false; // change to false pour ne pas ouvrir WhatsApp

const CheckoutFormSection: React.FC<BookingFormProps> = () => {
    const hotelInfo = defaultHotelData; // fusionner avec les données reçues

    // checkIn / checkOut utilisent le format `datetime-local` (ex: 2026-01-17T15:30)
    const [formData, setFormData] = useState<BookingData>({
        checkIn: "",
        checkOut: "",
        rooms: "1 chambre",
    });
    // selectedRooms stocke le nombre réel (1..10) choisi par l'utilisateur — évite les parsing inconsistants
    const [selectedRooms, setSelectedRooms] = useState<number>(1);

    // helper: convertit Date string ou Date en format `YYYY-MM-DDTHH:mm` (datetime-local)
    const toDatetimeLocal = (input: string | Date) => {
        const d = typeof input === 'string' ? new Date(input) : input;
        const pad = (n: number) => String(n).padStart(2, '0');
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const min = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        // si on change le select 'rooms', on met à jour selectedRooms en nombre
        if (name === 'rooms') {
            // value est numéric (ex: "4") si on utilise <option value="4">. Sinon on tente parseInt.
            let n = Number.parseInt(String(value), 10);
            if (!Number.isFinite(n)) {
                // fallback: essayer d'extraire depuis la string (ex: '4 chambres')
                const m = (/^(\d+)/).exec(String(value).trim());
                n = m ? Number(m[1]) : 1;
            }
            if (!Number.isFinite(n) || n < 1) n = 1;
            n = Math.min(10, Math.max(1, Math.floor(n)));
            setSelectedRooms(n);
            // garder formData.rooms une version lisible
            setFormData((prev) => ({ ...prev, [name]: `${n} chambre${n > 1 ? 's' : ''}` }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // synchroniser selectedRooms au montage si formData.rooms a une valeur par défaut
    React.useEffect(() => {
        const m = (/^(\d+)/).exec(String(formData.rooms).trim());
        const n = m ? Number(m[1]) : undefined;
        if (n && Number.isFinite(n)) setSelectedRooms(Math.min(10, Math.max(1, Math.floor(n))));
    }, []);

    // Si un plugin stylise le select (ex: nice-select) il peut ne pas déclencher 'change' sur le select natif.
    // On écoute les clics sur l'UI stylisée et on synchronise selectedRooms depuis le texte affiché.
    React.useEffect(() => {
        if (typeof document === 'undefined') return;
        const handler = (e: Event) => {
            const root = document.querySelector('.nice-select') as HTMLElement | null;
            if (!root) return;
            if (!root.contains(e.target as Node)) return;
            const text = (root.textContent || '').trim();
            const m = (/^(\d+)/).exec(text);
            if (!m) return;
            const v = Number(m[1]);
            if (!Number.isFinite(v)) return;
            const n = Math.min(10, Math.max(1, Math.floor(v)));
            setSelectedRooms(n);
            setFormData(prev => ({ ...prev, rooms: `${n} chambre${n > 1 ? 's' : ''}` }));
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const handleSubmit = () => {
        if (!formData.checkIn || !formData.checkOut) {
            window.alert("Veuillez sélectionner vos dates et heures d'arrivée/départ.");
            return;
        }

        // Calculer numRooms en étant robuste : prioriser selectedRooms (contrôlé), puis essayer le select natif,
        // puis lire le texte affiché par un plugin stylisé ('.nice-select .current').
        let numRooms = Math.min(10, Math.max(1, Math.floor(selectedRooms || 1)));
        try {
            if (typeof document !== 'undefined') {
                const sel = document.querySelector('select[name="rooms"]') as HTMLSelectElement | null;
                if (sel) {
                    const idx = sel.selectedIndex;
                    if (typeof idx === 'number' && idx >= 0 && sel.options[idx]) {
                        const txt = (sel.options[idx].value || sel.options[idx].text || '').trim();
                        const p = parseInt(txt, 10);
                        if (Number.isFinite(p) && p >= 1) numRooms = Math.min(10, Math.max(1, p));
                    } else if (sel.value) {
                        const p = parseInt(sel.value, 10);
                        if (Number.isFinite(p) && p >= 1) numRooms = Math.min(10, Math.max(1, p));
                    }
                }
                // plugin stylisé (nice-select)
                const current = document.querySelector('.nice-select .current') as HTMLElement | null;
                if (current && current.textContent) {
                    const p = parseInt(current.textContent.trim(), 10);
                    if (Number.isFinite(p) && p >= 1) numRooms = Math.min(10, Math.max(1, p));
                }
            }
        } catch (e) {
            // ignore DOM read errors
        }

        // Construire la query string pour préremplir le formulaire sur /booking
        // envoyer au format datetime-local (YYYY-MM-DDTHH:mm) pour éviter les ambiguïtés de fuseau
        const arrivalLocal = toDatetimeLocal(formData.checkIn);
        const departureLocal = toDatetimeLocal(formData.checkOut);
        const qs = `?arrival=${encodeURIComponent(arrivalLocal)}&departure=${encodeURIComponent(departureLocal)}&numRooms=${numRooms}`;

        // Préparer message WhatsApp demandant disponibilité
        const hotelContact = defaultContactInfos.find(c => c.type === 'whatsapp') ?? defaultContactInfos.find(c => c.type === 'phone');
        const rawPhone = hotelContact?.number || hotelContact?.link?.replace(/.*wa.me\//, '') || '2250000000000';
        const phoneNumber = rawPhone.replace(/\D/g, '');

        const arrivalLabel = new Date(formData.checkIn).toLocaleString();
        const departureLabel = new Date(formData.checkOut).toLocaleString();
        let message = `Demande de disponibilité - ${hotelInfo.name}\n`;
        message += `Arrivée : ${arrivalLabel}\n`;
        message += `Départ  : ${departureLabel}\n`;
        message += `Chambres : ${numRooms}\n\n`;
        message += `Merci de confirmer la disponibilité et les tarifs.\n`;

        const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        // Ouvrir WhatsApp dans une nouvelle FENÊTRE (pas un onglet) en précisant taille/features.
        // Utiliser un nom de fenêtre pour forcer une vraie fenêtre et fournir des dimensions.
        const features = 'width=600,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes';

        // Préparer le message WhatsApp uniquement si `useWhatsApp` est vrai
        if (useWhatsApp) {
            const win = window.open(waUrl, 'whatsapp_window', features);
            // neutraliser l'opener pour sécurité (comme noopener)
            if (win) {
                try { (win as any).opener = null; } catch (err) {
                    // Log instead of swallowing the error to satisfy linters and help debugging
                    // eslint-disable-next-line no-console
                    console.warn('Could not nullify window.opener for the WhatsApp window', err);
                }
            }
        }
        // navigation dans le même onglet vers /booking en full reload pour éviter des conditions de course
        // (requestAnimationFrame double pour laisser le navigateur terminer l'ouverture du nouvel onglet)
        try {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                // use assign to perform a full navigation (safer than client router push here)
                window.location.assign(`/booking${qs}`);
            }));
        } catch (err) {
            // fallback léger : log et délai court puis navigation
            // (catch écrit pour satisfaire les linters/sonar qui n'aiment pas les catch vides)
            // eslint-disable-next-line no-console
            console.warn('requestAnimationFrame scheduling failed, using timeout fallback', err);
            setTimeout(() => { window.location.assign(`/booking${qs}`); }, 300);
        }
    };

    return (
        <section className="checkout-area style-home1">
            <div className="container">

                <div className="checkout-bg">
                    <div className="row align-items-center gx-1">
                        {/* Check-in */}
                        <div className="col-xl-3 col-md-6">
                            <div className="checkout-wrapper mb-4 mb-xl-0">
                                <div className="checkout-left"><span>Arrivée</span></div>
                                <div className="checkout-right">
                                    <div className="checkout-field">
                                        <input
                                            type="datetime-local"
                                            name="checkIn"
                                            value={formData.checkIn}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Check-out */}
                        <div className="col-xl-3 col-md-6">
                            <div className="checkout-wrapper mb-4 mb-xl-0">
                                <div className="checkout-left"><span>Départ</span></div>
                                <div className="checkout-right">
                                    <div className="checkout-field">
                                        <input
                                            type="datetime-local"
                                            name="checkOut"
                                            value={formData.checkOut}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chambres */}
                        <div className="col-xl-3 col-md-6">
                            <div className="checkout-wrapper mb-4 mb-xl-0">
                                <div className="checkout-left"><span>Chambres</span></div>
                                <div className="checkout-right">
                                    <div className="checkout-field">
                                        <select
                                            name="rooms"
                                            value={String(selectedRooms)}
                                            onChange={handleChange}
                                            className="nice-select"
                                        >
                                            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                                                <option key={n} value={`${n}`}>{n} chambre{n > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bouton */}
                        <div className="col-xl-3 col-md-6">
                            <div className="checkout-button mb-4 mb-xl-0">
                                <button
                                    type="button"
                                    className="theme-btn-main"
                                    onClick={handleSubmit}
                                >
                  <span className="theme-btn-arrow-left flex-shrink-0">
                    <img src="/assets/images/icons/button-right-arrow.svg" alt="arrow" />
                  </span>
                                    <span className="theme-btn">Vérifier</span>
                                    <span className="theme-btn-arrow-right flex-shrink-0">
                    <img src="/assets/images/icons/button-right-arrow.svg" alt="arrow" />
                  </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckoutFormSection;

/*
Exemple d’utilisation :
const hotelData.ts = {
  name: "Hôtel Le Pays",
  stars: 3,
  location: "Sendou, Sénégal",
  description:
    "Hôtel 3 étoiles situé à Sendou, confortable et offrant un service de qualité pour un séjour agréable sans dépaysement.",
};

<CheckoutFormSection hotel={hotelData.ts} />;
 */