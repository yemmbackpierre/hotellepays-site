'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import type {
  AdminAuditEntry,
  PaymentStatus,
  ReservationStatus,
  StoredReservation,
} from '@/app/types/reservation';

interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

interface ConfigStatus {
  whatsappProviderConfigured: boolean;
  notificationNumberConfigured: boolean;
  notificationEmailConfigured: boolean;
  mailConfigured: boolean;
}

interface ReservationsManagerProps {
  onNotify: (type: 'success' | 'error', msg: string) => void;
}

const inputClass =
  'w-full rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 px-3 py-2 text-xs focus:outline-none focus:border-amber-500';

const MONTHS_FR = [
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

function formatDateTimeFr(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = MONTHS_FR[d.getUTCMonth()] || '';
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hh}:${mm}`;
}

function formatXof(amount: number): string {
  const safe = Math.round(Number(amount) || 0);
  return `${String(safe).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
}

function statusBadge(status: ReservationStatus) {
  switch (status) {
    case 'confirmed':
      return {
        label: 'Confirmée',
        cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    case 'cancelled':
      return {
        label: 'Annulée',
        cls: 'bg-red-500/15 text-red-300 border-red-500/30',
      };
    case 'completed':
      return {
        label: 'Terminée',
        cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      };
    case 'pending':
    default:
      return {
        label: 'En attente',
        cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
  }
}

function paymentLabel(paymentStatus?: PaymentStatus) {
  if (paymentStatus === 'paid') return 'Réglée';
  if (paymentStatus === 'partial') return 'Acompte réglé';
  return 'Non réglée';
}

function summarizeAccommodation(res: StoredReservation): string {
  const rooms = Object.values(res.rooms || {});
  const roomTypes =
    rooms.length > 0
      ? rooms
          .map((r) => `${(r.type || 'Chambre').toUpperCase()} (${r.clim === 'oui' || r.type === 'suite' ? 'Clim' : 'Vent.'})`)
          .join(', ')
      : `${res.numRooms || 1} chambre(s)`;
  return res.offer ? `${res.offer.title} · ${roomTypes}` : roomTypes;
}

export default function ReservationsManager({ onNotify }: ReservationsManagerProps) {
  const [reservations, setReservations] = useState<StoredReservation[]>([]);
  const [stats, setStats] = useState<ReservationStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  });
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReservationStatus>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<
    'createdAt_desc' | 'createdAt_asc' | 'arrival_asc' | 'arrival_desc' | 'total_desc'
  >('createdAt_desc');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [totalCount, setTotalCount] = useState(0);

  // Modals & Action states
  const [selectedReservation, setSelectedReservation] = useState<StoredReservation | null>(null);
  const [selectedAuditLogs, setSelectedAuditLogs] = useState<AdminAuditEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [cancelTarget, setCancelTarget] = useState<StoredReservation | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<StoredReservation | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const buildQueryString = useCallback(
    (includePage = true) => {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set('q', q.trim());
      if (statusFilter !== 'all') sp.set('status', statusFilter);
      if (dateFrom) sp.set('from', dateFrom);
      if (dateTo) sp.set('to', dateTo);
      if (sort) sp.set('sort', sort);
      if (includePage) {
        sp.set('page', String(page));
        sp.set('pageSize', String(pageSize));
      }
      return sp.toString();
    },
    [q, statusFilter, dateFrom, dateTo, sort, page]
  );

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQueryString(true);
      const res = await fetch(`/api/admin/reservations/?${qs}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        onNotify('error', data?.error || 'Impossible de charger les réservations.');
        return;
      }
      setReservations(Array.isArray(data.reservations) ? data.reservations : []);
      setTotalCount(Number(data.totalCount || 0));
      if (data.stats) setStats(data.stats);
      if (data.configStatus) setConfigStatus(data.configStatus);
      if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
    } catch {
      onNotify('error', 'Erreur réseau lors du chargement des réservations.');
    } finally {
      setLoading(false);
    }
  }, [buildQueryString, onNotify]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        void fetchReservations();
      }
    });
    return () => {
      active = false;
    };
  }, [fetchReservations]);

  const openDetails = async (resItem: StoredReservation) => {
    setSelectedReservation(resItem);
    setSelectedAuditLogs([]);
    setDetailLoading(true);
    try {
      const r = await fetch(
        `/api/admin/reservations/${encodeURIComponent(resItem.reservationNumber)}/`,
        { credentials: 'include', cache: 'no-store' }
      );
      const data = await r.json();
      if (r.ok && data?.reservation) {
        setSelectedReservation(data.reservation);
        setSelectedAuditLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
      }
    } catch {
      // keep initial item if refresh fails
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePatchAction = async (
    reservationNumber: string,
    payload: {
      action: 'validate' | 'cancel' | 'complete' | 'updatePayment';
      cancellationReason?: string;
      paymentStatus?: PaymentStatus;
    },
    successMsg: string
  ) => {
    setBusyKey(`${reservationNumber}:${payload.action}`);
    try {
      const res = await fetch(
        `/api/admin/reservations/${encodeURIComponent(reservationNumber)}/`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        onNotify('error', data?.error || 'Action impossible.');
        return false;
      }
      onNotify('success', successMsg);
      if (selectedReservation?.reservationNumber === reservationNumber && data.reservation) {
        setSelectedReservation(data.reservation);
      }
      await fetchReservations();
      return true;
    } catch {
      onNotify('error', 'Erreur réseau pendant la mise à jour.');
      return false;
    } finally {
      setBusyKey(null);
    }
  };

  const handleSendPdfOrWhatsApp = async (
    resItem: StoredReservation,
    channel: 'email' | 'whatsapp'
  ) => {
    setBusyKey(`${resItem.reservationNumber}:${channel}`);
    try {
      const res = await fetch(
        `/api/admin/reservations/${encodeURIComponent(resItem.reservationNumber)}/send-pdf/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        onNotify(
          'error',
          data?.error ||
            (channel === 'whatsapp'
              ? 'Envoi WhatsApp non confirmé.'
              : "Échec de l'envoi du PDF par e-mail.")
        );
        if (data?.reservation && selectedReservation?.reservationNumber === resItem.reservationNumber) {
          setSelectedReservation(data.reservation);
        }
        return;
      }
      onNotify(
        'success',
        channel === 'email'
          ? `PDF officiel envoyé par e-mail à ${resItem.customer?.email} (${data.result?.mode || ''}).`
          : `Confirmation envoyée via WhatsApp Cloud API (${data.result?.messageId || ''}).`
      );
      if (data.reservation && selectedReservation?.reservationNumber === resItem.reservationNumber) {
        setSelectedReservation(data.reservation);
      }
      await fetchReservations();
    } catch {
      onNotify('error', "Erreur réseau lors de l'envoi.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const ref = deleteTarget.reservationNumber;
    setBusyKey(`${ref}:delete`);
    try {
      const res = await fetch(`/api/admin/reservations/${encodeURIComponent(ref)}/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        onNotify('error', data?.error || 'Impossible de supprimer cette réservation.');
        return;
      }
      onNotify('success', `Réservation ${ref} supprimée.`);
      setDeleteTarget(null);
      if (selectedReservation?.reservationNumber === ref) {
        setSelectedReservation(null);
      }
      await fetchReservations();
    } catch {
      onNotify('error', 'Erreur réseau lors de la suppression.');
    } finally {
      setBusyKey(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const csvExportUrl = `/api/admin/reservations/?${buildQueryString(false)}&format=csv`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white m-0">
            Gestion des réservations
          </h2>
          <p className="text-xs text-slate-400 m-0">
            Validez, annulez, exportez les confirmations PDF officielles et suivez les notifications.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={csvExportUrl}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-medium no-underline transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </a>
          <button
            type="button"
            onClick={fetchReservations}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, cls: 'text-white border-slate-800' },
          { label: 'En attente', value: stats.pending, cls: 'text-amber-400 border-amber-500/20' },
          { label: 'Confirmées', value: stats.confirmed, cls: 'text-emerald-400 border-emerald-500/20' },
          { label: 'Annulées', value: stats.cancelled, cls: 'text-red-400 border-red-500/20' },
          { label: 'Terminées', value: stats.completed, cls: 'text-sky-400 border-sky-500/20' },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl bg-slate-900 border ${card.cls} px-4 py-3`}
          >
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              {card.label}
            </div>
            <div className="text-2xl font-bold mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Server Notification Readiness Bar (Booleans only, never exposes secrets) */}
      {configStatus && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span className="text-slate-400 font-medium">État des canaux serveur :</span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                configStatus.mailConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              Transport e-mail : {configStatus.mailConfigured ? 'Actif (SMTP/Resend)' : 'Boîte locale'}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                configStatus.notificationEmailConfigured ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-300">
              NOTIFICATIONEMAIL :{' '}
              {configStatus.notificationEmailConfigured ? 'Défini' : 'Fallback CMS/Admin'}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                configStatus.whatsappProviderConfigured && configStatus.notificationNumberConfigured
                  ? 'bg-emerald-400'
                  : 'bg-red-400'
              }`}
            />
            <span className="text-slate-300">
              WhatsApp Cloud API :{' '}
              {configStatus.whatsappProviderConfigured && configStatus.notificationNumberConfigured
                ? 'Configuré'
                : 'Non configuré (aucun envoi simulé)'}
            </span>
          </span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>Recherche &amp; Filtres</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Référence, nom, téléphone ou e-mail..."
              className={`${inputClass} pl-8`}
            />
          </div>
          <select
            aria-label="Filtrer par statut"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | ReservationStatus);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="cancelled">Annulées</option>
            <option value="completed">Terminées</option>
          </select>
          <select
            aria-label="Trier les réservations"
            value={sort}
            onChange={(e) => {
              setSort(
                e.target.value as
                  | 'createdAt_desc'
                  | 'createdAt_asc'
                  | 'arrival_asc'
                  | 'arrival_desc'
                  | 'total_desc'
              );
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="createdAt_desc">Création (plus récentes)</option>
            <option value="createdAt_asc">Création (plus anciennes)</option>
            <option value="arrival_asc">Arrivée (prochaines)</option>
            <option value="arrival_desc">Arrivée (lointaines)</option>
            <option value="total_desc">Montant (décroissant)</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              aria-label="Date début"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            />
            <input
              type="date"
              aria-label="Date fin"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3 font-semibold">Référence</th>
                <th className="py-3 px-3 font-semibold">Client</th>
                <th className="py-3 px-3 font-semibold">Téléphone</th>
                <th className="py-3 px-3 font-semibold">E-mail</th>
                <th className="py-3 px-3 font-semibold">Hébergement</th>
                <th className="py-3 px-3 font-semibold">Arrivée</th>
                <th className="py-3 px-3 font-semibold">Départ</th>
                <th className="py-3 px-3 font-semibold text-center">Nuits</th>
                <th className="py-3 px-3 font-semibold text-right">Montant</th>
                <th className="py-3 px-3 font-semibold">Statut</th>
                <th className="py-3 px-3 font-semibold">Créée le</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && reservations.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Chargement des réservations...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    Aucune réservation trouvée pour ces critères.
                  </td>
                </tr>
              ) : (
                reservations.map((item) => {
                  const badge = statusBadge(item.status);
                  const canSendOfficial = item.status === 'confirmed' || item.status === 'completed';
                  return (
                    <tr key={item.reservationNumber} className="hover:bg-slate-800/35">
                      <td className="py-3 px-3 font-semibold text-amber-400 whitespace-nowrap">
                        {item.reservationNumber}
                      </td>
                      <td className="py-3 px-3 text-white font-medium whitespace-nowrap">
                        {item.customer?.name || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {item.customer?.phone || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {item.customer?.email || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-300 min-w-[170px]">
                        {summarizeAccommodation(item)}
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {formatDateTimeFr(item.arrival)}
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {formatDateTimeFr(item.departure)}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-200">{item.nights}</td>
                      <td className="py-3 px-3 text-right font-semibold text-white whitespace-nowrap">
                        {formatXof(item.total)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {paymentLabel(item.paymentStatus)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {formatDateTimeFr(item.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openDetails(item)}
                            title="Consulter"
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border-0 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {item.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() =>
                                handlePatchAction(
                                  item.reservationNumber,
                                  { action: 'validate' },
                                  `Réservation ${item.reservationNumber} validée.`
                                )
                              }
                              disabled={busyKey === `${item.reservationNumber}:validate`}
                              title="Valider la réservation"
                              className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border-0 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {item.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() =>
                                handlePatchAction(
                                  item.reservationNumber,
                                  { action: 'complete' },
                                  `Réservation ${item.reservationNumber} marquée terminée.`
                                )
                              }
                              disabled={busyKey === `${item.reservationNumber}:complete`}
                              title="Marquer séjour terminé"
                              className="p-1.5 rounded bg-sky-500/20 hover:bg-sky-500/35 text-sky-300 border-0 cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {item.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelTarget(item);
                                setCancelReason('');
                              }}
                              title="Annuler (avec motif)"
                              className="p-1.5 rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border-0 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <a
                            href={`/api/admin/reservations/${encodeURIComponent(
                              item.reservationNumber
                            )}/pdf/`}
                            title="Exporter PDF"
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 inline-flex items-center"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            disabled={!canSendOfficial || busyKey === `${item.reservationNumber}:email`}
                            onClick={() => handleSendPdfOrWhatsApp(item, 'email')}
                            title={
                              canSendOfficial
                                ? 'Envoyer PDF officiel par e-mail au client'
                                : 'Validez la réservation avant envoi officiel par e-mail'
                            }
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-blue-300 border-0 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={
                              !canSendOfficial || busyKey === `${item.reservationNumber}:whatsapp`
                            }
                            onClick={() => handleSendPdfOrWhatsApp(item, 'whatsapp')}
                            title={
                              canSendOfficial
                                ? 'Envoyer confirmation via WhatsApp Cloud API'
                                : 'Validez la réservation avant envoi WhatsApp'
                            }
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-emerald-300 border-0 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Supprimer"
                            className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            {totalCount} réservation(s) · Page {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border-0 cursor-pointer"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border-0 cursor-pointer"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Recent Audit Log Preview */}
      {auditLogs.length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Journal d&apos;activité récent</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs">
            {auditLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex flex-wrap justify-between gap-2 py-1.5 px-2.5 rounded bg-slate-950/60 border border-slate-800/60"
              >
                <div>
                  <span className="font-semibold text-amber-400">{log.reservationNumber}</span>{' '}
                  <span className="text-slate-300">— {log.details || log.action}</span>
                </div>
                <div className="text-slate-500">
                  {log.actorEmail} · {formatDateTimeFr(log.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white m-0">
                  Réservation {selectedReservation.reservationNumber}
                </h3>
                <p className="text-xs text-slate-400 m-0">
                  Créée le {formatDateTimeFr(selectedReservation.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-1.5">
                  <div className="text-amber-400 font-semibold uppercase text-[11px]">
                    Coordonnées client
                  </div>
                  <div className="text-white font-semibold">{selectedReservation.customer?.name}</div>
                  <div className="text-slate-300">{selectedReservation.customer?.email}</div>
                  <div className="text-slate-300">
                    {selectedReservation.customer?.phone}{' '}
                    {selectedReservation.customer?.whatsapp ? '(WhatsApp)' : ''}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-1.5">
                  <div className="text-amber-400 font-semibold uppercase text-[11px]">
                    Séjour &amp; Statuts
                  </div>
                  <div className="text-slate-200">
                    Arrivée : {formatDateTimeFr(selectedReservation.arrival)}
                  </div>
                  <div className="text-slate-200">
                    Départ : {formatDateTimeFr(selectedReservation.departure)}
                  </div>
                  <div className="text-white font-semibold">
                    Total : {formatXof(selectedReservation.total)} ({selectedReservation.nights} nuit(s))
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-slate-400">Paiement :</span>
                    <select
                      aria-label="Statut de paiement"
                      value={selectedReservation.paymentStatus || 'unpaid'}
                      onChange={(e) =>
                        handlePatchAction(
                          selectedReservation.reservationNumber,
                          {
                            action: 'updatePayment',
                            paymentStatus: e.target.value as PaymentStatus,
                          },
                          'Statut de paiement mis à jour.'
                        )
                      }
                      className="rounded bg-slate-900 border border-slate-700 text-slate-100 px-2 py-1 text-xs"
                    >
                      <option value="unpaid">Non réglée</option>
                      <option value="partial">Acompte réglé</option>
                      <option value="paid">Réglée</option>
                    </select>
                  </div>
                </div>
              </div>

              {selectedReservation.cancellationReason && (
                <div className="rounded-xl bg-red-950/50 border border-red-500/30 p-3 text-red-200">
                  <strong>Motif d&apos;annulation :</strong> {selectedReservation.cancellationReason}
                </div>
              )}

              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-2">
                <div className="text-amber-400 font-semibold uppercase text-[11px]">
                  Chambres &amp; Extras
                </div>
                <div className="text-slate-200">{summarizeAccommodation(selectedReservation)}</div>
                {Array.isArray(selectedReservation.extras) &&
                selectedReservation.extras.length > 0 ? (
                  <ul className="m-0 pl-4 text-slate-300 space-y-0.5">
                    {selectedReservation.extras.map((ex, i) => (
                      <li key={i}>
                        {ex.name} —{' '}
                        {ex.unitPrice === 0 && !ex.paidOnSite
                          ? 'Inclus suite'
                          : `${ex.qty} pers. (sur place)`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-500">Aucun extra sélectionné.</div>
                )}
              </div>

              {/* Notifications status */}
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-2">
                <div className="text-amber-400 font-semibold uppercase text-[11px]">
                  Suivi des notifications
                </div>
                <div className="text-slate-300">
                  E-mail :{' '}
                  {selectedReservation.emailReceipt?.userSent
                    ? `Client envoyé (${selectedReservation.emailReceipt.mode})`
                    : 'Non envoyé / inconnu'}{' '}
                  ·{' '}
                  {selectedReservation.emailReceipt?.adminSent
                    ? `Responsable notifié (${selectedReservation.emailReceipt.adminEmail})`
                    : 'Responsable non notifié'}
                </div>
                <div className="text-slate-300">
                  WhatsApp responsable :{' '}
                  {selectedReservation.whatsappNotification?.sent
                    ? `Confirmé (${selectedReservation.whatsappNotification.messageId})`
                    : `Non envoyé — ${selectedReservation.whatsappNotification?.error || 'Non configuré'}`}
                </div>
              </div>

              {/* Audit logs */}
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-2">
                <div className="text-amber-400 font-semibold uppercase text-[11px]">
                  Historique d&apos;audit
                </div>
                {detailLoading ? (
                  <div className="text-slate-400">Chargement de l&apos;historique...</div>
                ) : selectedAuditLogs.length === 0 ? (
                  <div className="text-slate-500">Aucune trace enregistrée.</div>
                ) : (
                  <div className="space-y-1">
                    {selectedAuditLogs.map((log) => (
                      <div key={log.id} className="text-slate-300 flex justify-between gap-2">
                        <span>{log.details || log.action}</span>
                        <span className="text-slate-500 shrink-0">
                          {log.actorEmail} · {formatDateTimeFr(log.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 flex flex-wrap justify-between gap-2 bg-slate-950/40">
              <div className="flex flex-wrap gap-2">
                {selectedReservation.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePatchAction(
                        selectedReservation.reservationNumber,
                        { action: 'validate' },
                        `Réservation ${selectedReservation.reservationNumber} validée.`
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold border-0 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valider
                  </button>
                )}
                <a
                  href={`/api/admin/reservations/${encodeURIComponent(
                    selectedReservation.reservationNumber
                  )}/pdf/`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 text-xs font-semibold no-underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Exporter PDF
                </a>
                {(selectedReservation.status === 'confirmed' ||
                  selectedReservation.status === 'completed') && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSendPdfOrWhatsApp(selectedReservation, 'email')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 px-3 py-1.5 text-xs font-medium border-0 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Envoyer PDF par e-mail
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendPdfOrWhatsApp(selectedReservation, 'whatsapp')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 px-3 py-1.5 text-xs font-medium border-0 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Envoyer par WhatsApp
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs border-0 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white m-0">
              Annuler la réservation {cancelTarget.reservationNumber} ?
            </h3>
            <p className="text-xs text-slate-300 m-0">
              Client : <strong>{cancelTarget.customer?.name}</strong>. Veuillez saisir un motif
              explicite d&apos;annulation (obligatoire).
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex : Annulation demandée par téléphone par le client..."
              className={inputClass}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs border-0 cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                disabled={
                  cancelReason.trim().length < 3 ||
                  busyKey === `${cancelTarget.reservationNumber}:cancel`
                }
                onClick={async () => {
                  const ok = await handlePatchAction(
                    cancelTarget.reservationNumber,
                    { action: 'cancel', cancellationReason: cancelReason.trim() },
                    `Réservation ${cancelTarget.reservationNumber} annulée.`
                  );
                  if (ok) setCancelTarget(null);
                }}
                className="rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold px-3.5 py-2 text-xs border-0 cursor-pointer"
              >
                Confirmer l&apos;annulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white m-0">
              Supprimer définitivement {deleteTarget.reservationNumber} ?
            </h3>
            <p className="text-xs text-slate-300 m-0">
              Cette action est irréversible et retirera la réservation de{' '}
              <strong>{deleteTarget.customer?.name}</strong> du registre. Une trace d&apos;audit sera
              conservée.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs border-0 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={busyKey === `${deleteTarget.reservationNumber}:delete`}
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold px-3.5 py-2 text-xs border-0 cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
