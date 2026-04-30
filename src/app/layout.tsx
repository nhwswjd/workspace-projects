import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="zh-CN">
      <body className="antialiased min-h-screen pt-[40px] md:pt-[48px]">
        {children}
      </body>
    </html>
  );
}
