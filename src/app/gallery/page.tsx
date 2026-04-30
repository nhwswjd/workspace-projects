'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuth } from '@/hooks/useAuth';
import { products, categories } from '@/lib/products';

export default function GalleryPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  // 首页只显示前4个产品
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 md:pt-24">
        {/* Categories Section */}
        <section className="py-2 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <article className="overflow-hidden rounded-lg bg-white border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                    <div className="relative flex flex-col items-center justify-center py-2 px-2 md:py-2 md:px-3">
                      <h3 className="font-medium text-xs md:text-sm text-center">
                        {category.name}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products - 2x2 Grid */}
        <section className="py-6 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Product Grid - 2 columns, centered */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 justify-items-center">
              {featuredProducts.map((product, index) => (
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
