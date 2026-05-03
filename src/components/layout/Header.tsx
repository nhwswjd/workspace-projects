'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';

interface HeaderProps {
  siteName?: string;
}

export function Header({ siteName }: HeaderProps) {
  const [siteTitle, setSiteTitle] = useState(siteName || 'ATELIER');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查登录状态
    const checkLogin = () => {
      const authData = localStorage.getItem('atelier_authenticated');
      setIsLoggedIn(!!authData);
    };
    checkLogin();
    
    // 监听登录状态变化和页面切换
    window.addEventListener('storage', checkLogin);
    // 每次页面可见时也检查
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkLogin();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('storage', checkLogin);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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
          {isLoggedIn && (
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('authTokenData');
                setIsLoggedIn(false);
                setShowMobileMenu(false);
                window.location.href = '/';
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
