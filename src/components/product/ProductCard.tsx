'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Lock, Play } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  isAuthenticated: boolean;
  index?: number;
}

export function ProductCard({
  product,
  isAuthenticated,
  index = 0,
}: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <article className="relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-500">
        <div
          className={cn(
            'relative aspect-[3/4] overflow-hidden',
            !isAuthenticated && 'blur-sm'
          )}
        >
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {!isAuthenticated && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#1A1A1A]" />
              </div>
            </div>
          )}

          {isAuthenticated && product.videos.length > 0 && (
            <div className="absolute bottom-3 right-3">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-4 h-4 text-[#1A1A1A] fill-current" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {product.category}
          </span>
          <h3 className="font-display text-lg md:text-xl mt-1 group-hover:text-[#1A1A1A]/70 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {product.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
