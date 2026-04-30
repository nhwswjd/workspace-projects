'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  isAuthenticated: boolean;
  canAccess: boolean;
  index?: number;
}

export function ProductCard({
  product,
  isAuthenticated,
  canAccess,
  index = 0,
}: ProductCardProps) {
  // 未授权用户可以看清晰图片，只是点击进入详情页时才需要授权
  const isLocked = !isAuthenticated;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <article className="relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-500">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {isLocked && (
            <div className="absolute top-3 left-3">
              <div className="px-2 py-1 rounded-full bg-black/60 text-white text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <span>点击解锁</span>
              </div>
            </div>
          )}

          {isAuthenticated && canAccess && product.videos.length > 0 && (
            <div className="absolute bottom-3 right-3">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-4 h-4 text-[#1A1A1A] fill-current" />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {product.sku}
            </span>
            <span className="text-xs text-muted-foreground">
              {product.category}
            </span>
          </div>
          <h3 className="font-display text-base md:text-lg mt-1 group-hover:text-[#1A1A1A]/70 transition-colors">
            {product.name}
          </h3>
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
