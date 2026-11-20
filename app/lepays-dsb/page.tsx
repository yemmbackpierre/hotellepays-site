import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/app/lib/adminAuth';
import { getSiteContent } from '@/app/lib/siteContent';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard CMS — Hôtel Le Pays (/lepays-dsb)',
  robots: 'noindex, nofollow',
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/lepays-dsb/login/');
  }

  const initialContent = await getSiteContent();

  return <AdminDashboard initialContent={initialContent} admin={session} />;
}
