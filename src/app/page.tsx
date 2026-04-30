'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuth } from '@/hooks/useAuth';
import { products, categories } from '@/lib/products';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

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

      {/* Main Content */}
      <main className="flex-1 pt-20 md:pt-24">
        {/* Categories Section */}
        <section className="py-8 md:py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <article className="relative overflow-hidden rounded-xl bg-white border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square relative flex flex-col items-center justify-center p-3 md:p-4">
                      <span className="text-2xl md:text-3xl mb-1 group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </span>
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

        {/* All Products Section */}
        <section className="py-8 md:py-12 px-4 bg-accent/20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="font-display text-xl md:text-2xl">
                精选产品
              </h2>
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
                  style={{ animationDelay: `${index * 30}ms` }}
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
