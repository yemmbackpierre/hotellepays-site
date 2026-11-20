'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, LayoutDashboard, Loader2 } from 'lucide-react';

interface AdminProfileBlockedNoticeProps {
  adminEmail: string;
}

export default function AdminProfileBlockedNotice({
  adminEmail,
}: AdminProfileBlockedNoticeProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleAdminLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout/', {
        method: 'POST',
        credentials: 'include',
      });
      router.refresh();
      window.location.reload();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <section className="py-5" style={{ backgroundColor: '#faf8f4', minHeight: '65vh' }}>
      <div className="container">
        <div
          className="bg-white border border-[#e5e0d5] rounded-lg p-4 p-md-5 mx-auto"
          style={{ maxWidth: 680 }}
        >
          <div className="d-flex align-items-start gap-3 mb-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 48, height: 48, backgroundColor: '#fef3c7', color: '#92400e' }}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div
                className="text-uppercase small fw-semibold"
                style={{ color: '#9a6b2f', letterSpacing: '0.08em' }}
              >
                Accès réservé aux clients
              </div>
              <h2 className="h4 text-dark mt-1 mb-2">
                Espace Client inaccessible depuis une session administrateur
              </h2>
              <p className="text-muted small mb-0">
                La page <strong>Mon Profil &amp; Mes Réservations</strong> est exclusivement
                destinée aux clients et ne constitue pas un espace de gestion administrateur.
                Vous êtes actuellement connecté en tant qu&apos;administrateur (
                <strong>{adminEmail}</strong>).
              </p>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 pt-3 border-top border-[#efeae0]">
            <Link
              href="/lepays-dsb/"
              className="btn btn-dark d-inline-flex align-items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Accéder à l&apos;interface administrateur (/lepays-dsb)</span>
            </Link>

            <button
              type="button"
              onClick={handleAdminLogout}
              disabled={loggingOut}
              className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>
                {loggingOut
                  ? 'Déconnexion...'
                  : 'Se déconnecter de la session admin pour accéder en client'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
