'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Lock, Unlock, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { brandInfo } from '@/lib/products';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href="/"
              className="flex items-center gap-2 group"
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform duration-300 ${
                  isScrolled ? 'text-foreground' : 'text-foreground/60'
                } group-hover:-translate-x-1`}
              />
              <span
                className={`font-display text-xl md:text-2xl tracking-widest transition-colors duration-300 ${
                  isScrolled ? 'text-foreground' : 'text-foreground'
                }`}
              >
                {brandInfo.name}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <div
                className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                  isScrolled ? 'text-foreground/60' : 'text-foreground/50'
                }`}
              >
                {isAuthenticated ? (
                  <>
                    <Unlock className="w-4 h-4 text-green-600" />
                    <span>已授权访问</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>受保护内容</span>
                  </>
                )}
              </div>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-xs"
                >
                  退出登录
                </Button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -mr-2"
              aria-label="打开菜单"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-[280px]">
          <SheetHeader>
            <SheetTitle className="font-display tracking-widest">
              {brandInfo.name}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isAuthenticated ? (
                <>
                  <Unlock className="w-4 h-4 text-green-600" />
                  <span>已授权访问</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>受保护内容</span>
                </>
              )}
            </div>
            {isAuthenticated && (
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
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
