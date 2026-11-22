'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  KeyRound,
  LogOut,
  Mail,
  MailCheck,
  Phone,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import { currencies, defaultContactInfos } from '@/app/types/hotelData';
import type { StoredReservation } from '@/app/types/reservation';
import type { UserProfile } from '@/app/types/user';
import {
  getStoredReservations,
  mergeReservations,
  partitionReservations,
  saveStoredReservationsList,
  saveStoredUserProfile,
  upsertStoredReservation,
} from '@/app/lib/reservationClientState';

interface ProfileReservationsClientProps {
  initialAuthenticated?: boolean;
  initialEmail?: string;
  initialProfile?: UserProfile | null;
  initialServerReservations?: StoredReservation[];
}

type FilterTab = 'all' | 'upcoming' | 'past';
type AuthMode = 'email' | 'reference';

const MONTHS_SHORT_FR = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

function formatNumberFr(amount: number, decimals = 0): string {
  const safe = Number(amount) || 0;
  const fixed = decimals > 0 ? safe.toFixed(decimals) : String(Math.round(safe));
  const [intPart, decPart] = fixed.split('.');
  const spaced = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return decPart !== undefined ? `${spaced},${decPart}` : spaced;
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return 'Non précisée';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = MONTHS_SHORT_FR[d.getUTCMonth()] || '';
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hh}:${mm}`;
}

function formatShortDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = MONTHS_SHORT_FR[d.getUTCMonth()] || '';
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function formatRoomSummary(reservation: StoredReservation): string[] {
  const entries = Object.values(reservation.rooms || {});
  if (entries.length === 0) return ['Chambre standard'];
  return entries.map((r, i) => {
    const typeLabel = (r.type || 'Chambre').toUpperCase();
    const comfort =
      r.type === 'suite' ? 'Clim inclus' : r.clim === 'oui' ? 'Climatisée' : 'Ventilée';
    return `Chambre ${i + 1} · ${typeLabel} (${comfort}) · ${r.adults || 1}A / ${r.children || 0}E`;
  });
}

export default function ProfileReservationsClient({
  initialAuthenticated = false,
  initialEmail = '',
  initialProfile = null,
  initialServerReservations = [],
}: ProfileReservationsClientProps) {
  // Authentication / OTP state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuthenticated);
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [authStep, setAuthStep] = useState<'request' | 'verify'>('request');
  const [authEmail, setAuthEmail] = useState<string>(initialEmail);
  const [authReference, setAuthReference] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [maskedTargetEmail, setMaskedTargetEmail] = useState<string>('');
  const [sendingCode, setSendingCode] = useState<boolean>(false);
  const [verifyingCode, setVerifyingCode] = useState<boolean>(false);
  const [authFeedback, setAuthFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Authenticated client space state
  const [profile, setProfile] = useState<UserProfile>(
    initialProfile || {
      name: '',
      email: initialAuthenticated ? initialEmail : '',
      phone: '',
      whatsapp: false,
    }
  );
  const [reservations, setReservations] = useState<StoredReservation[]>(
    initialAuthenticated ? initialServerReservations : []
  );
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  // Dedicated Reference Search Form state (authenticated)
  const [referenceInput, setReferenceInput] = useState<string>('');
  const [activeSearchedRef, setActiveSearchedRef] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResultList, setSearchResultList] = useState<StoredReservation[] | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  const [currencyCode, setCurrencyCode] = useState('XOF');
  const [isSyncing, setIsSyncing] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  // Hydrate currency and client reservations ONLY when authenticated
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const storedCurrency = window.localStorage.getItem('lepays_currency');
      if (storedCurrency) setCurrencyCode(storedCurrency);

      if (!isAuthenticated || !profile.email) return;

      const localForUser = getStoredReservations().filter(
        (r) =>
          (r.customer?.email || '').trim().toLowerCase() === profile.email.trim().toLowerCase()
      );
      const merged = mergeReservations(initialServerReservations, localForUser, profile.email);
      setReservations(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, profile.email, initialServerReservations]);

  const activeCurrency = useMemo(
    () => currencies.find((c) => c.code === currencyCode) ?? currencies[0],
    [currencyCode]
  );

  const formatAmount = (xofAmount: number): string => {
    const xofRate = currencies.find((c) => c.code === 'XOF')?.rateToEUR ?? 655.957;
    const eur = (Number(xofAmount) || 0) / xofRate;
    const converted = eur * (activeCurrency.rateToEUR ?? 1);
    const value =
      activeCurrency.code === 'XOF'
        ? formatNumberFr(converted, 0)
        : formatNumberFr(converted, 2);
    if (activeCurrency.code === 'USD') return `${activeCurrency.symbol}${value}`;
    return `${value} ${activeCurrency.symbol}`;
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthFeedback(null);

    const trimmedEmail = authEmail.trim();
    const trimmedRef = authReference.trim();

    if (authMode === 'email' && (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail))) {
      setAuthFeedback({
        type: 'error',
        text: 'Veuillez saisir une adresse e-mail valide.',
      });
      return;
    }

    if (authMode === 'reference' && !trimmedRef) {
      setAuthFeedback({
        type: 'error',
        text: 'Veuillez saisir votre numéro de référence de réservation.',
      });
      return;
    }

    setSendingCode(true);
    try {
      const res = await fetch('/api/profile/send-code/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          authMode === 'email'
            ? { email: trimmedEmail }
            : { reservationNumber: trimmedRef }
        ),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setAuthFeedback({
          type: 'error',
          text: data?.error || "Impossible d'envoyer le code de vérification.",
        });
        return;
      }

      setMaskedTargetEmail(data.maskedEmail || trimmedEmail);
      setOtpCode('');
      setAuthStep('verify');
      setAuthFeedback({
        type: 'info',
        text:
          data.message ||
          'Un code de vérification unique à 6 chiffres vient d’être envoyé par e-mail.',
      });
    } catch {
      setAuthFeedback({
        type: 'error',
        text: "Erreur réseau lors de l'envoi du code de vérification.",
      });
    } finally {
      setSendingCode(false);
    }
  };

  const handleResendOtp = async () => {
    setAuthFeedback(null);
    setSendingCode(true);
    try {
      const res = await fetch('/api/profile/send-code/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          authMode === 'email'
            ? { email: authEmail.trim() }
            : { reservationNumber: authReference.trim() }
        ),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setAuthFeedback({
          type: 'error',
          text: data?.error || 'Impossible de renvoyer le code.',
        });
        return;
      }
      setAuthFeedback({
        type: 'success',
        text: 'Un nouveau code de vérification vient d’être envoyé à votre adresse e-mail.',
      });
    } catch {
      setAuthFeedback({
        type: 'error',
        text: 'Erreur réseau lors du renvoi du code.',
      });
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthFeedback(null);
    const cleanedCode = otpCode.replace(/\s+/g, '').trim();
    if (!/^\d{6}$/.test(cleanedCode)) {
      setAuthFeedback({
        type: 'error',
        text: 'Veuillez saisir le code à 6 chiffres reçu par e-mail.',
      });
      return;
    }

    setVerifyingCode(true);
    try {
      const res = await fetch('/api/profile/verify-code/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(authMode === 'email'
            ? { email: authEmail.trim() }
            : { reservationNumber: authReference.trim() }),
          code: cleanedCode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setAuthFeedback({
          type: 'error',
          text: data?.error || 'Code de vérification invalide ou expiré.',
        });
        return;
      }

      const verifiedProfile: UserProfile = data.profile || {
        name: '',
        email: data.email || authEmail.trim(),
        phone: '',
        whatsapp: false,
      };
      const serverList = Array.isArray(data.reservations)
        ? (data.reservations as StoredReservation[])
        : [];
      const localForUser = getStoredReservations().filter(
        (r) =>
          (r.customer?.email || '').trim().toLowerCase() ===
          verifiedProfile.email.trim().toLowerCase()
      );
      const merged = mergeReservations(serverList, localForUser, verifiedProfile.email);

      setProfile(verifiedProfile);
      saveStoredUserProfile(verifiedProfile);
      setReservations(merged);
      if (merged.length > 0) saveStoredReservationsList(merged);
      setIsAuthenticated(true);
      setAuthFeedback(null);

      // If user signed in via reference lookup, automatically filter/focus that reference
      if (authMode === 'reference' && authReference.trim()) {
        const refTrimmed = authReference.trim();
        setReferenceInput(refTrimmed);
        setActiveSearchedRef(refTrimmed);
        const q = refTrimmed.toLowerCase();
        const matches = merged.filter((item) =>
          (item.reservationNumber || '').toLowerCase().includes(q)
        );
        setSearchResultList(matches);
        setSearchMessage(
          matches.length > 0
            ? `${matches.length} réservation(s) trouvée(s) pour la référence « ${refTrimmed} ».`
            : `Aucune réservation trouvée pour la référence « ${refTrimmed} ».`
        );
        if (matches[0]) {
          setExpandedId(matches[0].reservationNumber);
        }
      }
    } catch {
      setAuthFeedback({
        type: 'error',
        text: 'Erreur réseau lors de la vérification du code.',
      });
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleClientLogout = async () => {
    try {
      await fetch('/api/profile/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network error on logout
    }
    setIsAuthenticated(false);
    setAuthStep('request');
    setOtpCode('');
    setReservations([]);
    setSearchResultList(null);
    setActiveSearchedRef('');
    setReferenceInput('');
    setSearchMessage(null);
    setProfileStatus(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);
    setIsSyncing(true);
    try {
      const res = await fetch('/api/profile/', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          whatsapp: profile.whatsapp,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setProfileStatus({
          type: 'error',
          text: data?.error || 'Impossible de mettre à jour vos informations.',
        });
        return;
      }
      const nextProfile: UserProfile = data.profile || profile;
      setProfile(nextProfile);
      saveStoredUserProfile(nextProfile);
      setProfileStatus({
        type: 'success',
        text: 'Vos informations personnelles ont été enregistrées.',
      });
    } catch {
      setProfileStatus({
        type: 'error',
        text: 'Erreur réseau lors de la mise à jour du profil.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefreshFromServer = async () => {
    setIsSyncing(true);
    setProfileStatus(null);
    try {
      const res = await fetch('/api/profile/reservations/', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      if (res.ok && data?.success && Array.isArray(data.reservations)) {
        const merged = mergeReservations(
          data.reservations as StoredReservation[],
          getStoredReservations(),
          profile.email
        );
        setReservations(merged);
        saveStoredReservationsList(merged);
        setProfileStatus({
          type: 'success',
          text: `Réservations actualisées (${merged.length}).`,
        });
      }
    } catch {
      setProfileStatus({
        type: 'error',
        text: 'Impossible de rafraîchir les réservations.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearchByReference = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = referenceInput.trim();
    if (!ref) {
      setActiveSearchedRef('');
      setSearchResultList(null);
      setSearchMessage(null);
      return;
    }

    setSearchLoading(true);
    setSearchMessage(null);
    try {
      const res = await fetch(
        `/api/profile/reservations/?reference=${encodeURIComponent(ref)}`,
        { credentials: 'include', cache: 'no-store' }
      );
      const data = await res.json();
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      if (!res.ok || !data?.success) {
        setSearchMessage(data?.error || 'Erreur lors de la recherche.');
        return;
      }
      const serverMatches = Array.isArray(data.reservations)
        ? (data.reservations as StoredReservation[])
        : [];
      const localMatches = reservations.filter((item) =>
        (item.reservationNumber || '').toLowerCase().includes(ref.toLowerCase())
      );
      const combined = mergeReservations(serverMatches, localMatches, profile.email);
      setActiveSearchedRef(ref);
      setSearchResultList(combined);
      setFilterTab('all');
      if (combined.length > 0) {
        setSearchMessage(
          `${combined.length} réservation(s) trouvée(s) pour la référence « ${ref} ».`
        );
        const firstNum = combined[0].reservationNumber;
        setExpandedId(firstNum);
        if (!qrMap[firstNum]) {
          try {
            const url = await QRCode.toDataURL(firstNum, { width: 180, margin: 1 });
            setQrMap((prev) => ({ ...prev, [firstNum]: url }));
          } catch {
            // ignore QR error
          }
        }
      } else {
        setSearchMessage(
          `Aucune réservation associée à votre compte ne correspond à la référence « ${ref} ».`
        );
      }
    } catch {
      setSearchMessage('Erreur réseau lors de la recherche par référence.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearReferenceSearch = () => {
    setReferenceInput('');
    setActiveSearchedRef('');
    setSearchResultList(null);
    setSearchMessage(null);
  };

  const handleToggleDetails = async (reservation: StoredReservation) => {
    const num = reservation.reservationNumber;
    if (expandedId === num) {
      setExpandedId(null);
      return;
    }
    setExpandedId(num);
    if (!qrMap[num]) {
      try {
        const url = await QRCode.toDataURL(num, { width: 180, margin: 1 });
        setQrMap((prev) => ({ ...prev, [num]: url }));
      } catch {
        // ignore QR error
      }
    }
  };

  const handleResendReceipt = async (reservation: StoredReservation) => {
    setResendingId(reservation.reservationNumber);
    setProfileStatus(null);
    try {
      const res = await fetch('/api/bookings/resend-receipt/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationNumber: reservation.reservationNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setProfileStatus({
          type: 'error',
          text: data?.error || 'Impossible de renvoyer le reçu.',
        });
        return;
      }
      if (data.reservation) {
        const nextList = upsertStoredReservation(data.reservation as StoredReservation);
        setReservations((prev) => mergeReservations([data.reservation as StoredReservation], prev));
        saveStoredReservationsList(nextList);
      }
      setProfileStatus({
        type: 'success',
        text: `Reçu de confirmation renvoyé à ${profile.email} pour la réservation ${reservation.reservationNumber}.`,
      });
    } catch (err) {
      setProfileStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur lors du renvoi du reçu.',
      });
    } finally {
      setResendingId(null);
    }
  };

  const handleCancelReservation = async (reservation: StoredReservation) => {
    setCancellingId(reservation.reservationNumber);
    setProfileStatus(null);
    try {
      const res = await fetch('/api/bookings/', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationNumber: reservation.reservationNumber,
          status: 'cancelled',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.reservation) {
        setProfileStatus({
          type: 'error',
          text: data?.error || "Impossible d'annuler cette réservation.",
        });
        return;
      }
      const updatedRecord = data.reservation as StoredReservation;
      upsertStoredReservation(updatedRecord);
      setReservations((prev) =>
        prev.map((item) =>
          item.reservationNumber === reservation.reservationNumber ? updatedRecord : item
        )
      );
      if (searchResultList) {
        setSearchResultList((prev) =>
          prev
            ? prev.map((item) =>
                item.reservationNumber === reservation.reservationNumber ? updatedRecord : item
              )
            : null
        );
      }
      setProfileStatus({
        type: 'success',
        text: `Réservation ${reservation.reservationNumber} annulée.`,
      });
    } catch (err) {
      setProfileStatus({
        type: 'error',
        text: err instanceof Error ? err.message : "Impossible d'annuler cette réservation.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const displayedBaseList = searchResultList !== null ? searchResultList : reservations;

  const { upcoming, past, cancelled } = useMemo(
    () => partitionReservations(displayedBaseList),
    [displayedBaseList]
  );

  const pastAndCancelled = useMemo(() => [...past, ...cancelled], [past, cancelled]);

  const hotelWhatsapp = useMemo(() => {
    const contact =
      defaultContactInfos.find((c) => c.type === 'whatsapp') ??
      defaultContactInfos.find((c) => c.link?.includes('wa.me'));
    return (contact?.number || '221776986382').replace(/\D/g, '');
  }, []);

  const renderReservationCard = (
    item: StoredReservation,
    category: 'upcoming' | 'past' | 'cancelled'
  ) => {
    const isExpanded = expandedId === item.reservationNumber;
    const roomLines = formatRoomSummary(item);
    const whatsappText = encodeURIComponent(
      `Bonjour Hôtel Le Pays, je vous contacte au sujet de ma réservation ${item.reservationNumber} (${formatShortDate(item.arrival)} - ${formatShortDate(item.departure)}).`
    );

    return (
      <article
        key={item.reservationNumber}
        className="border border-[#e5e0d5] rounded-lg bg-white p-4 p-md-5 mb-3"
      >
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 pb-3 border-bottom border-[#efeae0]">
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 text-muted small mb-1">
              <span className="fw-semibold text-dark" style={{ fontVariantNumeric: 'tabular-nums' }}>
                Réf. {item.reservationNumber}
              </span>
              <span aria-hidden="true">·</span>
              <span>Créée le {formatShortDate(item.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {item.nights} nuit(s) · {item.numRooms} chambre(s)
              </span>
            </div>

            <h4 className="h5 mb-1 text-dark">
              {item.offer
                ? `Offre « ${item.offer.title} »`
                : item.label || 'Séjour à l’Hôtel Le Pays'}
            </h4>

            <div className="d-flex flex-wrap align-items-center gap-2 small text-secondary mt-1">
              <span className="d-inline-flex align-items-center gap-1">
                <CalendarCheck className="w-4 h-4" />
                Arrivée : {formatDateTime(item.arrival)}
              </span>
              <span aria-hidden="true">/</span>
              <span className="d-inline-flex align-items-center gap-1">
                <Clock className="w-4 h-4" />
                Départ : {formatDateTime(item.departure)}
              </span>
            </div>
          </div>

          <div className="text-lg-end d-flex flex-column justify-content-between align-items-lg-end">
            <div className="d-inline-flex align-items-center gap-1 small fw-semibold mb-2">
              {category === 'upcoming' && item.status === 'pending' && (
                <span className="text-warning-emphasis bg-warning-subtle border border-warning-subtle rounded px-2 py-1 d-inline-flex align-items-center gap-1">
                  <Clock className="w-4 h-4" />
                  À venir · En attente de validation
                </span>
              )}
              {category === 'upcoming' && item.status !== 'pending' && (
                <span className="text-success d-inline-flex align-items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  À venir · Confirmée
                </span>
              )}
              {category === 'past' && (
                <span className="text-secondary d-inline-flex align-items-center gap-1">
                  <CalendarClock className="w-4 h-4" />
                  {item.status === 'completed' ? 'Séjour terminé' : 'Séjour passé'}
                </span>
              )}
              {category === 'cancelled' && (
                <span className="text-danger d-inline-flex align-items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Annulée
                </span>
              )}
            </div>
            <div
              className="fs-5 fw-bold"
              style={{ color: '#9a6b2f', fontVariantNumeric: 'tabular-nums' }}
            >
              {formatAmount(item.total)}
            </div>
          </div>
        </div>

        <div className="pt-3 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center">
          <div className="small text-secondary">
            {roomLines.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
            {item.emailReceipt?.userSent && (
              <div className="d-inline-flex align-items-center gap-1 text-success mt-1">
                <MailCheck className="w-4 h-4" />
                Reçu envoyé à {item.emailReceipt.userEmail}
              </div>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleToggleDetails(item)}
              className="btn btn-sm btn-outline-dark whitespace-nowrap"
            >
              {isExpanded ? 'Masquer détails' : 'Détails & QR'}
            </button>
            <button
              type="button"
              onClick={() => handleResendReceipt(item)}
              disabled={resendingId === item.reservationNumber}
              className="btn btn-sm btn-outline-secondary whitespace-nowrap d-inline-flex align-items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              {resendingId === item.reservationNumber ? 'Envoi...' : 'Renvoyer le reçu'}
            </button>
            <a
              href={`https://wa.me/${hotelWhatsapp}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-success whitespace-nowrap"
            >
              WhatsApp
            </a>
            {category === 'upcoming' && (
              <button
                type="button"
                onClick={() => handleCancelReservation(item)}
                disabled={cancellingId === item.reservationNumber}
                className="btn btn-sm btn-outline-danger whitespace-nowrap"
              >
                {cancellingId === item.reservationNumber ? 'Annulation...' : 'Annuler'}
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-top border-[#efeae0] row g-3 align-items-center">
            <div className="col-md-8 small">
              <div className="fw-semibold text-dark mb-1">Informations client &amp; extras</div>
              <div>
                {item.customer?.name} · {item.customer?.email} · {item.customer?.phone}
              </div>
              {Array.isArray(item.extras) && item.extras.length > 0 ? (
                <ul className="mb-0 mt-2 ps-3">
                  {item.extras.map((ex, idx) => (
                    <li key={idx}>
                      {ex.name} —{' '}
                      {ex.unitPrice === 0 && !ex.paidOnSite
                        ? 'Inclus avec la suite'
                        : `${ex.qty} pers. (payé sur place)`}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted mt-1">Aucun extra sélectionné.</div>
              )}
              {item.emailReceipt && (
                <div className="text-muted mt-2">
                  Confirmation envoyée le {formatDateTime(item.emailReceipt.sentAt)} à{' '}
                  {item.emailReceipt.userEmail}.
                </div>
              )}
            </div>
            <div className="col-md-4 text-md-end">
              {qrMap[item.reservationNumber] && (
                <div className="d-inline-block text-center">
                  <img
                    src={qrMap[item.reservationNumber]}
                    alt={`QR code ${item.reservationNumber}`}
                    style={{ width: 112, height: 112 }}
                    className="border p-1 bg-white rounded"
                  />
                  <div className="small text-muted mt-1 d-inline-flex align-items-center gap-1 justify-content-center w-100">
                    <Printer className="w-3 h-3" />
                    Code d&apos;arrivée
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    );
  };

  // Unauthenticated view: Email OTP verification + optional Reference lookup trigger
  if (!isAuthenticated) {
    return (
      <section className="py-5" style={{ backgroundColor: '#faf8f4', minHeight: '70vh' }}>
        <div className="container">
          <div
            className="bg-white border border-[#e5e0d5] rounded-lg p-4 p-md-5 mx-auto"
            style={{ maxWidth: 660 }}
          >
            <div className="pb-3 mb-4 border-bottom border-[#efeae0]">
              <div
                className="text-uppercase small fw-semibold d-flex align-items-center gap-2"
                style={{ color: '#9a6b2f', letterSpacing: '0.08em' }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Espace Client Sécurisé · Hôtel Le Pays</span>
              </div>
              <h2 className="h3 mt-2 mb-1 text-dark">Mon Profil &amp; Mes Réservations</h2>
              <p className="text-muted small mb-0">
                Cet espace est exclusivement réservé aux clients. Confirmez votre identité par
                code de vérification unique envoyé par e-mail pour consulter vos informations et
                retrouver vos réservations.
              </p>
            </div>

            {authStep === 'request' && (
              <>
                <div className="btn-group w-100 mb-4" role="tablist" aria-label="Mode d'accès">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authMode === 'email'}
                    className={`btn btn-sm ${
                      authMode === 'email' ? 'btn-dark' : 'btn-outline-secondary'
                    }`}
                    onClick={() => {
                      setAuthMode('email');
                      setAuthFeedback(null);
                    }}
                  >
                    Accès par adresse e-mail
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authMode === 'reference'}
                    className={`btn btn-sm ${
                      authMode === 'reference' ? 'btn-dark' : 'btn-outline-secondary'
                    }`}
                    onClick={() => {
                      setAuthMode('reference');
                      setAuthFeedback(null);
                    }}
                  >
                    Retrouver par référence
                  </button>
                </div>

                <form onSubmit={handleRequestCode} className="space-y-3">
                  {authMode === 'email' ? (
                    <div className="mb-3">
                      <label
                        htmlFor="client-auth-email"
                        className="form-label small fw-semibold text-dark d-flex align-items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Votre adresse e-mail</span>
                      </label>
                      <input
                        id="client-auth-email"
                        type="email"
                        required
                        className="form-control"
                        placeholder="exemple@domaine.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                      />
                      <div className="form-text">
                        Saisissez l&apos;adresse e-mail utilisée lors de votre réservation. Un code
                        à usage unique vous y sera envoyé.
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label
                        htmlFor="client-auth-reference"
                        className="form-label small fw-semibold text-dark d-flex align-items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        <span>Référence de réservation</span>
                      </label>
                      <input
                        id="client-auth-reference"
                        type="text"
                        required
                        className="form-control"
                        placeholder="Ex : RCHLP00..."
                        value={authReference}
                        onChange={(e) => setAuthReference(e.target.value)}
                      />
                      <div className="form-text">
                        Nous enverrons automatiquement un code de vérification unique à
                        l&apos;adresse e-mail associée à cette référence.
                      </div>
                    </div>
                  )}

                  {authFeedback && (
                    <div
                      className={`alert ${
                        authFeedback.type === 'error'
                          ? 'alert-danger'
                          : authFeedback.type === 'success'
                            ? 'alert-success'
                            : 'alert-info'
                      } py-2 small`}
                      role="status"
                    >
                      {authFeedback.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sendingCode}
                    className="btn btn-primary w-100 py-2 fw-semibold"
                  >
                    {sendingCode
                      ? 'Envoi du code en cours...'
                      : 'Envoyer le code de vérification'}
                  </button>
                </form>
              </>
            )}

            {authStep === 'verify' && (
              <form onSubmit={handleVerifyCode} className="space-y-3">
                <div className="mb-3">
                  <div className="small text-muted mb-2">
                    Code envoyé à :{' '}
                    <strong className="text-dark">
                      {maskedTargetEmail || authEmail}
                    </strong>
                  </div>
                  <label
                    htmlFor="client-otp-code"
                    className="form-label small fw-semibold text-dark d-flex align-items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Code de vérification unique (6 chiffres)</span>
                  </label>
                  <input
                    id="client-otp-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    className="form-control form-control-lg text-center fw-bold"
                    style={{ letterSpacing: '0.35em', fontVariantNumeric: 'tabular-nums' }}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>

                {authFeedback && (
                  <div
                    className={`alert ${
                      authFeedback.type === 'error'
                        ? 'alert-danger'
                        : authFeedback.type === 'success'
                          ? 'alert-success'
                          : 'alert-info'
                    } py-2 small`}
                    role="status"
                  >
                    {authFeedback.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifyingCode}
                  className="btn btn-primary w-100 py-2 fw-semibold mb-2"
                >
                  {verifyingCode ? 'Vérification...' : 'Valider le code et accéder'}
                </button>

                <div className="d-flex flex-wrap justify-content-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('request');
                      setAuthFeedback(null);
                    }}
                    className="btn btn-sm btn-link text-decoration-none px-0 d-inline-flex align-items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Modifier l&apos;e-mail ou la référence</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={sendingCode}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    {sendingCode ? 'Envoi...' : 'Renvoyer un code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Authenticated Client Space
  return (
    <section className="py-5" style={{ backgroundColor: '#faf8f4', minHeight: '70vh' }}>
      <div className="container">
        {/* Profile Header + Personal Information */}
        <div className="bg-white border border-[#e5e0d5] rounded-lg p-4 p-md-5 mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-4 border-bottom border-[#efeae0]">
            <div>
              <div
                className="text-uppercase small fw-semibold d-inline-flex align-items-center gap-1"
                style={{ color: '#9a6b2f', letterSpacing: '0.08em' }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Espace Client Vérifié · Hôtel Le Pays</span>
              </div>
              <h2 className="h3 mb-1 mt-1 text-dark">
                {profile.name ? `Bonjour, ${profile.name}` : 'Mon Profil & Mes Réservations'}
              </h2>
              <p className="text-muted mb-0 small">
                Consultez vos informations personnelles, recherchez une réservation par référence et
                téléchargez vos reçus en toute autonomie.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <select
                aria-label="Devise d'affichage"
                className="form-select form-select-sm w-auto"
                value={currencyCode}
                onChange={(e) => {
                  setCurrencyCode(e.target.value);
                  window.localStorage.setItem('lepays_currency', e.target.value);
                }}
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <Link href="/booking/" className="btn btn-sm btn-dark whitespace-nowrap">
                Nouvelle réservation
              </Link>
              <button
                type="button"
                onClick={handleClientLogout}
                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 whitespace-nowrap"
              >
                <LogOut className="w-3 h-3" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="row g-3 py-3 border-bottom border-[#efeae0]">
            <div className="col-4">
              <div className="small text-muted">À venir</div>
              <div className="fs-4 fw-bold text-dark" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {upcoming.length}
              </div>
            </div>
            <div className="col-4">
              <div className="small text-muted">Séjours passés</div>
              <div className="fs-4 fw-bold text-dark" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {past.length}
              </div>
            </div>
            <div className="col-4">
              <div className="small text-muted">Total</div>
              <div className="fs-4 fw-bold text-dark" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {displayedBaseList.length}
              </div>
            </div>
          </div>

          {/* Personal Info Form */}
          <form onSubmit={handleSaveProfile} className="pt-4">
            <h3 className="h6 text-uppercase text-muted fw-semibold mb-3" style={{ letterSpacing: '0.06em' }}>
              Mes informations personnelles
            </h3>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label
                  htmlFor="profile-name"
                  className="form-label small fw-semibold text-dark d-flex align-items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  Nom complet
                </label>
                <input
                  id="profile-name"
                  type="text"
                  className="form-control"
                  placeholder="Votre nom"
                  value={profile.name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="col-md-4">
                <label
                  htmlFor="profile-email"
                  className="form-label small fw-semibold text-dark d-flex align-items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  Adresse e-mail (vérifiée)
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-control bg-light"
                  readOnly
                  value={profile.email}
                />
              </div>
              <div className="col-md-3">
                <label
                  htmlFor="profile-phone"
                  className="form-label small fw-semibold text-dark d-flex align-items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  Téléphone
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  className="form-control"
                  placeholder="+221 77 ..."
                  value={profile.phone}
                  onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="col-md-2 d-grid">
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="btn btn-primary whitespace-nowrap"
                >
                  {isSyncing ? 'Enregistrement...' : 'Mettre à jour'}
                </button>
              </div>
            </div>

            <div className="form-check mt-3">
              <input
                id="profile-whatsapp"
                type="checkbox"
                className="form-check-input"
                checked={profile.whatsapp}
                onChange={(e) => setProfile((prev) => ({ ...prev, whatsapp: e.target.checked }))}
              />
              <label htmlFor="profile-whatsapp" className="form-check-label small text-muted">
                Ce numéro est joignable sur WhatsApp
              </label>
            </div>

            {profileStatus && (
              <div
                className={`mt-3 alert ${
                  profileStatus.type === 'success' ? 'alert-success' : 'alert-danger'
                } mb-0 py-2 small`}
                role="status"
              >
                {profileStatus.text}
              </div>
            )}
          </form>
        </div>

        {/* Dedicated Reservation Search by Reference Form */}
        <div className="bg-white border border-[#e5e0d5] rounded-lg p-4 p-md-5 mb-4">
          <h3 className="h5 mb-1 text-dark">Rechercher une réservation par référence</h3>
          <p className="text-muted small mb-3">
            Saisissez le numéro de référence figurant sur votre reçu de confirmation (ex :{' '}
            <code>RCHLP00...</code>) pour retrouver instantanément votre dossier.
          </p>

          <form onSubmit={handleSearchByReference} className="row g-2 align-items-center">
            <div className="col-md-7">
              <label htmlFor="reservation-reference-search" className="visually-hidden">
                Référence de la réservation
              </label>
              <div className="position-relative">
                <Search
                  className="w-4 h-4 text-muted position-absolute"
                  style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="reservation-reference-search"
                  type="text"
                  className="form-control ps-5"
                  placeholder="Entrez votre référence de réservation (ex : RCHLP00...)"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 d-grid">
              <button
                type="submit"
                disabled={searchLoading}
                className="btn btn-dark whitespace-nowrap"
              >
                {searchLoading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
            <div className="col-md-2 d-grid">
              {activeSearchedRef && (
                <button
                  type="button"
                  onClick={handleClearReferenceSearch}
                  className="btn btn-outline-secondary whitespace-nowrap"
                >
                  Tout afficher
                </button>
              )}
            </div>
          </form>

          {searchMessage && (
            <div
              className={`mt-3 alert ${
                searchResultList && searchResultList.length > 0 ? 'alert-success' : 'alert-warning'
              } mb-0 py-2 small`}
              role="status"
            >
              {searchMessage}
            </div>
          )}
        </div>

        {/* My Reservations Section */}
        <div id="my-reservations" className="bg-white border border-[#e5e0d5] rounded-lg p-4 p-md-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
            <div>
              <h3 className="h4 mb-1 text-dark">
                {activeSearchedRef
                  ? `Résultat pour la référence « ${activeSearchedRef} »`
                  : 'Mes Réservations'}
              </h3>
              <p className="text-muted small mb-0">
                {activeSearchedRef
                  ? 'Détails complets de votre réservation correspondante.'
                  : 'Liste complète de vos réservations à venir et passées associées à votre adresse e-mail.'}
              </p>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="btn-group" role="tablist" aria-label="Filtrer les réservations">
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterTab === 'all'}
                  className={`btn btn-sm ${filterTab === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterTab('all')}
                >
                  Toutes ({displayedBaseList.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterTab === 'upcoming'}
                  className={`btn btn-sm ${
                    filterTab === 'upcoming' ? 'btn-dark' : 'btn-outline-secondary'
                  }`}
                  onClick={() => setFilterTab('upcoming')}
                >
                  À venir ({upcoming.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterTab === 'past'}
                  className={`btn btn-sm ${filterTab === 'past' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterTab('past')}
                >
                  Passées ({pastAndCancelled.length})
                </button>
              </div>

              <button
                type="button"
                onClick={handleRefreshFromServer}
                disabled={isSyncing}
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                title="Actualiser depuis le serveur"
              >
                <RefreshCw className="w-3 h-3" />
                Actualiser
              </button>
            </div>
          </div>

          {displayedBaseList.length === 0 ? (
            <div className="text-center py-5 border border-dashed rounded bg-light">
              <h4 className="h6 text-dark mb-2">Aucune réservation trouvée</h4>
              <p className="small text-muted mb-3">
                {activeSearchedRef
                  ? `Aucune réservation portant la référence « ${activeSearchedRef} » n'est associée à ${profile.email}.`
                  : `Aucune réservation enregistrée pour ${profile.email}. Vous pouvez effectuer une réservation dès maintenant.`}
              </p>
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                {activeSearchedRef && (
                  <button
                    type="button"
                    onClick={handleClearReferenceSearch}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    Afficher toutes mes réservations
                  </button>
                )}
                <Link href="/booking/" className="btn btn-sm btn-primary">
                  Faire une réservation
                </Link>
                <Link href="/pricing/" className="btn btn-sm btn-outline-dark">
                  Voir nos tarifs
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {(filterTab === 'all' || filterTab === 'upcoming') && (
                <div className="mb-4">
                  <h4
                    className="h6 text-uppercase text-muted fw-semibold mb-3"
                    style={{ letterSpacing: '0.06em' }}
                  >
                    Réservations à venir ({upcoming.length})
                  </h4>
                  {upcoming.length === 0 ? (
                    <p className="small text-muted">Aucune réservation à venir pour le moment.</p>
                  ) : (
                    upcoming.map((item) => renderReservationCard(item, 'upcoming'))
                  )}
                </div>
              )}

              {(filterTab === 'all' || filterTab === 'past') && (
                <div>
                  <h4
                    className="h6 text-uppercase text-muted fw-semibold mb-3"
                    style={{ letterSpacing: '0.06em' }}
                  >
                    Réservations passées &amp; annulées ({pastAndCancelled.length})
                  </h4>
                  {pastAndCancelled.length === 0 ? (
                    <p className="small text-muted">Aucune réservation passée ou annulée.</p>
                  ) : (
                    <>
                      {past.map((item) => renderReservationCard(item, 'past'))}
                      {cancelled.map((item) => renderReservationCard(item, 'cancelled'))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
