'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Grid3X3, Home, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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
  const { isAuthenticated, logout, checkPassword, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginError, setLoginError] = useState<string>();
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if current page is gallery or other sub-pages (to show header)
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
            {/* Left: Back button (only show when not on home) */}
            <div className="flex items-center">
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

            {/* Right: Home + Login */}
            <div className="flex items-center gap-2">
              {/* Always show Home button on non-home pages */}
              {isSubPage && (
                <Link
                  href="/gallery"
                  className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">首页</span>
                </Link>
              )}
              {!isAuthenticated ? (
                <button
                  onClick={() => setShowLoginDialog(true)}
                  className="px-3 py-1.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  登录
                </button>
              ) : (
                <button
                  onClick={() => {
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
            <p className="text-sm text-muted-foreground font-normal">
              产品分类
            </p>
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
            {isAuthenticated ? (
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

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">输入访问密码</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <PasswordInput
              onSubmit={handleLogin}
              error={loginError}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
