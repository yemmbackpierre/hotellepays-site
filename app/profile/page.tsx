import type { Metadata } from 'next';
import React from 'react';
import { cookies } from 'next/headers';
import Breadcrumb from '@/app/layouts/Breadcrumb';
import ProfileReservationsClient from '@/app/components/ProfileReservationsClient';
import AdminProfileBlockedNotice from '@/app/components/AdminProfileBlockedNotice';
import { GUEST_EMAIL_COOKIE } from '@/app/api/bookings/route';
import { getAdminSession } from '@/app/lib/adminAuth';
import { getClientSession, getMergedClientProfile } from '@/app/lib/clientAuth.server';
import { bookingsService } from '@/app/services/bookings.service';
import { suggestKeywords } from '@/app/lib/seo';

export const dynamic = 'force-dynamic';

const title = 'Mon Profil & Mes Réservations - Hôtel Le Pays';
const description =
  "Accédez à votre espace client sécurisé par code unique par e-mail pour consulter vos informations personnelles et rechercher vos réservations à l'Hôtel Le Pays.";

export const metadata: Metadata = {
  title,
  description,
  keywords: suggestKeywords({ title, description }),
};

export default async function ProfilePage() {
  const adminSession = await getAdminSession();
  if (adminSession) {
    return (
      <>
        <Breadcrumb
          title="Mon Profil & Mes Réservations"
          paths={[
            { name: 'Accueil', link: '/' },
            { name: 'Mon Profil' },
          ]}
          backgroundImage="/assets/images/resource/page-title-bg.png"
        />
        <AdminProfileBlockedNotice adminEmail={adminSession.email} />
      </>
    );
  }

  const [cookieStore, clientSession] = await Promise.all([cookies(), getClientSession()]);
  const emailHint = cookieStore.get(GUEST_EMAIL_COOKIE)?.value?.trim() || '';

  const [initialProfile, serverReservations] = clientSession
    ? await Promise.all([
        getMergedClientProfile(clientSession.email),
        bookingsService.listByEmail(clientSession.email),
      ])
    : [null, []];

  return (
    <>
      <Breadcrumb
        title="Mon Profil & Mes Réservations"
        paths={[
          { name: 'Accueil', link: '/' },
          { name: 'Mon Profil' },
        ]}
        backgroundImage="/assets/images/resource/page-title-bg.png"
      />
      <ProfileReservationsClient
        initialAuthenticated={Boolean(clientSession)}
        initialEmail={clientSession?.email || emailHint}
        initialProfile={initialProfile}
        initialServerReservations={serverReservations}
      />
    </>
  );
}
