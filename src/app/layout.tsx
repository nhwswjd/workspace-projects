import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen font-sans">
        <ClientLayout header={<SiteHeader />}>{children}</ClientLayout>
      </body>
    </html>
  );
}
