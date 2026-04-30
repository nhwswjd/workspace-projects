'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { SearchBar } from '@/components/product/SearchBar';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

interface GalleryClientProps {
  initialCategories: Category[];
  initialProducts: Product[];
}

export default function GalleryClient({ initialCategories, initialProducts }: GalleryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    let filtered = initialProducts;

    // 按分类筛选
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    // 按搜索词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, initialProducts]);

  return (
    <div className="min-h-screen bg-white">
      {/* 搜索栏 */}
      <div className="p-4">
        <Input
          type="text"
          placeholder="搜索产品名称或标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
      </div>

      {/* 分类导航 */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-gray-100">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            selectedCategory === null
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {initialCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === cat.id
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 产品网格 */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group"
            >
              <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-2">
                <Image
                  src={product.coverImage}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  {product.sku}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 text-sm truncate">
                {product.name}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {product.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 所有产品 */}
      {filteredProducts.length > 4 && (
        <div className="px-4 py-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">更多产品</h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.slice(4).map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group"
              >
                <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-2">
                  <Image
                    src={product.coverImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                    {product.sku}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {product.name}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 无结果 */}
      {filteredProducts.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-500">
          未找到匹配的产品
        </div>
      )}
    </div>
  );
}
