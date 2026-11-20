'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cookieBlocked, setCookieBlocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCookieBlocked(false);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Identifiants invalides.');
        setLoading(false);
        return;
      }

      const meRes = await fetch('/api/admin/me/', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (!meRes.ok) {
        setCookieBlocked(true);
        setError(
          'Connexion validée mais votre navigateur bloque les cookies dans cet aperçu intégré. Ouvrez le dashboard dans un nouvel onglet.'
        );
        setLoading(false);
        return;
      }

      window.location.assign('/lepays-dsb/');
    } catch {
      setError('Erreur réseau lors de la connexion.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4" style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white m-0" style={{ fontSize: '1.25rem', lineHeight: 1.3 }}>
              Administration — Hôtel Le Pays
            </h1>
            <p className="text-sm text-slate-400 m-0">
              Espace protégé (/lepays-dsb)
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 space-y-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
            {cookieBlocked && (
              <a
                href="/lepays-dsb/login/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-1.5 text-xs no-underline"
              >
                <span>Ouvrir dans un nouvel onglet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hotellepays.com"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 bg-transparent border-0 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-semibold py-2.5 px-4 text-sm transition-colors border-0 cursor-pointer"
          >
            <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Comptes gérés dans app/data/admins.json</span>
          <Link href="/" className="text-amber-400 hover:text-amber-300 no-underline">
            Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
