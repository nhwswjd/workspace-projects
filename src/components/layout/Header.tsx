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
    const success = await checkPassword(password);
    if (success) {
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white/80 backdrop-blur-sm'
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
              {/* Search box in header */}
              <div className="relative hidden sm:flex items-center gap-1 flex-[1] max-w-[120px]">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="搜索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full pl-3 pr-9 py-1.5 text-sm bg-accent/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Center: Brand */}
            <span className="font-display text-lg md:text-xl tracking-widest">
              {brandInfo.name}
            </span>

            {/* Right: Home + Login */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              {/* Mobile search icon */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsMobileMenuOpen(true);
                }}
                className="sm:hidden p-2"
                aria-label="搜索"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {isSubPage && (
                <Link
                  href="/gallery"
                  onClick={() => setSearchQuery('')}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">首页</span>
                </Link>
              )}
              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowLoginDialog(true);
                  }}
                  className="px-3 py-1.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  登录
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    logout();
                  }}
                  className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  已登录
                </button>
              )}
              
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

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px]">
          <SheetHeader>
            <SheetTitle className="font-display tracking-widest text-left">
              {brandInfo.name}
            </SheetTitle>
            
            {/* Mobile search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-accent/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
              />
            </div>
          </SheetHeader>
          
          <div className="mt-6 space-y-1">
            <Link
              href="/gallery"
              className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:bg-stone-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              全部产品
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:bg-stone-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t">
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-primary hover:bg-stone-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  管理产品
                </Link>
                <div className="h-px bg-border my-2" />
              </>
            )}
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  退出登录
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setShowLoginDialog(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full"
              >
                输入密码
              </Button>
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
