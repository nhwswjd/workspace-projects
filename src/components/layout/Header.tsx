'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Home, ChevronLeft, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSearch } from '@/contexts/SearchContext';
import { brandInfo, categories } from '@/lib/products';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PasswordInput } from '@/components/auth/PasswordInput';

export function Header() {
  const { isAuthenticated, isAdmin, logout, checkPassword } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginError, setLoginError] = useState<string>();
  const router = useRouter();
  const pathname = usePathname();
  
  const isSubPage = pathname === '/gallery' || pathname.startsWith('/category/') || pathname.startsWith('/product/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async (password: string): Promise<boolean> => {
    setLoginError(undefined);
    const result = await checkPassword(password);
    if (result.success) {
      setShowLoginDialog(false);
      return true;
    } else {
      setLoginError('密码错误，请重试');
      return false;
    }
  };

  return (
    <>
      <header
        className={`w-full transition-all duration-500 ${
          isScrolled
            ? 'bg-white shadow-sm'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 md:h-12">
            {/* Left: Back button + Search */}
            <div className="flex items-center gap-2 flex-1">
              {isSubPage && (
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>返回</span>
                </button>
              )}
            </div>

            {/* Center: Brand */}
            <span className="font-display text-lg md:text-xl tracking-widest">
              {brandInfo.name}
            </span>

            {/* Right: Menu button */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              {/* Desktop: Auth buttons */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        管理产品
                      </Link>
                    )}
                    <button
                      onClick={() => logout()}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      退出登录
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowLoginDialog(true)}
                    className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    登录
                  </button>
                )}
              </div>
              
              {/* Mobile: Menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2"
                aria-label="打开菜单"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-[140px] h-auto max-h-[14vh]">
          <SheetHeader>
            <SheetTitle className="font-display tracking-widest text-left">
              {brandInfo.name}
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-1">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    管理产品
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  退出登录
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowLoginDialog(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-foreground hover:bg-stone-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                输入密码
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">
              输入访问密码
            </DialogTitle>
          </DialogHeader>
          <PasswordInput
            onSubmit={handleLogin}
            error={loginError}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
