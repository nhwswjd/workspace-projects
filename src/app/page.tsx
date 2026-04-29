'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UnlockPrompt } from '@/components/auth/UnlockPrompt';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuth } from '@/hooks/useAuth';
import { products, brandInfo } from '@/lib/products';
import Image from 'next/image';

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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1920&q=80"
            alt="ATELIER 品牌背景"
            fill
            className="object-cover opacity-5"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-widest mb-6">
              {brandInfo.name}
            </h1>
            <p className="font-display italic text-lg md:text-xl text-muted-foreground mb-12 animate-fade-in-up">
              {brandInfo.tagline}
            </p>
          </div>

          <div className="space-y-6 animate-fade-in-up animation-delay-200">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {brandInfo.description}
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-fade-in animation-delay-300">
            <div className="w-6 h-10 border border-foreground/20 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-foreground/40 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 md:py-32 px-4 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              精选系列
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isAuthenticated
                ? '探索我们精心策划的产品系列'
                : '输入授权密码解锁完整产品资料'}
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard
                  product={product}
                  isAuthenticated={isAuthenticated}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* Unlock Prompt */}
          {!isAuthenticated && (
            <div className="mt-20 max-w-md mx-auto">
              <UnlockPrompt />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
