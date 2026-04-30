'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Grid3X3, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { brandInfo, categories } from '@/lib/products';
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
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: Brand + Login */}
            <div className="flex items-center gap-3">
              <span className="font-display text-lg md:text-xl tracking-widest">
                {brandInfo.name}
              </span>
              
              {/* Login button */}
              {!isAuthenticated ? (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  登录
                </button>
              ) : (
                <button
                  onClick={() => {
                    logout();
                  }}
                  className="text-sm text-green-600 hover:text-green-700 transition-colors"
                >
                  已登录
                </button>
              )}
            </div>

            {/* Center: Category Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Right: Home button */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">首页</span>
              </Link>
              
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2"
                aria-label="打开菜单"
              >
                <Grid3X3 className="w-5 h-5" />
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
              href="/"
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">全部产品</p>
                <p className="text-xs text-muted-foreground">浏览所有系列</p>
              </div>
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-lg">
                  {category.icon}
                </div>
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {category.description}
                  </p>
                </div>
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
              <p className="text-sm text-muted-foreground text-center">
                点击右上角「登录」输入密码解锁内容
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
