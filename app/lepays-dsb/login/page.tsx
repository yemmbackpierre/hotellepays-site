import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/app/lib/adminAuth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Connexion Administration — Hôtel Le Pays',
  robots: 'noindex, nofollow',
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect('/lepays-dsb/');
  }

  return <LoginForm />;
}
