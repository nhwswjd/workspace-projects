'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { useSearch } from '@/contexts/SearchContext';

interface GalleryClientProps {
  initialCategories: Category[];
  initialProducts: Product[];
}

export default function GalleryClient({ initialCategories, initialProducts }: GalleryClientProps) {
  const { searchQuery } = useSearch();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    let filtered = initialProducts;

    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.tags && p.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, initialProducts]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 分类导航 - 横向滚动 */}
      <div className="bg-white border-b border-stone-200 sticky top-10 md:top-12 z-10">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              全部
            </button>
            {initialCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* 产品统计 */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-stone-500">
            共 <span className="font-medium text-stone-700">{filteredProducts.length}</span> 个产品
          </p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              清除筛选
            </button>
          )}
        </div>

        {/* 产品网格 - 响应式布局 */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group block"
              >
                {/* 图片容器 */}
                <div className="relative aspect-[3/4] bg-stone-200 rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <Image
                    src={product.coverImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                  />
                  {/* SKU 标签 */}
                  <span className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md">
                    {product.sku}
                  </span>
                </div>

                {/* 产品信息 */}
                <h3 className="font-medium text-stone-900 text-sm md:text-base mb-2 group-hover:text-amber-600 transition-colors truncate">
                  {product.name}
                </h3>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {product.tags && product.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* 空状态 */
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-stone-500 text-base">未找到相关产品</p>
            <p className="text-stone-400 text-sm mt-1">尝试其他关键词或浏览全部分类</p>
            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-4 text-sm text-amber-600 hover:text-amber-700"
            >
              查看全部产品
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
