'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Image as ImageIcon,
  FileText,
  BedDouble,
  Utensils,
  Compass,
  MessageSquareQuote,
  Newspaper,
  Tag,
  HelpCircle,
  Phone,
  PanelBottom,
  Sparkles,
  Camera,
  Save,
  RotateCcw,
  LogOut,
  ExternalLink,
  Upload,
  FolderOpen,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Menu,
  Mail,
  CalendarCheck,
} from 'lucide-react';
import type { AdminSession } from '@/app/lib/adminAuth';
import type { SiteContent, SliderItem } from '@/app/lib/siteContent';
import EmailTemplatesEditor from './EmailTemplatesEditor';
import ReservationsManager from './ReservationsManager';
import type {
  BlogPost,
  ContactInfoItem,
  ExploreItem,
  FAQ,
  Feature,
  InstagramItem,
  Pricing,
  Room,
  Service,
  Testimonial,
} from '@/app/types/hotelData';

interface AdminDashboardProps {
  initialContent: SiteContent;
  admin: AdminSession;
}

type SectionKey =
  | 'header'
  | 'slider'
  | 'about'
  | 'features'
  | 'services'
  | 'rooms'
  | 'suites'
  | 'presentationRooms'
  | 'gallery'
  | 'instagram'
  | 'foods'
  | 'destinations'
  | 'testimonials'
  | 'posts'
  | 'pricings'
  | 'faqs'
  | 'contact'
  | 'footer'
  | 'emailTemplates'
  | 'reservations';

interface NavGroup {
  label: string;
  items: { key: SectionKey; title: string; icon: React.ReactNode }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Réservations & Clients',
    items: [
      { key: 'reservations', title: 'Gestion des réservations', icon: <CalendarCheck className="w-4 h-4" /> },
      { key: 'emailTemplates', title: "Modèles d'e-mails", icon: <Mail className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Identité & Accueil',
    items: [
      { key: 'header', title: 'En-tête & Logos', icon: <LayoutDashboard className="w-4 h-4" /> },
      { key: 'slider', title: 'Bannière Slider', icon: <ImageIcon className="w-4 h-4" /> },
      { key: 'about', title: 'À propos', icon: <FileText className="w-4 h-4" /> },
      { key: 'features', title: 'Équipements', icon: <Sparkles className="w-4 h-4" /> },
      { key: 'services', title: 'Services', icon: <Sparkles className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Hébergement',
    items: [
      { key: 'rooms', title: 'Chambres', icon: <BedDouble className="w-4 h-4" /> },
      { key: 'suites', title: 'Suites', icon: <BedDouble className="w-4 h-4" /> },
      { key: 'presentationRooms', title: 'Chambres Confort', icon: <BedDouble className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Médias & Découverte',
    items: [
      { key: 'gallery', title: 'Galerie Photos', icon: <Camera className="w-4 h-4" /> },
      { key: 'instagram', title: 'Feed Instagram', icon: <Camera className="w-4 h-4" /> },
      { key: 'foods', title: 'Plats Traditionnels', icon: <Utensils className="w-4 h-4" /> },
      { key: 'destinations', title: 'Destinations', icon: <Compass className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Contenu & Infos',
    items: [
      { key: 'testimonials', title: 'Témoignages', icon: <MessageSquareQuote className="w-4 h-4" /> },
      { key: 'posts', title: 'Articles Blog', icon: <Newspaper className="w-4 h-4" /> },
      { key: 'pricings', title: 'Grille Tarifaire', icon: <Tag className="w-4 h-4" /> },
      { key: 'faqs', title: 'Foire aux questions', icon: <HelpCircle className="w-4 h-4" /> },
      { key: 'contact', title: 'Page Contact', icon: <Phone className="w-4 h-4" /> },
      { key: 'footer', title: 'Pied de page', icon: <PanelBottom className="w-4 h-4" /> },
    ],
  },
];

const inputClass =
  'w-full rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:border-amber-500';
const labelClass = 'block text-xs font-medium text-slate-300 mb-1';
const cardClass = 'rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4';

function moveArrayItem<T>(arr: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);
  return copy;
}

function createEmptyRoom(index: number): Room {
  return {
    name: `Nouvelle chambre ${index + 1}`,
    slug: `nouvelle-chambre-${Date.now()}`,
    title: `Nouvelle chambre ${index + 1}`,
    subtitle: 'Confort & Sérénité à Sendou',
    type: 'Standard',
    guests: 2,
    size: '28 m²',
    price: '35000',
    default_curency: { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', rateToEUR: 655.957 },
    description: 'Description détaillée de la chambre.',
    basicInfo: [],
    details: [],
    facilities: [],
    images: ['/assets/images/rooms/room-1.jpg'],
    image: '/assets/images/rooms/room-1.jpg',
    link: '/booking',
  };
}

function createEmptyExploreItem(type: string, index: number): ExploreItem {
  return {
    name: `${type} ${index + 1}`,
    slug: `${type.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    title: `${type} ${index + 1}`,
    subtitle: 'Découverte locale',
    type,
    location: 'Sendou, Dakar',
    size: '1 jour',
    description: 'Description détaillée.',
    rating: 4.8,
    reviews: 12,
    tag: 'Populaire',
    price: '15000',
    default_curency: { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', rateToEUR: 655.957 },
    features: [],
    basicInfo: [],
    details: [],
    facilities: [],
    images: ['/assets/images/blog/lac-rose.jpg'],
    image: '/assets/images/blog/lac-rose.jpg',
    link: '/contact',
  };
}

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onOpenPicker: (cb: (url: string) => void) => void;
  onNotify: (type: 'success' | 'error', msg: string) => void;
}

function ImageField({ label, value, onChange, onOpenPicker, onNotify }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload/', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        onNotify('error', data?.error || "Échec de l'envoi de l'image.");
      } else {
        onChange(data.url);
        onNotify('success', 'Image téléversée avec succès.');
      }
    } catch {
      onNotify('error', "Erreur réseau pendant l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="w-20 h-14 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-600" />
          )}
        </div>
        <div className="flex-1 w-full space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/assets/images/..."
            className={inputClass}
          />
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{uploading ? 'Envoi...' : 'Importer'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => onOpenPicker(onChange)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border-0 cursor-pointer transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Médiathèque</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ initialContent, admin }: AdminDashboardProps) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [activeSection, setActiveSection] = useState<SectionKey>('slider');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Media picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerImages, setPickerImages] = useState<string[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCallback, setPickerCallback] = useState<((url: string) => void) | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const updateContent = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const openMediaPicker = async (cb: (url: string) => void) => {
    setPickerCallback(() => cb);
    setPickerOpen(true);
    setPickerSearch('');
    setPickerLoading(true);
    try {
      const res = await fetch('/api/admin/assets/', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.images)) {
        setPickerImages(data.images);
      } else {
        notify('error', data?.error || 'Impossible de charger la médiathèque.');
      }
    } catch {
      notify('error', 'Erreur réseau lors du chargement des images.');
    } finally {
      setPickerLoading(false);
    }
  };

  const filteredImages = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return pickerImages;
    return pickerImages.filter((img) => img.toLowerCase().includes(q));
  }, [pickerImages, pickerSearch]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content/', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) {
        notify('error', data?.error || 'Échec de la sauvegarde.');
      } else {
        if (data?.content) {
          setContent(data.content);
        }
        setDirty(false);
        notify('success', 'Modifications enregistrées et publiées sur le site.');
        router.refresh();
      }
    } catch {
      notify('error', 'Erreur réseau lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/admin/content/', {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        notify('error', data?.error || 'Impossible de réinitialiser.');
      } else {
        if (data?.content) setContent(data.content);
        setDirty(false);
        setShowResetConfirm(false);
        notify('success', 'Contenu restauré aux valeurs par défaut.');
        router.refresh();
      }
    } catch {
      notify('error', 'Erreur réseau lors de la réinitialisation.');
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout/', { method: 'POST', credentials: 'include' });
    } finally {
      window.location.assign('/lepays-dsb/login/');
    }
  };

  const renderRoomsEditor = (
    key: 'rooms' | 'suites' | 'presentationRooms',
    heading: string
  ) => {
    const list = content[key];
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white m-0">{heading}</h2>
            <p className="text-xs text-slate-400 m-0">
              Modifiez les titres, prix, descriptions et photos ({list.length} éléments).
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateContent(key, [...list, createEmptyRoom(list.length)])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        {list.map((room, idx) => (
          <div key={`${room.slug}-${idx}`} className={cardClass}>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-amber-400">
                #{idx + 1} — {room.title || room.name}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateContent(key, moveArrayItem(list, idx, -1))}
                  disabled={idx === 0}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border-0 cursor-pointer"
                  aria-label="Monter"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateContent(key, moveArrayItem(list, idx, 1))}
                  disabled={idx === list.length - 1}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border-0 cursor-pointer"
                  aria-label="Descendre"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateContent(
                      key,
                      list.filter((_, i) => i !== idx)
                    )
                  }
                  className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom</label>
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...room, name: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Titre affiché</label>
                <input
                  type="text"
                  value={room.title}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...room, title: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sous-titre</label>
                <input
                  type="text"
                  value={room.subtitle}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...room, subtitle: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Slug (URL)</label>
                <input
                  type="text"
                  value={room.slug}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...room, slug: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <input
                  type="text"
                  value={room.type}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...room, type: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Prix</label>
                  <input
                    type="text"
                    value={room.price}
                    onChange={(e) => {
                      const next = [...list];
                      next[idx] = { ...room, price: e.target.value };
                      updateContent(key, next);
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Surface</label>
                  <input
                    type="text"
                    value={room.size}
                    onChange={(e) => {
                      const next = [...list];
                      next[idx] = { ...room, size: e.target.value };
                      updateContent(key, next);
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Pers.</label>
                  <input
                    type="number"
                    min={1}
                    value={room.guests}
                    onChange={(e) => {
                      const next = [...list];
                      next[idx] = { ...room, guests: Number(e.target.value) || 1 };
                      updateContent(key, next);
                    }}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Lien CTA</label>
                <input
                  type="text"
                  value={room.link}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...room, link: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                value={room.description}
                onChange={(e) => {
                  const next = [...list];
                  next[idx] = { ...room, description: e.target.value };
                  updateContent(key, next);
                }}
                className={inputClass}
              />
            </div>

            <ImageField
              label="Image principale"
              value={room.image}
              onChange={(url) => {
                const next = [...list];
                next[idx] = { ...room, image: url };
                updateContent(key, next);
              }}
              onOpenPicker={openMediaPicker}
              onNotify={notify}
            />

            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  Galerie d&apos;images ({room.images.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = [...list];
                    next[idx] = {
                      ...room,
                      images: [...room.images, room.image || '/assets/images/rooms/room-1.jpg'],
                    };
                    updateContent(key, next);
                  }}
                  className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 text-xs border-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une photo</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {room.images.map((imgUrl, imgIdx) => (
                  <div key={imgIdx} className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Photo #{imgIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...list];
                          next[idx] = {
                            ...room,
                            images: room.images.filter((_, j) => j !== imgIdx),
                          };
                          updateContent(key, next);
                        }}
                        className="text-xs text-red-400 hover:text-red-300 bg-transparent border-0 cursor-pointer"
                      >
                        Retirer
                      </button>
                    </div>
                    <ImageField
                      label="URL photo"
                      value={imgUrl}
                      onChange={(url) => {
                        const next = [...list];
                        const imgs = [...room.images];
                        imgs[imgIdx] = url;
                        next[idx] = { ...room, images: imgs };
                        updateContent(key, next);
                      }}
                      onOpenPicker={openMediaPicker}
                      onNotify={notify}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderExploreEditor = (
    key: 'foods' | 'destinations',
    heading: string,
    defaultType: string
  ) => {
    const list = content[key];
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white m-0">{heading}</h2>
            <p className="text-xs text-slate-400 m-0">{list.length} éléments configurés.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateContent(key, [...list, createEmptyExploreItem(defaultType, list.length)])
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        {list.map((item, idx) => (
          <div key={`${item.slug}-${idx}`} className={cardClass}>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-amber-400">
                #{idx + 1} — {item.name || item.title}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateContent(key, moveArrayItem(list, idx, -1))}
                  disabled={idx === 0}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border-0 cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateContent(key, moveArrayItem(list, idx, 1))}
                  disabled={idx === list.length - 1}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border-0 cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateContent(
                      key,
                      list.filter((_, i) => i !== idx)
                    )
                  }
                  className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...item, name: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Titre</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...item, title: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sous-titre</label>
                <input
                  type="text"
                  value={item.subtitle}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...item, subtitle: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Badge / Tag</label>
                <input
                  type="text"
                  value={item.tag || ''}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...item, tag: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Localisation / Origine</label>
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) => {
                    const next = [...list];
                    next[idx] = { ...item, location: e.target.value };
                    updateContent(key, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Prix</label>
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) => {
                      const next = [...list];
                      next[idx] = { ...item, price: e.target.value };
                      updateContent(key, next);
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Lien</label>
                  <input
                    type="text"
                    value={item.link}
                    onChange={(e) => {
                      const next = [...list];
                      next[idx] = { ...item, link: e.target.value };
                      updateContent(key, next);
                    }}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                value={item.description}
                onChange={(e) => {
                  const next = [...list];
                  next[idx] = { ...item, description: e.target.value };
                  updateContent(key, next);
                }}
                className={inputClass}
              />
            </div>

            <ImageField
              label="Image principale"
              value={item.image}
              onChange={(url) => {
                const next = [...list];
                next[idx] = { ...item, image: url, images: item.images?.length ? item.images : [url] };
                updateContent(key, next);
              }}
              onOpenPicker={openMediaPicker}
              onNotify={notify}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'header':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white m-0">En-tête, Logos & Navigation</h2>
            <div className={cardClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageField
                  label="Logo principal"
                  value={content.header.logo}
                  onChange={(url) => updateContent('header', { ...content.header, logo: url })}
                  onOpenPicker={openMediaPicker}
                  onNotify={notify}
                />
                <ImageField
                  label="Logo sticky (défilement)"
                  value={content.header.logoSticky}
                  onChange={(url) => updateContent('header', { ...content.header, logoSticky: url })}
                  onOpenPicker={openMediaPicker}
                  onNotify={notify}
                />
                <ImageField
                  label="Logo mobile"
                  value={content.header.logoMobile}
                  onChange={(url) => updateContent('header', { ...content.header, logoMobile: url })}
                  onOpenPicker={openMediaPicker}
                  onNotify={notify}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <label className={labelClass}>Texte du bouton CTA</label>
                  <input
                    type="text"
                    value={content.header.button.text}
                    onChange={(e) =>
                      updateContent('header', {
                        ...content.header,
                        button: { ...content.header.button, text: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Lien du bouton CTA</label>
                  <input
                    type="text"
                    value={content.header.button.link}
                    onChange={(e) =>
                      updateContent('header', {
                        ...content.header,
                        button: { ...content.header.button, link: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white m-0">Liens du menu principal</h3>
                <button
                  type="button"
                  onClick={() =>
                    updateContent('header', {
                      ...content.header,
                      menu: [...content.header.menu, { title: 'Nouveau lien', link: '/' }],
                    })
                  }
                  className="inline-flex items-center gap-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-2.5 py-1.5 text-xs border-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>
              <div className="space-y-3">
                {content.header.menu.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const menu = [...content.header.menu];
                          menu[idx] = { ...item, title: e.target.value };
                          updateContent('header', { ...content.header, menu });
                        }}
                        placeholder="Libellé"
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        value={item.link}
                        onChange={(e) => {
                          const menu = [...content.header.menu];
                          menu[idx] = { ...item, link: e.target.value };
                          updateContent('header', { ...content.header, menu });
                        }}
                        placeholder="/lien"
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          updateContent('header', {
                            ...content.header,
                            menu: content.header.menu.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-2 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white m-0">Bannière Slider (Accueil)</h2>
                <p className="text-xs text-slate-400 m-0">
                  Diapositives principales affichées en haut de la page d&apos;accueil.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateContent('slider', [
                    ...content.slider,
                    {
                      title: 'Nouvelle diapositive',
                      description: 'Votre texte de présentation.',
                      image: '/assets/images/banner/banner-bg1.webp',
                      buttonText: 'Découvrir',
                      buttonLink: '/booking',
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une slide</span>
              </button>
            </div>

            {content.slider.map((slide: SliderItem, idx: number) => (
              <div key={idx} className={cardClass}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-sm font-semibold text-amber-400">Slide #{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateContent('slider', moveArrayItem(content.slider, idx, -1))}
                      disabled={idx === 0}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border-0 cursor-pointer"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateContent('slider', moveArrayItem(content.slider, idx, 1))}
                      disabled={idx === content.slider.length - 1}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border-0 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateContent(
                          'slider',
                          content.slider.filter((_, i) => i !== idx)
                        )
                      }
                      className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Titre</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => {
                        const next = [...content.slider];
                        next[idx] = { ...slide, title: e.target.value };
                        updateContent('slider', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea
                      rows={2}
                      value={slide.description}
                      onChange={(e) => {
                        const next = [...content.slider];
                        next[idx] = { ...slide, description: e.target.value };
                        updateContent('slider', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Texte du bouton</label>
                    <input
                      type="text"
                      value={slide.buttonText}
                      onChange={(e) => {
                        const next = [...content.slider];
                        next[idx] = { ...slide, buttonText: e.target.value };
                        updateContent('slider', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Lien du bouton</label>
                    <input
                      type="text"
                      value={slide.buttonLink}
                      onChange={(e) => {
                        const next = [...content.slider];
                        next[idx] = { ...slide, buttonLink: e.target.value };
                        updateContent('slider', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Lien vidéo (optionnel)</label>
                    <input
                      type="text"
                      value={slide.videoLink || ''}
                      onChange={(e) => {
                        const next = [...content.slider];
                        next[idx] = { ...slide, videoLink: e.target.value };
                        updateContent('slider', next);
                      }}
                      placeholder="https://youtube.com/..."
                      className={inputClass}
                    />
                  </div>
                </div>

                <ImageField
                  label="Image d'arrière-plan"
                  value={slide.image}
                  onChange={(url) => {
                    const next = [...content.slider];
                    next[idx] = { ...slide, image: url };
                    updateContent('slider', next);
                  }}
                  onOpenPicker={openMediaPicker}
                  onNotify={notify}
                />
              </div>
            ))}
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white m-0">Section À propos</h2>
            <div className={cardClass}>
              <div>
                <label className={labelClass}>Titre principal</label>
                <input
                  type="text"
                  value={content.about.title || ''}
                  onChange={(e) => updateContent('about', { ...content.about, title: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description courte (Accueil)</label>
                <textarea
                  rows={4}
                  value={content.about.description || ''}
                  onChange={(e) =>
                    updateContent('about', { ...content.about, description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Contenu détaillé HTML (Page À propos)</label>
                <textarea
                  rows={7}
                  value={content.about.html_description || ''}
                  onChange={(e) =>
                    updateContent('about', { ...content.about, html_description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Texte du bouton</label>
                  <input
                    type="text"
                    value={content.about.buttonText || ''}
                    onChange={(e) =>
                      updateContent('about', { ...content.about, buttonText: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Lien du bouton</label>
                  <input
                    type="text"
                    value={content.about.buttonLink || ''}
                    onChange={(e) =>
                      updateContent('about', { ...content.about, buttonLink: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Points forts (liste à puces)</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContent('about', {
                        ...content.about,
                        features: [...(content.about.features || []), 'Nouvel atout'],
                      })
                    }
                    className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 text-xs border-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>
                {(content.about.features || []).map((feat, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const feats = [...(content.about.features || [])];
                        feats[idx] = e.target.value;
                        updateContent('about', { ...content.about, features: feats });
                      }}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateContent('about', {
                          ...content.about,
                          features: (content.about.features || []).filter((_, i) => i !== idx),
                        })
                      }
                      className="p-2 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Images À propos (3 emplacements)</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContent('about', {
                        ...content.about,
                        images: [
                          ...(content.about.images || []),
                          '/assets/images/about/about-hotel.jpg',
                        ],
                      })
                    }
                    className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 text-xs border-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>
                {(content.about.images || []).map((imgUrl, idx) => (
                  <div key={idx} className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Image #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateContent('about', {
                            ...content.about,
                            images: (content.about.images || []).filter((_, i) => i !== idx),
                          })
                        }
                        className="text-xs text-red-400 hover:text-red-300 bg-transparent border-0 cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                    <ImageField
                      label={`Photo #${idx + 1}`}
                      value={imgUrl}
                      onChange={(url) => {
                        const imgs = [...(content.about.images || [])];
                        imgs[idx] = url;
                        updateContent('about', { ...content.about, images: imgs });
                      }}
                      onOpenPicker={openMediaPicker}
                      onNotify={notify}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white m-0">Équipements & Atouts</h2>
              <button
                type="button"
                onClick={() =>
                  updateContent('features', [
                    ...content.features,
                    {
                      title: 'Nouvel équipement',
                      description: 'Description courte.',
                      image: '/assets/images/feature/feature-thumb1.jpg',
                      img_bg: '/assets/images/feature/feature-thumb1.jpg',
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
            {content.features.map((feat: Feature, idx: number) => (
              <div key={idx} className={cardClass}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-sm font-semibold text-amber-400">{feat.title}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContent(
                        'features',
                        content.features.filter((_, i) => i !== idx)
                      )
                    }
                    className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className={labelClass}>Titre</label>
                  <input
                    type="text"
                    value={feat.title}
                    onChange={(e) => {
                      const next = [...content.features];
                      next[idx] = { ...feat, title: e.target.value };
                      updateContent('features', next);
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows={2}
                    value={feat.description}
                    onChange={(e) => {
                      const next = [...content.features];
                      next[idx] = { ...feat, description: e.target.value };
                      updateContent('features', next);
                    }}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageField
                    label="Image carte"
                    value={feat.image}
                    onChange={(url) => {
                      const next = [...content.features];
                      next[idx] = { ...feat, image: url };
                      updateContent('features', next);
                    }}
                    onOpenPicker={openMediaPicker}
                    onNotify={notify}
                  />
                  <ImageField
                    label="Image page Services"
                    value={feat.img_bg}
                    onChange={(url) => {
                      const next = [...content.features];
                      next[idx] = { ...feat, img_bg: url };
                      updateContent('features', next);
                    }}
                    onOpenPicker={openMediaPicker}
                    onNotify={notify}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'services':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white m-0">Services de l&apos;Hôtel</h2>
              <button
                type="button"
                onClick={() =>
                  updateContent('services', [
                    ...content.services,
                    {
                      title: 'Nouveau service',
                      description: 'Description du service.',
                      iconClass: 'flaticon-hotel',
                      image: '/assets/images/resource/service-island1-1.jpg',
                      link: '/services',
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
            {content.services.map((srv: Service, idx: number) => (
              <div key={idx} className={cardClass}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-sm font-semibold text-amber-400">{srv.title}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContent(
                        'services',
                        content.services.filter((_, i) => i !== idx)
                      )
                    }
                    className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Titre</label>
                    <input
                      type="text"
                      value={srv.title}
                      onChange={(e) => {
                        const next = [...content.services];
                        next[idx] = { ...srv, title: e.target.value };
                        updateContent('services', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Classe icône</label>
                    <input
                      type="text"
                      value={srv.iconClass || ''}
                      onChange={(e) => {
                        const next = [...content.services];
                        next[idx] = { ...srv, iconClass: e.target.value };
                        updateContent('services', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Lien</label>
                    <input
                      type="text"
                      value={srv.link || ''}
                      onChange={(e) => {
                        const next = [...content.services];
                        next[idx] = { ...srv, link: e.target.value };
                        updateContent('services', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows={2}
                    value={srv.description || ''}
                    onChange={(e) => {
                      const next = [...content.services];
                      next[idx] = { ...srv, description: e.target.value };
                      updateContent('services', next);
                    }}
                    className={inputClass}
                  />
                </div>
                <ImageField
                  label="Image de fond"
                  value={srv.image || ''}
                  onChange={(url) => {
                    const next = [...content.services];
                    next[idx] = { ...srv, image: url };
                    updateContent('services', next);
                  }}
                  onOpenPicker={openMediaPicker}
                  onNotify={notify}
                />
              </div>
            ))}
          </div>
        );

      case 'rooms':
        return renderRoomsEditor('rooms', 'Chambres Standard & Classiques');

      case 'suites':
        return renderRoomsEditor('suites', 'Suites & Chambres Premium');

      case 'presentationRooms':
        return renderRoomsEditor('presentationRooms', 'Chambres Confort (Carrousel Accueil)');

      case 'gallery':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white m-0">Galerie Photos</h2>
              <button
                type="button"
                onClick={() =>
                  updateContent('gallery', [
                    ...content.gallery,
                    '/assets/images/gallery/gallery1.jpg',
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une photo</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.gallery.map((imgUrl, idx) => (
                <div key={idx} className={cardClass}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400">
                      {idx === content.gallery.length - 1
                        ? `Photo #${idx + 1} (Principale centrale)`
                        : `Photo #${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateContent(
                          'gallery',
                          content.gallery.filter((_, i) => i !== idx)
                        )
                      }
                      className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <ImageField
                    label="Image"
                    value={imgUrl}
                    onChange={(url) => {
                      const next = [...content.gallery];
                      next[idx] = url;
                      updateContent('gallery', next);
                    }}
                    onOpenPicker={openMediaPicker}
                    onNotify={notify}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'instagram':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white m-0">Feed Instagram</h2>
              <button
                type="button"
                onClick={() =>
                  updateContent('instagram', [
                    ...content.instagram,
                    { image: '/assets/images/instagram/insta1.jpg', link: 'https://instagram.com' },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.instagram.map((item: InstagramItem, idx: number) => (
                <div key={idx} className={cardClass}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400">Post #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateContent(
                          'instagram',
                          content.instagram.filter((_, i) => i !== idx)
                        )
                      }
                      className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <ImageField
                    label="Image Instagram"
                    value={item.image}
                    onChange={(url) => {
                      const next = [...content.instagram];
                      next[idx] = { ...item, image: url };
                      updateContent('instagram', next);
                    }}
                    onOpenPicker={openMediaPicker}
                    onNotify={notify}
                  />
                  <div>
                    <label className={labelClass}>Lien du post</label>
                    <input
                      type="text"
                      value={item.link || ''}
                      onChange={(e) => {
                        const next = [...content.instagram];
                        next[idx] = { ...item, link: e.target.value };
                        updateContent('instagram', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'foods':
        return renderExploreEditor('foods', 'Plats Traditionnels à Découvrir', 'Plat');

      case 'destinations':
        return renderExploreEditor('destinations', 'Destinations & Excursions', 'Excursion');

      case 'testimonials':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white m-0">Avis & Témoignages Clients</h2>
              <button
                type="button"
                onClick={() =>
                  updateContent('testimonials', [
                    ...content.testimonials,
                    {
                      name: 'Nouveau client',
                      role: 'Voyageur',
                      image: '/assets/images/testimonial/testi1.jpg',
                      thumb: '/assets/images/testimonial/testi1.jpg',
                      text: 'Séjour inoubliable à Sendou.',
                      rating: 5,
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
            {content.testimonials.map((t: Testimonial, idx: number) => (
              <div key={idx} className={cardClass}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-sm font-semibold text-amber-400">{t.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContent(
                        'testimonials',
                        content.testimonials.filter((_, i) => i !== idx)
                      )
                    }
                    className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Nom</label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => {
                        const next = [...content.testimonials];
                        next[idx] = { ...t, name: e.target.value };
                        updateContent('testimonials', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Rôle / Ville</label>
                    <input
                      type="text"
                      value={t.role}
                      onChange={(e) => {
                        const next = [...content.testimonials];
                        next[idx] = { ...t, role: e.target.value };
                        updateContent('testimonials', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Note (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={t.rating}
                      onChange={(e) => {
                        const next = [...content.testimonials];
                        next[idx] = { ...t, rating: Number(e.target.value) || 5 };
                        updateContent('testimonials', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Témoignage</label>
                  <textarea
                    rows={3}
                    value={t.text}
                    onChange={(e) => {
                      const next = [...content.testimonials];
                      next[idx] = { ...t, text: e.target.value };
                      updateContent('testimonials', next);
                    }}
                    className={inputClass}
                  />
                </div>
                <ImageField
                  label="Photo du client"
                  value={t.image || t.thumb}
                  onChange={(url) => {
                    const next = [...content.testimonials];
                    next[idx] = { ...t, image: url, thumb: url };
                    updateContent('testimonials', next);
                  }}
                  onOpenPicker={openMediaPicker}
                  onNotify={notify}
                />
              </div>
            ))}
          </div>
        );

      case 'posts':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white m-0">Articles du Blog</h2>
              <button
                type="button"
                onClick={() => {
                  const slug = `article-${Date.now()}`;
                  updateContent('posts', [
                    ...content.posts,
                    {
                      title: 'Nouvel article',
                      slug,
                      date: '2026-04-01',
                      thumb: '/assets/images/blog/blog-thumb1.jpg',
                      link: `/blog-details/${slug}`,
                      excerpt: "Résumé de l'article.",
                      html_content: '<article><p>Contenu de votre article.</p></article>',
                      images: ['/assets/images/blog/blog-thumb1.jpg'],
                      comments: [],
                      tags: [],
                      comments_number: 0,
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvel article</span>
              </button>
            </div>
            {content.posts.map((post: BlogPost, idx: number) => (
              <div key={`${post.slug}-${idx}`} className={cardClass}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-sm font-semibold text-amber-400">{post.title}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContent(
                        'posts',
                        content.posts.filter((_, i) => i !== idx)
                      )
                    }
                    className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Titre</label>
                    <input
                      type="text"
                      value={post.title}
                      onChange={(e) => {
                        const next = [...content.posts];
                        next[idx] = { ...post, title: e.target.value };
                        updateContent('posts', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input
                      type="text"
                      value={post.date}
                      onChange={(e) => {
                        const next = [...content.posts];
                        next[idx] = { ...post, date: e.target.value };
                        updateContent('posts', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Slug</label>
                    <input
                      type="text"
                      value={post.slug}
                      onChange={(e) => {
                        const next = [...content.posts];
                        next[idx] = {
                          ...post,
                          slug: e.target.value,
                          link: `/blog-details/${e.target.value}`,
                        };
                        updateContent('posts', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Lien</label>
                    <input
                      type="text"
                      value={post.link}
                      onChange={(e) => {
                        const next = [...content.posts];
                        next[idx] = { ...post, link: e.target.value };
                        updateContent('posts', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Extrait</label>
                  <textarea
                    rows={2}
                    value={post.excerpt}
                    onChange={(e) => {
                      const next = [...content.posts];
                      next[idx] = { ...post, excerpt: e.target.value };
                      updateContent('posts', next);
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Contenu HTML</label>
                  <textarea
                    rows={6}
                    value={post.html_content}
                    onChange={(e) => {
                      const next = [...content.posts];
                      next[idx] = { ...post, html_content: e.target.value };
                      updateContent('posts', next);
                    }}
                    className={inputClass}
                  />
                </div>
                <ImageField
                  label="Image de couverture"
                  value={post.thumb}
                  onChange={(url) => {
                    const next = [...content.posts];
                    next[idx] = { ...post, thumb: url };
                    updateContent('posts', next);
                  }}
                  onOpenPicker={openMediaPicker}
                  onNotify={notify}
                />
              </div>
            ))}
          </div>
        );

      case 'pricings':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white m-0">Grille Tarifaire</h2>
              <button
                type="button"
                onClick={() =>
                  updateContent('pricings', [
                    ...content.pricings,
                    {
                      title: 'Nouvelle formule',
                      name: 'Nouvelle formule',
                      price: 35000,
                      currency: 'FCFA',
                      per: '/ Nuit',
                      features: ['Petit-déjeuner inclus', 'Wi-Fi haut débit'],
                      link: '/booking',
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un tarif</span>
              </button>
            </div>
            {content.pricings.map((p: Pricing, idx: number) => (
              <div key={idx} className={cardClass}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-sm font-semibold text-amber-400">{p.title}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContent(
                        'pricings',
                        content.pricings.filter((_, i) => i !== idx)
                      )
                    }
                    className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Titre</label>
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => {
                        const next = [...content.pricings];
                        next[idx] = { ...p, title: e.target.value, name: e.target.value };
                        updateContent('pricings', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Prix</label>
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => {
                        const next = [...content.pricings];
                        next[idx] = { ...p, price: Number(e.target.value) || 0 };
                        updateContent('pricings', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Devise</label>
                    <input
                      type="text"
                      value={p.currency || ''}
                      onChange={(e) => {
                        const next = [...content.pricings];
                        next[idx] = { ...p, currency: e.target.value };
                        updateContent('pricings', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Unité (ex: / Nuit)</label>
                    <input
                      type="text"
                      value={p.per || ''}
                      onChange={(e) => {
                        const next = [...content.pricings];
                        next[idx] = { ...p, per: e.target.value };
                        updateContent('pricings', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>Lien de réservation</label>
                    <input
                      type="text"
                      value={p.link}
                      onChange={(e) => {
                        const next = [...content.pricings];
                        next[idx] = { ...p, link: e.target.value };
                        updateContent('pricings', next);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Avantages inclus (un par ligne)</label>
                  <textarea
                    rows={4}
                    value={p.features.join('\n')}
                    onChange={(e) => {
                      const next = [...content.pricings];
                      next[idx] = {
                        ...p,
                        features: e.target.value.split('\n').filter((line) => line.trim() !== ''),
                      };
                      updateContent('pricings', next);
                    }}
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'faqs':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white m-0">Foire aux questions (FAQ)</h2>
              <button
                type="button"
                onClick={() =>
                  updateContent('faqs', [
                    ...content.faqs,
                    { question: 'Nouvelle question ?', answer: 'Votre réponse.' },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une question</span>
              </button>
            </div>
            {content.faqs.map((faq: FAQ, idx: number) => (
              <div key={idx} className={cardClass}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-sm font-semibold text-amber-400">Question #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContent(
                        'faqs',
                        content.faqs.filter((_, i) => i !== idx)
                      )
                    }
                    className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className={labelClass}>Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const next = [...content.faqs];
                      next[idx] = { ...faq, question: e.target.value };
                      updateContent('faqs', next);
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Réponse</label>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => {
                      const next = [...content.faqs];
                      next[idx] = { ...faq, answer: e.target.value };
                      updateContent('faqs', next);
                    }}
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white m-0">Informations de Contact</h2>
            <div className={cardClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Titre de section</label>
                  <input
                    type="text"
                    value={content.contact.sectionTitle}
                    onChange={(e) =>
                      updateContent('contact', { ...content.contact, sectionTitle: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Sous-titre</label>
                  <input
                    type="text"
                    value={content.contact.sectionSubtitle}
                    onChange={(e) =>
                      updateContent('contact', {
                        ...content.contact,
                        sectionSubtitle: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  value={content.contact.description}
                  onChange={(e) =>
                    updateContent('contact', { ...content.contact, description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>URL Google Maps (iframe)</label>
                <input
                  type="text"
                  value={content.contact.mapSrc}
                  onChange={(e) =>
                    updateContent('contact', { ...content.contact, mapSrc: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Coordonnées affichées</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContent('contact', {
                        ...content.contact,
                        contactItems: [
                          ...content.contact.contactItems,
                          { type: 'phone', title: 'Téléphone', value: '+221 ', icon: 'fa fa-phone' },
                        ],
                      })
                    }
                    className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 text-xs border-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>
                {content.contact.contactItems.map((item: ContactInfoItem, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-slate-950/60 p-3 rounded-lg border border-slate-800"
                  >
                    <div className="md:col-span-2">
                      <select
                        value={item.type}
                        onChange={(e) => {
                          const items = [...content.contact.contactItems];
                          items[idx] = {
                            ...item,
                            type: e.target.value as ContactInfoItem['type'],
                          };
                          updateContent('contact', { ...content.contact, contactItems: items });
                        }}
                        className={inputClass}
                      >
                        <option value="phone">phone</option>
                        <option value="whatsapp">whatsapp</option>
                        <option value="email">email</option>
                        <option value="location">location</option>
                        <option value="hours">hours</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const items = [...content.contact.contactItems];
                          items[idx] = { ...item, title: e.target.value };
                          updateContent('contact', { ...content.contact, contactItems: items });
                        }}
                        placeholder="Titre"
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => {
                          const items = [...content.contact.contactItems];
                          items[idx] = { ...item, value: e.target.value };
                          updateContent('contact', { ...content.contact, contactItems: items });
                        }}
                        placeholder="Valeur"
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={item.link || ''}
                        onChange={(e) => {
                          const items = [...content.contact.contactItems];
                          items[idx] = { ...item, link: e.target.value };
                          updateContent('contact', { ...content.contact, contactItems: items });
                        }}
                        placeholder="Lien (optionnel)"
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          updateContent('contact', {
                            ...content.contact,
                            contactItems: content.contact.contactItems.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-2 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white m-0">Pied de page (Footer)</h2>
            <div className={cardClass}>
              <ImageField
                label="Logo Footer"
                value={content.footer.logo}
                onChange={(url) => updateContent('footer', { ...content.footer, logo: url })}
                onOpenPicker={openMediaPicker}
                onNotify={notify}
              />
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  value={content.footer.description}
                  onChange={(e) =>
                    updateContent('footer', { ...content.footer, description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input
                    type="text"
                    value={content.footer.contact.phone}
                    onChange={(e) =>
                      updateContent('footer', {
                        ...content.footer,
                        contact: { ...content.footer.contact, phone: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Numéro WhatsApp (sans +)</label>
                  <input
                    type="text"
                    value={content.footer.contact.whatsapp}
                    onChange={(e) =>
                      updateContent('footer', {
                        ...content.footer,
                        contact: { ...content.footer.contact, whatsapp: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="text"
                    value={content.footer.contact.email}
                    onChange={(e) =>
                      updateContent('footer', {
                        ...content.footer,
                        contact: { ...content.footer.contact, email: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Adresse</label>
                  <input
                    type="text"
                    value={content.footer.contact.address}
                    onChange={(e) =>
                      updateContent('footer', {
                        ...content.footer,
                        contact: { ...content.footer.contact, address: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Copyright</label>
                  <input
                    type="text"
                    value={content.footer.copyright}
                    onChange={(e) =>
                      updateContent('footer', { ...content.footer, copyright: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Crédit / Créé par</label>
                  <input
                    type="text"
                    value={content.footer.createdBy}
                    onChange={(e) =>
                      updateContent('footer', { ...content.footer, createdBy: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'emailTemplates':
        return (
          <EmailTemplatesEditor
            value={content.emailTemplates}
            footerContact={content.footer.contact}
            adminEmail={admin.email}
            onChange={(next) => updateContent('emailTemplates', next)}
            onNotify={notify}
          />
        );
      case 'reservations':
        return <ReservationsManager onNotify={notify} />;
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col"
      style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-200 border-0 cursor-pointer"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="text-sm font-semibold text-white">
              CMS Hôtel Le Pays <span className="text-amber-400">(/lepays-dsb)</span>
            </div>
            <div className="text-xs text-slate-400">
              Connecté : {admin.name} ({admin.email})
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dirty && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium">
              Modifications non enregistrées
            </span>
          )}
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-medium no-underline transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voir le site</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-medium border-0 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Réinitialiser</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-semibold px-3.5 py-2 text-xs border-0 cursor-pointer transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 px-3 py-2 text-xs font-medium border-0 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm">
          <div
            className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm shadow-xl border ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/95 border-red-500/40 text-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? 'block fixed inset-y-0 left-0 z-40 pt-16' : 'hidden'
          } lg:block w-64 shrink-0 bg-slate-900 border-r border-slate-800 overflow-y-auto p-4 space-y-5`}
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2 mb-2">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.key);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left border-0 cursor-pointer transition-colors ${
                        active
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Content Editor */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
          {renderActiveSection()}
        </main>
      </div>

      {/* Media Library Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-white m-0">Médiathèque du site</h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Rechercher une image par nom ou dossier..."
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {pickerLoading ? (
                <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Chargement des images...</span>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Aucune image trouvée.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredImages.map((imgUrl) => (
                    <button
                      key={imgUrl}
                      type="button"
                      onClick={() => {
                        if (pickerCallback) {
                          pickerCallback(imgUrl);
                        }
                        setPickerOpen(false);
                      }}
                      className="group rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 overflow-hidden text-left p-0 cursor-pointer transition-colors"
                    >
                      <div className="aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={imgUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-2 text-[11px] text-slate-300 truncate">{imgUrl}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white m-0">
              Réinitialiser le contenu du site ?
            </h3>
            <p className="text-sm text-slate-300 m-0">
              Cette action restaurera tous les textes et images d&apos;origine par défaut. Vos
              modifications personnalisées seront remplacées.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs font-medium border-0 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white px-3.5 py-2 text-xs font-semibold border-0 cursor-pointer"
              >
                {resetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirmer la réinitialisation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
