'use client';

import { usePathname } from 'next/navigation';

export function ClientLayout({ 
  children, 
  header 
}: { 
  children: React.ReactNode;
  header?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <>
      {!isHomePage && header}
      {children}
    </>
  );
}
