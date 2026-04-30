'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Lock, Unlock, ChevronLeft, Grid3X3 } from 'lucide-react';
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setIsMobileMenuOpen(false);
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

            {/* Category Navigation - Desktop */}
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

            <div className="hidden md:flex items-center gap-4">
              <div
                className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                  isScrolled ? 'text-foreground/60' : 'text-foreground/50'
                }`}
              >
                {isAuthenticated ? (
                  <>
                    <Unlock className="w-4 h-4 text-green-600" />
                    <span>已授权</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>受保护</span>
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
                  退出
                </Button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -mr-2 flex items-center gap-2"
              aria-label="打开菜单"
            >
              <Grid3X3 className="w-5 h-5" />
              <span className="text-sm">分类</span>
            </button>
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
                onClick={() => handleCategoryClick(category.id)}
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-3">
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
                className="w-full mt-4"
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
