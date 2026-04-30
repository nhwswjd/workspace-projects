'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { SearchBar } from '@/components/product/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { products, categories } from '@/lib/products';
import { Product } from '@/types';

function GalleryContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    if (!query) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const tagMatch = product.tags.some((tag) => tag.toLowerCase().includes(query));
        const categoryMatch = product.category.toLowerCase().includes(query);
        const skuMatch = product.sku.toLowerCase().includes(query);
        return nameMatch || tagMatch || categoryMatch || skuMatch;
      });
      setFilteredProducts(filtered);
    }
  }, [query]);

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

      <main className="flex-1 pt-20 md:pt-24">
        {/* Search Section */}
        <section className="py-3 px-4">
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
        </section>

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

        {/* Products Grid */}
        <section className="py-6 px-4">
          <div className="max-w-4xl mx-auto">
            {query && filteredProducts.length > 0 && (
              <p className="text-sm text-muted-foreground mb-4 text-center">
                找到 {filteredProducts.length} 个相关产品
              </p>
            )}
            {query && filteredProducts.length === 0 && (
              <p className="text-sm text-muted-foreground mb-4 text-center">
                未找到相关产品，请尝试其他关键词
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 md:gap-4 justify-items-center">
              {filteredProducts.map((product, index) => (
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

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
