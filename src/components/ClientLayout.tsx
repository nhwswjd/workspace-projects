'use client';

import { usePathname } from 'next/navigation';
import Header from './layout/Header';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <>
      {!isHomePage && <Header />}
      {children}
    </>
  );
}
