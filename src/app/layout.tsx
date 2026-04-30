import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans-sc',
});

export const metadata: Metadata = {
  title: {
    default: 'ATELIER | 产品展示',
    template: '%s | ATELIER',
  },
  description:
    'ATELIER 是一个致力于发现与呈现美好生活方式的品牌。通过密码保护的产品资料，为尊贵的访客呈现独家设计作品。',
  keywords: [
    '产品展示',
    '家居设计',
    '北欧风格',
    '手工艺术',
    '生活方式',
  ],
  authors: [{ name: 'ATELIER', url: '#' }],
  openGraph: {
    title: 'ATELIER | 产品展示',
    description: '发现与呈现美好生活方式',
    siteName: 'ATELIER',
    locale: 'zh_CN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body className="antialiased min-h-screen pt-[60px] md:pt-[72px] font-sans">
        {children}
      </body>
    </html>
  );
}
