'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface PublicShellProps {
  header: React.ReactNode;
  footer: React.ReactNode;
  scripts: React.ReactNode;
  children: React.ReactNode;
}

export default function PublicShell({
  header,
  footer,
  scripts,
  children,
}: PublicShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/lepays-dsb');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="page-wrapper">
        {header}
        {children}
        {footer}
      </div>
      {scripts}
    </>
  );
}
