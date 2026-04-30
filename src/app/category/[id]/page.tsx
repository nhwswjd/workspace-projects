'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Lock, Unlock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UnlockPrompt } from '@/components/auth/UnlockPrompt';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuth } from '@/hooks/useAuth';
import { products, categories } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const { isAuthenticated, isLoading, hasCategoryAccess } = useAuth();
  
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);

  const category = categories.find((c) => c.id === categoryId);
  const categoryProducts = products.filter((p) => p.categoryId === categoryId);
  const canAccess = hasCategoryAccess(categoryId);

  useEffect(() => {
    // 如果未授权且用户点击了产品，需要显示解锁提示
    if (!isAuthenticated && categoryProducts.length > 0) {
      // 默认显示解锁提示
      setShowUnlockPrompt(true);
    }
  }, [isAuthenticated, categoryProducts.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-5 w-64 mb-12" />
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="font-display text-2xl mb-4">分类未找到</h1>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 md:pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>返回全部</span>
          </Link>

          {/* Category header */}
          <header className="mb-8 md:mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{category.icon}</span>
              <h1 className="font-display text-2xl md:text-3xl">
                {category.name}
              </h1>
              {isAuthenticated ? (
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <Unlock className="w-3 h-3" />
                  <span>已解锁</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full">
                  <Lock className="w-3 h-3" />
                  <span>受保护</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              {category.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              共 {categoryProducts.length} 件产品
            </p>
          </header>

          {/* Product Grid - Mobile: 2 columns, Desktop: responsive */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard
                  product={product}
                  isAuthenticated={isAuthenticated}
                  canAccess={canAccess}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* Unlock prompt when not authenticated */}
          {showUnlockPrompt && (
            <div className="mt-12 max-w-md mx-auto">
              <div className="bg-accent/50 rounded-2xl p-6 md:p-8">
                <UnlockPrompt />
              </div>
            </div>
          )}

          {/* Empty state */}
          {categoryProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">该分类暂无产品</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
