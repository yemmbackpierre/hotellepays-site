"use client";
import { useState, useEffect, useMemo } from "react";
import {BookingInfos, extrasList, ROOM_TYPES, RoomParams, defaultContactInfos, currencies} from "@/app/types/hotelData";
import axios from "axios";
import QRCode from "qrcode";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import CurrencySelector from '@/app/components/CurrencySelector';

// Constantes partagées
const MIN_ADVANCE_HOURS = 2;
const PRICE_SUITE = 60000;
const PRICE_CLIM = 25000;
const PRICE_VENT = 20000;


// Helper: génère un numéro de réservation comme demandé
function generateReservationNumber(date = new Date()): string {
    const y = date.getFullYear().toString();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    const ss = date.getSeconds().toString().padStart(2, "0");
    // Parenthèses retirées conformément à la demande
    return `RCHLP00${y}${m}${d}${hh}${mm}${ss}`;
}

// Helpers pour input datetime-local
function toDatetimeLocal(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function parseDatetimeLocal(s?: string | null): Date | null {
    if (!s) return null;
    // Constructeur Date accepte 'YYYY-MM-DDTHH:mm' as local time
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}

// Decodeur préfill: accepte JSON brut ou base64-encoded JSON (URL-encoded)
function decodePrefillParam(raw?: string | null) {
    if (!raw) return null;
    // 1) JSON direct
    try { return JSON.parse(raw); } catch (err) { console.debug('prefill: not raw JSON', err); }
    // 2) decoded URI JSON
    try {
        const decoded = decodeURIComponent(raw);
        try { return JSON.parse(decoded); } catch (err) { console.debug('prefill: not decoded JSON', err); }
        // 3) base64 of decoded
        try {
            const fromBase = typeof atob === 'function' ? atob(decoded) : Buffer.from(decoded, 'base64').toString('utf8');
            return JSON.parse(fromBase);
        } catch (err) { console.debug('prefill: not base64(decoded)', err); }
        // 4) base64 of raw
        try {
            const fromBase2 = typeof atob === 'function' ? atob(raw) : Buffer.from(raw, 'base64').toString('utf8');
            return JSON.parse(fromBase2);
        } catch (err) { console.debug('prefill: not base64(raw)', err); }
    } catch (err) { console.debug('prefill: decodeURIComponent failed', err); }
    return null;
}

// Appliquer les données préfill dans le state du formulaire
function applyPrefillData(data: any, setFormFn: (updater: any) => void, setExtrasQtyFn: (q: any) => void) {
    const arrivalParsed = data.arrival ? (parseDatetimeLocal(data.arrival) ?? new Date(data.arrival)) : undefined;
    const departureParsed = data.departure ? (parseDatetimeLocal(data.departure) ?? new Date(data.departure)) : undefined;
    setFormFn((prev: BookingInfos) => ({
        ...prev,
        arrival: arrivalParsed ?? prev.arrival,
        departure: departureParsed ?? prev.departure,
        numRooms: data.numRooms ? Math.min(10, Math.max(1, Number(data.numRooms))) : prev.numRooms,
        rooms: data.rooms ? data.rooms : prev.rooms,
        extras: Array.isArray(data.extras) ? data.extras : prev.extras,
        customer: data.customer ? { ...prev.customer, ...data.customer } : prev.customer,
    }));
    if (data.extrasQty && typeof data.extrasQty === 'object') setExtrasQtyFn(data.extrasQty);
}

// Hook utilitaire pour gérer la devise depuis localStorage (extrait pour réduire la complexité de ReservationForm)
function useCurrencyCode() {
    const STORAGE_KEY = 'lepays_currency';
    const [currencyCode, setCurrencyCode] = useState<string>(() => {
        if (typeof window === 'undefined') return 'XOF';
        return localStorage.getItem(STORAGE_KEY) || 'XOF';
    });
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handler = () => setCurrencyCode(localStorage.getItem(STORAGE_KEY) || 'XOF');
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try { localStorage.setItem(STORAGE_KEY, currencyCode); } catch (err) { console.debug('localStorage set failed', err); }
    }, [currencyCode]);
    const currency = currencies.find(c => c.code === currencyCode) ?? currencies[0];
    return { currencyCode, setCurrencyCode, currency };
}

// Ouvre une nouvelle fenêtre imprimable avec QR (externe, renvoie une Promise)
// removed unused external print helper to simplify code and avoid TS issues

// Helper getConfortLabel utilisé plus bas — déclaration de fonction pour éviter tout souci de portée
function getConfortLabel(r: RoomParams): string {
    if (r.type === 'suite') return 'CLIM INCLUS';
    if (r.clim === 'oui') return 'CLIM';
    return 'VENTILÉ';
}

export default function ReservationForm() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<BookingInfos>({
        arrival: null,
        departure: null,
        numRooms: 1,
        rooms: {},
        extras: [],
        customer: { name: "", email: "", phone: "", whatsapp: false },
    });


    const [errorsStep1, setErrorsStep1] = useState<Record<string, string>>({});
    const [errorsStep2, setErrorsStep2] = useState<Record<string, Record<string, string>>>({});
    const [errorsStep4, setErrorsStep4] = useState<Record<string, string>>({});
    const [reservationNumber, setReservationNumber] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    // quantités par extra (définies par l'utilisateur)
    const [extrasQty, setExtrasQty] = useState<Record<string, number>>({});

    // devise (utilise le hook extrait) - on n'utilise que "currency" ici
    const { currency } = useCurrencyCode();

    // Conversion et formatage selon la devise sélectionnée.
    // Les montants sources sont en XOF (FCFA).
    const convertAmount = (xofAmount: number) => {
        const xofRate = currencies.find(c => c.code === 'XOF')?.rateToEUR ?? 655.957;
        const eur = xofAmount / xofRate;
        const target = eur * (currency.rateToEUR ?? 1);
        return currency.code === 'XOF' ? Math.round(target) : Number(target.toFixed(2));
    };

    const formatConverted = (xofAmount: number) => {
        const v = convertAmount(xofAmount);
        const formatted = currency.code === 'XOF'
            ? v.toLocaleString()
            : v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        // Affichage: XOF et EUR en suffixe (après le montant), USD en préfixe (avant le montant)
        if (currency.code === 'USD') return `${currency.symbol}${formatted}`;
        // Par défaut (XOF, EUR, autres), afficher le symbole à droite
        return `${formatted} ${currency.symbol}`;
    };

    // lecture des query params pour préremplir arrival/departure/numRooms
    // Instead of useSearchParams (which can require Suspense when used in Server Components),
    // we read window.location.search on client side and parse it. This avoids prerender issues.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const params = new URLSearchParams(window.location.search);
            const arrival = params.get('arrival');
            const departure = params.get('departure');
            const numRooms = params.get('numRooms');
            const prefillParam = params.get('prefill');
            if (prefillParam) {
                const data = decodePrefillParam(prefillParam);
                if (data && typeof data === 'object') {
                    applyPrefillData(data, setForm, setExtrasQty);
                    return; // priorité au prefill
                }
            }
            if (arrival) setForm(prev => ({ ...prev, arrival: parseDatetimeLocal(arrival) }));
            if (departure) setForm(prev => ({ ...prev, departure: parseDatetimeLocal(departure) }));
            if (numRooms) setForm(prev => ({ ...prev, numRooms: Math.min(10, Math.max(1, Number(numRooms))) }));
        } catch (err) {
            console.debug('Failed to parse client query params', err);
        }
    }, []);

    // memoized derived values
    const nights = useMemo(() => {
        if (!form.arrival || !form.departure) return 1;
        const diff = form.departure.getTime() - form.arrival.getTime();
        const n = Math.ceil(diff / (1000 * 3600 * 24));
        return n > 0 ? n : 1;
    }, [form.arrival, form.departure]);

    // total persons (adultes + enfants)
    const totalPeople = useMemo(() => {
        return Object.values(form.rooms).reduce((acc, r) => acc + (r.adults || 0) + (r.children || 0), 0);
    }, [form.rooms]);

    // détecte si une suite est présente (piscine & salle de sport incluses)
    const hasSuite = useMemo(() => Object.values(form.rooms).some(r => r.type === 'suite'), [form.rooms]);

    // total : uniquement le prix des chambres (les extras sont payés sur place)
    const total = useMemo(() => {
        let roomTotal = 0;
        Object.values(form.rooms).forEach((room) => {
            if (room.type === "suite") roomTotal += PRICE_SUITE;
            else if (room.type !== "") roomTotal += room.clim === "oui" ? PRICE_CLIM : PRICE_VENT;
        });
        return (roomTotal * nights);
    }, [form.rooms, nights]);

    // ---------- Handlers ----------
    useEffect(() => {
        setForm(prev => {
            const newRooms = { ...prev.rooms };
            for (let i = 1; i <= prev.numRooms; i++) {
                if (!newRooms[`room${i}`]) newRooms[`room${i}`] = { type: "", adults: 1, children: 0, clim: "" };
            }
            Object.keys(newRooms).filter(k => Number(k.replace("room", "")) > prev.numRooms).forEach(k => delete newRooms[k]);
            return { ...prev, rooms: newRooms };
        });
    }, [form.numRooms]);

    const handleRoomChange = (key: string, field: keyof RoomParams, value: any) => {
        setForm(prev => {
            const updated = { ...prev.rooms };
            if (field === "type" && value === "suite") {
                updated[key] = { ...updated[key], type: value, clim: "oui" };
            } else {
                updated[key] = { ...updated[key], [field]: value };
            }
            return { ...prev, rooms: updated };
        });
    };

    const toggleExtra = (name: string) => {
        // Ne pas permettre de désélectionner les extras inclus par suite
        const isIncludedBySuite = hasSuite && (name === 'Piscine' || name === 'Salle de sport');
        if (isIncludedBySuite) return;
        setForm(prev => {
            const added = !prev.extras.includes(name);
            const nextExtras = added ? [...prev.extras, name] : prev.extras.filter(e => e !== name);
            // if added, initialize qty to totalPeople
            if (added) setExtrasQty(prevQ => ({ ...prevQ, [name]: Math.max(1, totalPeople) }));
            else setExtrasQty(prevQ => { const copy = { ...prevQ }; delete copy[name]; return copy; });
            return { ...prev, extras: nextExtras };
        });
    };

    const setExtraQty = (name: string, qty: number) => {
        const n = Math.max(1, Math.floor(qty));
        setExtrasQty(prev => ({ ...prev, [name]: n }));
    };

    // ---------- Validations ----------
    // helpers pour réduire la complexité cognitive de validateStep1
    const checkArrival = (errs: Record<string, string>, now: Date) => {
        if (!form.arrival) {
            errs.arrival = "Date d'arrivée obligatoire";
            return;
        }
        const isToday = form.arrival.toDateString() === now.toDateString();
        if (isToday) {
            const minArrival = new Date(now.getTime() + MIN_ADVANCE_HOURS * 60 * 60 * 1000);
            if (form.arrival < minArrival) errs.arrival = `Arrivée : minimum ${MIN_ADVANCE_HOURS}h à l'avance aujourd'hui`;
        }
    };

    const checkDeparture = (errs: Record<string, string>) => {
        if (!form.departure) {
            errs.departure = "Date de départ obligatoire";
            return;
        }
        if (!form.arrival) return;
        const sameDay = form.arrival.toDateString() === form.departure.toDateString();
        if (sameDay) {
            const minDeparture = new Date(form.arrival.getTime() + MIN_ADVANCE_HOURS * 60 * 60 * 1000);
            if (form.departure < minDeparture) errs.departure = `Le départ doit être au moins ${MIN_ADVANCE_HOURS}h après l'arrivée`;
        } else if (form.departure <= form.arrival) {
            errs.departure = "Départ invalide";
        }
    };

    const validateStep1 = () => {
        const errs: Record<string, string> = {};
        const now = new Date();
        checkArrival(errs, now);
        checkDeparture(errs);
        setErrorsStep1(errs);
        if (Object.keys(errs).length === 0) setStep(1);
    };


    // Helper extrait pour valider une chambre individuelle (réduit la complexité de la fonction caller)
    const validateRoom = (r: RoomParams): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!r.type) e.type = "Type obligatoire";
        if (r.type !== "suite" && r.type !== "" && !r.clim) e.clim = "Option obligatoire";

        const total = (r.adults || 0) + (r.children || 0);
        switch (r.type) {
            case "simple":
                if (total > 2) e.cap = "Max 2 pers. au total";
                break;
            case "double":
                if (total > 4) e.cap = "Max 4 pers. au total";
                break;
            case "suite":
                if ((r.adults || 0) > 2) e.cap = "Max 2 adultes";
                if ((r.children || 0) > 2) e.cap = (e.cap ? `${e.cap} & ` : "") + "Max 2 enfants";
                break;
            default:
                break;
        }
        return e;
    };

    const validateStep2 = () => {
        const errs: Record<string, Record<string, string>> = {};
        Object.keys(form.rooms).forEach(key => {
            const r = form.rooms[key];
            const roomErrors = validateRoom(r);
            if (Object.keys(roomErrors).length) errs[key] = roomErrors;
        });
        setErrorsStep2(errs);
        if (Object.keys(errs).length === 0) setStep(2);
    };

    const validateStep4 = () => {
        const errs: Record<string, string> = {};
        if (!form.customer.name.trim()) errs.name = "Nom obligatoire";
        if (!form.customer.email?.trim()) errs.email = "Email obligatoire";
        else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.customer.email)) errs.email = "Email invalide";
        }
        if (!form.customer.phone.trim()) errs.phone = "Téléphone obligatoire";
        setErrorsStep4(errs);
        if (Object.keys(errs).length === 0) {
            // Générer et stocker le numéro de réservation avant d'aller au step facture
            const num = generateReservationNumber();
            setReservationNumber(num);
            setStep(4);
        }
    };

    // Ouvre une nouvelle fenêtre contenant 2 pages puis lance l'impression:
    // - page 1 : QR code basé sur le numéro de réservation + résumé
    // - page 2 : facture proforma
    const openPrintWindow = async (numParam?: string): Promise<void> => {
        const num = numParam ?? reservationNumber ?? generateReservationNumber();
        // récupérer info entreprise
        const phoneContact = defaultContactInfos.find(c => c.type === "phone")?.value || defaultContactInfos.find(c => c.type === "whatsapp")?.value || "";
        const emailContact = defaultContactInfos.find(c => c.type === "email")?.value || "";
        const location = defaultContactInfos.find(c => c.type === "location")?.value || "";

        // génération locale du QR en data URL (offline)
        let qrUrl: string | undefined;
        try {
            qrUrl = await QRCode.toDataURL(num, { width: 300, margin: 1 });
        } catch (err) {
            const msg = (err as any)?.message ? `: ${(err as any).message}` : '';
            setSubmitError(`Impossible de générer le QR code${msg}`);
            toast.error(`Impossible de générer le QR code${msg}`);
            qrUrl = undefined;
        }

        // Construire HTML imprimable
        const style = `
            <style>
                body { font-family: Arial, sans-serif; color: #222; padding: 20px; }
                .page { page-break-after: always; width: 210mm; max-width: 100%; margin: 0 auto; }
                .center { text-align: center; }
                .qr { width: 300px; height: 300px; margin: 20px auto; }
                .company { margin-bottom: 12px; }
                table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                th, td { padding: 8px; border: 1px solid #ddd; }
                tfoot td { font-weight: bold; }
                @media print { .page { page-break-after: always; } }
            </style>
        `;

        // facture HTML (page 2) - on reconstruit simplement depuis l'état
        const nightsLocal = nights;
        const roomsHtml = Object.entries(form.rooms).map(([ _k, r ]) => {
             let price = PRICE_VENT;
             const confort = getConfortLabel(r);
             if (r.type === 'suite') {
                 price = PRICE_SUITE;
             } else if (r.clim === 'oui') {
                 price = PRICE_CLIM;
             }
            return `<tr><td>${r.type.toUpperCase()} ${confort}<br/><small>${r.adults} Adulte(s) / ${r.children} Enfant(s)</small></td><td class="text-center">${nightsLocal}</td><td class="text-end">${formatConverted(price * nightsLocal)}</td></tr>`;
         }).join('');

        const extrasHtml = extrasList.map(ex => {
            const isIncludedBySuite = hasSuite && (ex.name === 'Piscine' || ex.name === 'Salle de sport');
            if (isIncludedBySuite) {
                return `<tr><td colspan="3">Extra : ${ex.name} <strong>(Inclus avec la suite)</strong></td></tr>`;
            }
            if (!form.extras.includes(ex.name)) return '';
            const qty = Math.max(1, extrasQty[ex.name] ?? totalPeople);
            return `<tr><td colspan="3">Extra : ${ex.name} (Payé sur place) - ${qty} personne(s)</td></tr>`;
        }).join('');

        const totalLocal = total;

        const rulesHtml = `
            <div style="margin-top:12px;font-size:13px;color:#333;">
                <h4 style="margin-bottom:6px;">Règles</h4>
                <ul>
                    <li>Les extras sélectionnés sont payés sur place à la demande et ne sont pas inclus dans le total ci-dessus.</li>
                    <li>La Piscine et la Salle de sport sont incluses automatiquement si une <strong>suite</strong> est réservée.</li>
                    <li>Le total indiqué sur cette proforma correspond uniquement aux chambres (TTC non compris de services supplémentaires payés sur place).</li>
                </ul>
            </div>
        `;

        const invoiceHtml = `
            <div class="page">
                <h2 class="center">FACTURE PROFORMA</h2>
                <div><strong>Client :</strong> ${form.customer.name} ${form.customer.email ? `| ${form.customer.email}` : ''} | <strong>Période :</strong> ${nightsLocal} nuit(s)</div>
                <table>
                    <thead><tr><th>Désignation</th><th>Nuits</th><th class="text-end">HT</th></tr></thead>
                    <tbody>
                        ${roomsHtml}
                        ${extrasHtml}
                    </tbody>
                    <tfoot>
                        <tr><td colspan="2" class="text-end">TOTAL HT</td><td class="text-end">${formatConverted(totalLocal)}</td></tr>
                        <tr><td colspan="2" class="text-end">TVA (0%)</td><td class="text-end">${formatConverted(0)}</td></tr>
                        <tr><td colspan="2" class="text-end">TOTAL TTC</td><td class="text-end">${formatConverted(totalLocal)}</td></tr>
                    </tfoot>
                </table>
                    ${rulesHtml}
            </div>
        `;

        const firstPageHtml = `
            <div class="page center">
                <div class="company">
                    <h1>Réservation</h1>
                    <div>${phoneContact ? `Tel: ${phoneContact}` : ''} ${emailContact ? ` | Email: ${emailContact}` : ''}</div>
                    <div>${location}</div>
                </div>
                <div><strong>Réservation N° :</strong> ${num}</div>
                <div class="qr"><img src="${qrUrl}" alt="QR" style="width:300px;height:300px;"/></div>
                <div><strong>Client :</strong> ${form.customer.name}</div>
                <div><strong>Période :</strong> ${form.arrival ? form.arrival.toLocaleString() : 'N/A'} - ${form.departure ? form.departure.toLocaleString() : 'N/A'}</div>
                <div><strong>Nombre total de personnes :</strong> ${totalPeople}</div>
            </div>
        `;

        // Construction HTML imprimable (reconstruire à partir des blocs déjà préparés)
        const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Impression réservation</title>${style}</head><body>${firstPageHtml}${invoiceHtml}</body></html>`;

        const w = window.open('', '_blank', 'noopener,noreferrer');
        if (!w) {
            setSubmitError("Impossible d'ouvrir la fenêtre d'impression (popup bloquée)");
            toast.error("Impossible d'ouvrir la fenêtre d'impression (popup bloquée)");
            return;
        }
        // éviter document.write (déprécié) : générer un Blob URL et naviguer la nouvelle fenêtre vers ce blob
        const blob = new Blob([html], { type: 'text/html' });
        w.location.href = URL.createObjectURL(blob);
        // attendre que le contenu soit chargé avant d'imprimer
        w.focus();
        setTimeout(() => {
            try { w.print(); }
            catch (err) { const msg = String(err); setSubmitError(`Erreur lors de l'impression: ${msg}`); toast.error(`Erreur d'impression: ${msg}`); }
        }, 500);
    };

    // Génère dynamiquement le texte du message WhatsApp (utilise form, extrasQty, totalPeople, nights, total)
    function generateWhatsappMessage(num: string): string {
        const arrivalStr = form.arrival ? form.arrival.toLocaleString() : "N/A";
        const departureStr = form.departure ? form.departure.toLocaleString() : "N/A";
        let msg = `*NOUVELLE RÉSERVATION - ${num}*\n\n`;
        msg += `👤 *Client :* ${form.customer.name}\n`;
        msg += `📞 *Tel :* ${form.customer.phone}\n`;
        if (form.customer.email) msg += `📧 *Email :* ${form.customer.email}\n`;
        msg += `\n📅 *Séjour :* Du ${arrivalStr} au ${departureStr}\n`;
        msg += `🌙 *Nuits :* ${nights}\n`;
        msg += `👥 *Nombre total de personnes :* ${Math.max(0, totalPeople)}\n\n`;
        msg += `🏨 *Détails des chambres :*\n`;
        Object.values(form.rooms).forEach((r, i) => {
            const confort = getConfortLabel(r);
            msg += `- Chambre ${i + 1}: ${r.type.toUpperCase()} (${confort}) - ${r.adults}A/${r.children}E\n`;
        });
        // extras: inclues (suite) ou payés sur place
        const included = hasSuite ? ['Piscine', 'Salle de sport'] : [];
        if (included.length > 0) {
            msg += `\n✨ *Extras inclus :* ${included.join(', ')}\n`;
        }
        const paidExtras = form.extras.filter(e => !included.includes(e));
        if (paidExtras.length > 0) {
            msg += `\n✨ *Extras (payés sur place) :*\n`;
            paidExtras.forEach(name => {
                const qty = Math.max(1, extrasQty[name] ?? totalPeople);
                msg += `- ${name} : ${qty} personne(s)\n`;
            });
        }
        msg += `\n💰 *TOTAL TTC (chambres seulement) :* ${formatConverted(total)}`;
        return msg;
    }

    // --- Ajout : fonctions pour générer label et note_private (HTML) pour l'API/Dolibarr ---
    // Génère le label humain lisible pour la réservation
    function generateLabel(): string {
        const roomsCount = form.numRooms || Object.keys(form.rooms).length || 1;
        const arrival = form.arrival;
        const arrivalDay = arrival ? arrival.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'date inconnue';
        let arrivalTime = '';
        if (arrival) {
            const t = arrival.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            arrivalTime = ` à ${t.replace(':', 'h ').replace(/^(\d{1,2}h )0?(\d{2})$/, '$1$2 mn')}`;
        }
        const chambresLabel = roomsCount > 1 ? `${roomsCount} chambres` : `${roomsCount} chambre`;
        return `Réservation de ${chambresLabel} pour ${arrivalDay}${arrivalTime}`;
    }

    // Génère la note privée en HTML (mise en forme adaptée pour Dolibarr note_private)
    function generatePrivateNoteHtml(num?: string): string {
         const arrival = form.arrival;
         const departure = form.departure;
         const arrivalDate = arrival ? arrival.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
         const departureDate = departure ? departure.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
         const arrivalTime = arrival ? arrival.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h ').replace(/^(\d{1,2}h )0?(\d{2})$/, '$1$2 mn') : '';
         const nightsLocal = nights;

         // Entreprise
         const phoneContact = defaultContactInfos.find(c => c.type === 'phone')?.value || defaultContactInfos.find(c => c.type === 'whatsapp')?.value || '';
         const emailContact = defaultContactInfos.find(c => c.type === 'email')?.value || '';
         const location = defaultContactInfos.find(c => c.type === 'location')?.value || '';

         // Détails chambres
         const roomsRows = Object.entries(form.rooms).map(([k, r], idx) => {
            const confort = getConfortLabel(r);
            const label = r.type ? r.type.toUpperCase() : 'NON DÉFINI';
            return `<tr>\n<th scope="row" style="background-color:#f4f4f4">Chambre :</th>\n<td>${label} ${confort} (Chambre ${idx + 1})</td>\n</tr>`;
        }).join('\n');

        // Extras
        const included = hasSuite ? ['Piscine', 'Salle de sport'] : [];
        const extrasIncluded = included.length ? `<p><strong>Extras inclus :</strong> ${included.join(', ')}</p>` : '';
        const paidExtrasList = form.extras.filter(e => !included.includes(e));
        const paidExtrasRows = paidExtrasList.length ? '<ul>' + paidExtrasList.map(name => {
            const qty = Math.max(1, extrasQty[name] ?? totalPeople);
            return `<li>${name} : ${qty} personne(s)</li>`;
        }).join('') + '</ul>' : '<p>Aucun extra payé sur place sélectionné.</p>';

        // Montants (utilisés dans le HTML plus loin si besoin)

        // Construction HTML similaire au template demandé -- retour direct (nettoyé)
        return `
            <div style="margin-left:0; margin-right:0"><!-- Header -->
            <h1 style="margin-left:0; margin-right:0; text-align:center">Hôtel Le Pays - Réservation</h1>
            
            <div style="text-align:center">${phoneContact ? `Tel: ${phoneContact}` : ''} ${emailContact ? ` | Email: ${emailContact}` : ''}${location ? ` | ${location}` : ''}</div>
            <div style="text-align:center"><strong>Réservation N° :</strong> ${num ?? reservationNumber ?? ''}</div>
            
            <div style="margin-left:auto; margin-right:auto">
            <div>
            <p style="text-align:center"><strong>&nbsp;</strong>Confortable et avec un service de qualité.<br />
            <br />
            &nbsp;</p>
            </div>
            <!-- Détails de la Réservation -->
            
            <div>
            <h2 style="text-align:center">Détails de la Réservation</h2>
            
            <table style="border-collapse:collapse; border-color:#dddddd; margin-bottom:20px; text-align:left; width:60%">
            	${roomsRows}
            	<tr>
            		<th scope="row" style="background-color:#f4f4f4"><strong>Date d'arrivée :</strong></th>
            		<td>${arrivalDate} ${arrivalTime}</td>
            	</tr>
            	<tr>
            		<th scope="row" style="background-color:#f4f4f4"><strong>Date de départ :</strong></th>
            		<td>${departureDate}</td>
            	</tr>
            	<tr>
            		<th scope="row" style="background-color:#f4f4f4"><strong>Nuits :</strong></th>
            		<td>${nightsLocal}</td>
            	</tr>
            	<tr>
            		<th scope="row" style="background-color:#f4f4f4"><strong>Nombre total de personnes :</strong></th>
            		<td>${Math.max(0, totalPeople)}</td>
            	</tr>
            </table>
            </div>
            <!-- Extras -->
            <div>
            ${extrasIncluded}
            <h3 style="text-align:center">Extras (payés sur place)</h3>
            ${paidExtrasRows}
            </div>
            <!-- Conditions de Réservation -->
            
            <div>
            <h2 style="text-align:center">Conditions de Réservation</h2>
            
            <ul style="list-style-type:disc">
            	<li><strong>Annulation gratuite :</strong> Jusqu'à 5 jours avant l'arrivée.</li>
            	<li><strong>Annulation après la date limite :</strong> Frais d'annulation de 50% du montant total.</li>
            	<li><strong>Paiement :</strong> Le paiement complet est dû à l'arrivée. Les extras choisis sont payés sur place.</li>
            	<li><strong>Heure d'arrivée :</strong> À partir de 14h00.</li>
            	<li><strong>Heure de départ :</strong> Avant 11h00.</li>
            </ul>
            
            <hr /></div>
            <!-- Informations de Contact -->
            
            <div>
            <h2 style="text-align:center">Informations de Contact</h2>
            
            <table style="border-collapse:collapse; border-color:#dddddd; margin-top:20px; text-align:left; width:70%">
            	<tr>
            		<td style="vertical-align:top; width:33%">
            		<h3 style="margin-left:0; margin-right:0">Contactez-nous</h3>
            
            		<p><strong>Téléphone :</strong> ${phoneContact}</p>
            
            		<p><strong>Email :</strong> ${emailContact}</p>
            		</td>
            		<td style="vertical-align:top; width:33%">
            		<h3 style="margin-left:0; margin-right:0">Horaires d'ouverture</h3>
            
            		<p><strong>Lundi - Dimanche :</strong> 8:00 h - 23:30</p>
            
            		<p><strong>Réception :</strong> 24/24</p>
            		</td>
            		<td style="vertical-align:top; width:33%">
            		<h3 style="margin-left:0; margin-right:0">WhatsApp</h3>
            
            		<p><strong>Numéro :</strong> ${phoneContact}</p>
            		</td>
            	</tr>
            	<tr>
            		<td colspan="2" rowspan="1" style="text-align:right; vertical-align:top; width:33%"><br />
            		<br />
            		<br />
            		&copy; 2026 Hôtel Le Pays - Sendou, Sénégal</td>
            		<td style="vertical-align:top; width:33%">&nbsp;</td>
            	</tr>
            </table>
            </div>
            </div>
            </div>
            <!-- Footer -->
            
            <p style="margin-left:0; margin-right:0">&nbsp;</p>`;
    }

    // ----- Submit : envoie à l'API et ouvre WhatsApp -----
    const submitReservation = async (): Promise<string> => {
        const num = reservationNumber ?? generateReservationNumber();
        setReservationNumber(num);

        const extrasDetailed = extrasList
            .filter(ex => {
                const isIncludedBySuite = hasSuite && (ex.name === 'Piscine' || ex.name === 'Salle de sport');
                return isIncludedBySuite || form.extras.includes(ex.name);
            })
            .map(ex => {
                const isIncludedBySuite = hasSuite && (ex.name === 'Piscine' || ex.name === 'Salle de sport');
                const qty = Math.max(1, extrasQty[ex.name] ?? totalPeople);
                return { name: ex.name, unitPrice: isIncludedBySuite ? 0 : ex.price, qty, total: isIncludedBySuite ? 0 : ex.price * qty, paidOnSite: !isIncludedBySuite };
            });

        const payload = {
         reservationNumber: num,
         customer: form.customer,
         arrival: form.arrival ? form.arrival.toISOString() : null,
         departure: form.departure ? form.departure.toISOString() : null,
         nights: nights,
         status: 0,
         note_private: generatePrivateNoteHtml(num),
         label: generateLabel(),
         numRooms: Math.min(10, Math.max(1, Number(form.numRooms || 1))),
         rooms: form.rooms,
         extras: extrasDetailed,
         total: total,
         // ajouter information de devise (conversion simple depuis XOF)
         currency: {
            code: currency.code,
            symbol: currency.symbol,
            totalConverted: (function(x){
                const xofRate = currencies.find(c=>c.code==='XOF')?.rateToEUR ?? 655.957;
                const eur = x / xofRate;
                const target = eur * (currency.rateToEUR ?? 1);
                return currency.code === 'XOF' ? Math.round(target) : Number(target.toFixed(2));
            })(total)
         },
         createdAt: new Date().toISOString(),
     } as const;

        const apiUrl = "https://apps.hotellepays.com/api/reservations";

        const sendToApi = async () => {
            try {
                await axios.post(apiUrl, payload, {
                    headers: { "Content-Type": "application/json" },
                    timeout: 15000,
                });
                setSubmitError(null);
                toast.success("Réservation envoyée au serveur");
            } catch (err) {
                const errMsg = (err as any)?.response?.data?.message ?? (err as any)?.message ?? String(err);
                const text = `Impossible d'enregistrer la réservation sur le serveur. Elle sera toujours envoyée par WhatsApp. - ${errMsg}`;
                setSubmitError(text);
                toast.warn(text);
            }
        };

        await sendToApi();
        // Construire message WhatsApp via la fonction générique et ouvrir wa.me

        const hotelContact = defaultContactInfos.find(c => c.type === "whatsapp") ?? defaultContactInfos.find(c => c.link?.includes("wa.me"));
        let rawPhone = hotelContact?.number || hotelContact?.link?.replace(/.*wa.me\//, "") || "2250000000000";
        const phoneNumber = rawPhone.replace(/\D/g, "");
        const whatsappMessage = generateWhatsappMessage(num);
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        if (typeof window !== "undefined") {
            // ouvrir dans une nouvelle fenêtre (features) pour forcer fenêtre au lieu d'onglet
            const features = "noopener,noreferrer,width=600,height=800";
            window.open(whatsappUrl, "_blank", features);
        }
        toast.success("Message WhatsApp préparé (nouvelle fenêtre)");

        return num;
    };

    // je veu envoyer la reservation dans mon api laravel(https://apps.hotellepays.com/) qui'lui l'envoyer dans dolibar via l'api de dolibar (voci  le domaine: https://sendou.hotellepays.com/) dasn les table agenda tiers et facture client.
    return (
        <div className="container mt-5 pb-5">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="card shadow mx-auto" style={{ maxWidth: 850 }}>
                <div className="card-body">

                     <h3 className="text-center mb-4 text-primary font-weight-bold">SYSTÈME DE RÉSERVATION</h3>
                    {/* Sélecteur de devise réutilisable */}
                    <div style={{ position: 'relative' }}>
                        <CurrencySelector />
                    </div>
                    {/* STEP 0 : DATES */}
                    {step === 0 && (
                        <div>
                            <h5>1. Dates et Chambres</h5>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="arrival">Arrivée (+2h min si aujourd'hui)</label>
                                    <input
                                        id="arrival"
                                        type="datetime-local"
                                        className="form-control"
                                        value={form.arrival ? toDatetimeLocal(form.arrival) : ''}
                                        onChange={e => setForm(prev => ({ ...prev, arrival: parseDatetimeLocal(e.target.value) }))}
                                        min={toDatetimeLocal(new Date(Date.now() + MIN_ADVANCE_HOURS * 60 * 60 * 1000))}
                                    />
                                    {errorsStep1.arrival && <small className="text-danger">{errorsStep1.arrival}</small>}
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="departure">Départ</label>
                                    <input
                                        id="departure"
                                        type="datetime-local"
                                        className="form-control"
                                        value={form.departure ? toDatetimeLocal(form.departure) : ''}
                                        onChange={e => setForm(prev => ({ ...prev, departure: parseDatetimeLocal(e.target.value) }))}
                                        min={form.arrival ? toDatetimeLocal(new Date(form.arrival.getTime() + MIN_ADVANCE_HOURS * 60 * 60 * 1000)) : undefined}
                                    />
                                    {errorsStep1.departure && <small className="text-danger">{errorsStep1.departure}</small>}
                                </div>
                            </div>
                            <label htmlFor="numRooms">Nombre de chambres</label>
                            <input id="numRooms" type="number" className="form-control mb-3" value={form.numRooms} onChange={e => setForm(prev => ({ ...prev, numRooms: Number(e.target.value) }))} />
                            <div className="text-end"><button className="btn btn-primary" onClick={validateStep1}>Suivant</button></div>
                        </div>
                    )}

                    {/* STEP 1 : DÉTAILS CHAMBRES */}
                    {step === 1 && (
                        <div>
                            <h5>2. Détails des chambres</h5>
                            {Object.keys(form.rooms).map((key, i) => {
                                const room = form.rooms[key];
                                const config = ROOM_TYPES.find(t => t.value === room.type);
                                return (
                                    <div key={key} className="border p-3 rounded mb-3 bg-light">
                                        <h6>Chambre {i + 1}</h6>
                                        <div className="row g-2">
                                            <div className="col-md-6">
                                                <label htmlFor={`${key}-type`} className="visually-hidden">Type de chambre</label>
                                                <select id={`${key}-type`} className="form-select" value={room.type} onChange={e => handleRoomChange(key, "type", e.target.value)}>
                                                    <option value="">Type de chambre...</option>
                                                    {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                </select>
                                                {errorsStep2[key]?.type && <small className="text-danger">{errorsStep2[key].type}</small>}
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor={`${key}-clim`} className="visually-hidden">Confort</label>
                                                {room.type === "suite" ? (
                                                    <select id={`${key}-clim`} className="form-select bg-white" disabled value="oui"><option value="oui">Climatisation (Inclus)</option></select>
                                                ) : (
                                                    <select id={`${key}-clim`} className="form-select" value={room.clim} onChange={e => handleRoomChange(key, "clim", e.target.value)}>
                                                        <option value="">Confort...</option>
                                                        <option value="non">Ventilé ({formatConverted(PRICE_VENT)})</option>
                                                        <option value="oui">Climatisé ({formatConverted(PRICE_CLIM)})</option>
                                                    </select>
                                                )}
                                                {errorsStep2[key]?.clim && <small className="text-danger">{errorsStep2[key].clim}</small>}
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor={`${key}-adults`} className="small">Adultes</label>
                                                <input id={`${key}-adults`} type="number" min={1} className="form-control" value={room.adults} onChange={e => handleRoomChange(key, "adults", Number(e.target.value))} />
                                            </div>
                                            {config?.canHaveChildren && <div className="col-md-6"><label htmlFor={`${key}-children`} className="small">Enfants</label><input id={`${key}-children`} type="number" min={0} className="form-control" value={room.children} onChange={e => handleRoomChange(key, "children", Number(e.target.value))} /></div>}
                                            {errorsStep2[key]?.cap && <div className="col-12"><small className="text-danger fw-bold">{errorsStep2[key].cap}</small></div>}
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="d-flex justify-content-between"><button className="btn btn-secondary" onClick={() => setStep(0)}>Retour</button><button className="btn btn-primary" onClick={validateStep2}>Suivant</button></div>
                        </div>
                    )}

                    {/* STEP 2 : EXTRAS */}
                    {step === 2 && (
                        <div>
                            <h5>3. Extras</h5>
                            <div className="row g-2">
                                {extrasList.map(ex => {
                                    const isIncludedBySuite = hasSuite && (ex.name === 'Piscine' || ex.name === 'Salle de sport');
                                    const checked = isIncludedBySuite ? true : form.extras.includes(ex.name);
                                    return (
                                        <div className="col-md-6" key={ex.name}>
                                            <div className="form-check border p-2 rounded">
                                                <input id={`extra-${ex.name}`} className="form-check-input ms-1" type="checkbox" checked={checked} onChange={() => toggleExtra(ex.name)} disabled={isIncludedBySuite} />
                                                <label htmlFor={`extra-${ex.name}`} className="form-check-label ms-4">{ex.name}{isIncludedBySuite ? ' (Inclus avec la suite)' : ''}</label>
                                                {(!isIncludedBySuite && form.extras.includes(ex.name)) && (
                                                    <div className="mt-2" style={{ maxWidth: 140 }}>
                                                        <label htmlFor={`qty-${ex.name}`} className="visually-hidden">Quantité {ex.name}</label>
                                                        <input
                                                            id={`qty-${ex.name}`}
                                                            type="number"
                                                            min={1}
                                                            className="form-control form-control-sm"
                                                            value={extrasQty[ex.name] ?? Math.max(1, totalPeople)}
                                                            onChange={e => setExtraQty(ex.name, Number(e.target.value))}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="d-flex justify-content-between mt-3"><button className="btn btn-secondary" onClick={() => setStep(1)}>Retour</button><button className="btn btn-primary" onClick={() => setStep(3)}>Suivant</button></div>
                        </div>
                    )}

                    {/* STEP 3 : CLIENT */}
                    {step === 3 && (
                        <div>
                            <h5>4. Informations Client</h5>
                            <label htmlFor="client-name" className="visually-hidden">Nom complet</label>
                            <input id="client-name" type="text" className="form-control mb-2" placeholder="Nom complet" value={form.customer.name} onChange={e => setForm(prev => ({ ...prev, customer: { ...prev.customer, name: e.target.value } }))} />
                            {errorsStep4.name && <small className="text-danger">{errorsStep4.name}</small>}

                            <label htmlFor="client-email" className="visually-hidden">Email</label>
                            <input id="client-email" type="email" className="form-control mb-2" placeholder="Email" value={form.customer.email} onChange={e => setForm(prev => ({ ...prev, customer: { ...prev.customer, email: e.target.value } }))} />
                            {errorsStep4.email && <small className="text-danger">{errorsStep4.email}</small>}

                            <label htmlFor="client-phone" className="visually-hidden">Téléphone</label>
                            <input id="client-phone" type="tel" className="form-control mb-3" placeholder="Téléphone" value={form.customer.phone} onChange={e => setForm(prev => ({ ...prev, customer: { ...prev.customer, phone: e.target.value } }))} />
                            {errorsStep4.phone && <small className="text-danger">{errorsStep4.phone}</small>}
                            <div className="form-check mb-3"><input id="client-whatsapp" type="checkbox" className="form-check-input" checked={form.customer.whatsapp} onChange={e => setForm(prev => ({ ...prev, customer: { ...prev.customer, whatsapp: e.target.checked } }))} /><label htmlFor="client-whatsapp" className="form-check-label">Numéro WhatsApp</label></div>
                            <div className="d-flex justify-content-between"><button className="btn btn-secondary" onClick={() => setStep(2)}>Retour</button><button className="btn btn-primary" onClick={validateStep4}>Générer Facture</button></div>
                        </div>
                    )}

                    {/* STEP 4 : FACTURE */}
                    {step === 4 && (
                        <div>
                            <div className="border p-4 bg-white shadow-sm">
                                <h4 className="text-center mb-4">FACTURE PROFORMA</h4>
                                <div className="mb-3">
                                    <strong>Client :</strong> {form.customer.name} {form.customer.email ? `| ${form.customer.email}` : ''} | <strong>Période :</strong> {nights} nuit(s)
                                    {reservationNumber && <div><strong>Réservation N° :</strong> {reservationNumber}</div>}
                                    <div><strong>Nombre total de personnes :</strong> {Math.max(0, totalPeople)}</div>
                                </div>
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Désignation</th>
                                            <th className="text-center">Nuits</th>
                                            <th className="text-end">HT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(form.rooms).map(([roomKey, r]) => {
                                            let pricePerNight = PRICE_VENT;
                                            let confortLabel = "(VENTILÉ)";
                                            if (r.type === "suite") { pricePerNight = PRICE_SUITE; confortLabel = "(CLIM INCLUS)"; }
                                            else if (r.clim === "oui") { pricePerNight = PRICE_CLIM; confortLabel = "(CLIM)"; }
                                            return (
                                                <tr key={roomKey}>
                                                    <td>{r.type.toUpperCase()} {confortLabel}<br/><small className="text-muted">{r.adults} Adulte(s) / {r.children} Enfant(s)</small></td>
                                                    <td className="text-center">{nights}</td>
                                                    <td className="text-end">{formatConverted(pricePerNight * nights)}</td>
                                                </tr>
                                            );
                                        })}
                                        {form.extras.map(name => {
                                            const isIncludedBySuite = hasSuite && (name === 'Piscine' || name === 'Salle de sport');
                                            const qty = Math.max(1, extrasQty[name] ?? totalPeople);
                                            const label = isIncludedBySuite ? `${name} (Inclus avec la suite)` : `${name} (Payé sur place) - ${qty} personne(s)`;
                                            return (
                                                <tr key={name}><td colSpan={2}>Extra : {label}</td><td className="text-end">—</td></tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="fw-bold"><td colSpan={2} className="text-end">TOTAL HT</td><td className="text-end">{formatConverted(total)}</td></tr>
                                        <tr className="fw-bold"><td colSpan={2} className="text-end">TVA (0%)</td><td className="text-end">{formatConverted(0)}</td></tr>
                                        <tr className="table-primary fw-bold text-primary"><td colSpan={2} className="text-end">TOTAL TTC</td><td className="text-end">{formatConverted(total)}</td></tr>
                                     </tfoot>
                                 </table>
                                <div className="mt-3">
                                    <h6>Règles</h6>
                                    <ul>
                                        <li>Les extras sélectionnés sont payés sur place à la demande et ne sont pas inclus dans le total affiché.</li>
                                        <li>La Piscine et la Salle de sport sont incluses automatiquement si une <strong>suite</strong> est réservée.</li>
                                        <li>Le total affiché correspond uniquement au prix des chambres.</li>
                                    </ul>
                                </div>
                             </div>
                            <div className="d-flex justify-content-between mt-4">
                                <button className="btn btn-secondary" onClick={() => setStep(3)} disabled={isSubmitting}>Retour</button>
                                <button
                                    className="btn btn-success"
                                    onClick={async () => {
                                        if (isSubmitting) return;
                                        setIsSubmitting(true);
                                        try {
                                            const num = await submitReservation();
                                            await openPrintWindow(num);
                                        } finally {
                                            setIsSubmitting(false);
                                        }
                                    }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Envoi en cours..." : "Imprimer & Confirmer"}
                                </button>
                            </div>
                            {submitError && <div className="mt-3 alert alert-warning" role="alert">{submitError}</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
