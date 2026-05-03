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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 检查登录状态和管理员权限
    const checkLogin = () => {
      const authData = localStorage.getItem('atelier_authenticated');
      const adminData = localStorage.getItem('atelier_is_admin');
      setIsLoggedIn(!!authData);
      setIsAdmin(adminData === 'true');
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

      {/* 移动端菜单 - 左侧滑出式设计 */}
      {showMobileMenu && (
        <>
          {/* 半透明遮罩 */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          {/* 左侧菜单面板 */}
          <nav className="fixed left-0 top-14 w-36 bg-black/80 backdrop-blur-md rounded-br-2xl shadow-xl z-50 md:hidden overflow-hidden">
            <div className="py-3 px-2 flex flex-col gap-2">
              <Link
                href="/gallery"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-medium text-sm">首  页</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm">管理后台</span>
                </Link>
              )}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    localStorage.removeItem('atelier_authenticated');
                    localStorage.removeItem('atelier_is_admin');
                    localStorage.removeItem('atelier_is_super_admin');
                    setIsLoggedIn(false);
                    setIsAdmin(false);
                    setShowMobileMenu(false);
                    window.location.href = '/';
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">退出登录</span>
                </button>
              )}
            </div>
          </nav>
        </>
      )}

      {/* PC端导航栏 */}
      <nav className="hidden md:flex items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
        <Link
          href="/gallery"
          className="px-3 py-1.5 text-sm text-gray-700 hover:text-teal-600 rounded-md hover:bg-white"
        >
          首  页
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className="ml-2 px-3 py-1.5 text-sm text-gray-700 hover:text-teal-600 rounded-md hover:bg-white"
          >
            管理后台
          </Link>
        )}
        {isLoggedIn && (
          <button
            onClick={() => {
              localStorage.removeItem('atelier_authenticated');
              localStorage.removeItem('atelier_is_admin');
              localStorage.removeItem('atelier_is_super_admin');
              setIsLoggedIn(false);
              setIsAdmin(false);
              window.location.href = '/';
            }}
            className="ml-auto px-3 py-1.5 text-sm text-red-600 hover:text-red-700 rounded-md hover:bg-white flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        )}
      </nav>
    </header>
  );
}
