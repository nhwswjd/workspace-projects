import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
