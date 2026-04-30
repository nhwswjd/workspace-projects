'use client';

import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuth } from '@/hooks/useAuth';
import { products, categories } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const { isAuthenticated, isLoading } = useAuth();

  const category = categories.find((c) => c.id === categoryId);
  const categoryProducts = products.filter((p) => p.categoryId === categoryId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-10 w-40 mb-2" />
            <Skeleton className="h-4 w-64 mb-8" />
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
        <button
          onClick={() => router.push('/')}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 md:pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Category header */}
          <header className="mb-6 md:mb-8">
            <h1 className="font-display text-xl md:text-2xl">
              {category.name}
            </h1>
          </header>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {categoryProducts.map((product, index) => (
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
