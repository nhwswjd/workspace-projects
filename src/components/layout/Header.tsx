'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  siteName?: string;
}

export function Header({ siteName }: HeaderProps) {
  const [siteTitle, setSiteTitle] = useState(siteName || 'ATELIER');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    async function fetchSiteName() {
      try {
        const res = await fetch('/api/site-settings/brand_name');
        if (res.ok) {
          const data = await res.json();
          if (data.value) {
            setSiteTitle(data.value);
          }
        }
      } catch (error) {
        console.error('Failed to fetch site name:', error);
      }
    }
    fetchSiteName();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 md:bg-white md:border-b md:border-gray-100">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* 左侧：移动端菜单按钮 */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
        >
          {showMobileMenu ? (
            <X className="w-7 h-7" strokeWidth={2.5} />
          ) : (
            <Menu className="w-7 h-7" strokeWidth={2.5} />
          )}
        </button>

        {/* 中间：品牌标题 */}
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold tracking-wider">{siteTitle}</h1>
        </div>

        {/* 右侧占位 */}
        <div className="w-11" />
      </div>

      {/* 移动端菜单 */}
      {showMobileMenu && (
        <nav className="absolute left-0 right-0 top-14 bg-white border-b border-gray-100 shadow-lg md:hidden">
          <Link
            href="/gallery"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
            onClick={() => setShowMobileMenu(false)}
          >
            相册广场
          </Link>
          <Link
            href="/admin"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
            onClick={() => setShowMobileMenu(false)}
          >
            管理后台
          </Link>
        </nav>
      )}
    </header>
  );
}
