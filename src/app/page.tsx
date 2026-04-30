'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UnlockPrompt } from '@/components/auth/UnlockPrompt';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuth } from '@/hooks/useAuth';
import { products, categories, brandInfo } from '@/lib/products';
import Image from 'next/image';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowUnlockPrompt(true);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1920&q=80"
            alt="ATELIER 品牌背景"
            fill
            className="object-cover opacity-[0.03]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-widest mb-4">
              {brandInfo.name}
            </h1>
            <p className="font-display italic text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up">
              {brandInfo.tagline}
            </p>
          </div>

          <div className="space-y-4 animate-fade-in-up animation-delay-200">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {brandInfo.description}
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in animation-delay-300 hidden md:block">
            <div className="w-6 h-10 border border-foreground/20 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-foreground/40 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 px-4 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl mb-2">
              浏览分类
            </h2>
            <p className="text-muted-foreground text-sm">
              选择您感兴趣的产品类别
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <article className="relative overflow-hidden rounded-xl bg-white border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square relative flex flex-col items-center justify-center p-4">
                    <span className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </span>
                    <h3 className="font-medium text-sm text-center">
                      {category.name}
                    </h3>
                    <span className="text-xs text-muted-foreground mt-1">
                      {products.filter(p => p.categoryId === category.id).length} 件
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Products Section */}
      <section className="py-12 md:py-16 px-4 bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl mb-1">
                精选产品
              </h2>
              <p className="text-muted-foreground text-sm">
                探索我们精心策划的产品系列
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              共 {products.length} 件
            </span>
          </div>

          {/* Product Grid - Mobile: 2 columns */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard
                  product={product}
                  isAuthenticated={isAuthenticated}
                  canAccess={true}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* Unlock prompt when not authenticated */}
          {showUnlockPrompt && (
            <div className="mt-12 max-w-md mx-auto">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <UnlockPrompt />
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
