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
  const { searchQuery, setSearchQuery } = useSearch();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 点击"全部"按钮 - 清空搜索并显示所有产品
  const handleShowAll = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  // 点击分类按钮 - 清空搜索并只显示该分类
  const handleSelectCategory = (categoryId: string) => {
    setSearchQuery('');
    setSelectedCategory(categoryId);
  };

  useEffect(() => {
    let filtered = initialProducts;

    // 先按分类筛选
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    // 再按搜索关键词筛选
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
      {/* 搜索框 - 置顶，无间距 */}
      <div className="bg-white border-b border-stone-200 pt-12 md:pt-14">
        <div className="max-w-full mx-auto px-2 py-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="搜索产品名称、编号或标签"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 pl-4 pr-4 py-5 text-base bg-stone-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white placeholder:text-stone-400"
            />
            <button className="px-5 py-5 bg-stone-900 text-white text-base font-medium rounded-xl hover:bg-stone-800 transition-colors">
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 分类导航 - 横向滚动，字号加大，高度增加，颜色优化，倒角减小 */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-full mx-auto px-2 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            <button
              onClick={handleShowAll}
              className={`flex-shrink-0 px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              全部
            </button>
            {initialCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="max-w-full mx-auto px-2 py-6 md:py-8">
        {/* 筛选按钮 */}
        {selectedCategory && (
          <div className="flex items-center justify-end mb-5">
            <button
              onClick={handleShowAll}
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              清除筛选
            </button>
          </div>
        )}

        {/* 产品网格 - 响应式布局，充分利用宽度 */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group block"
              >
                {/* 图片容器 - 充分利用右边空白 */}
                <div className="relative bg-stone-200 rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow duration-300"
                  style={{ aspectRatio: '3/4' }}
                >
                  <Image
                    src={product.coverImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                  />
                  {/* 精选标签 - 右上角紧贴 */}
                  {product.featured && (
                    <span className="absolute top-0 right-0 bg-amber-500/95 text-white text-xs font-medium px-2.5 py-1.5 rounded-tr-xl rounded-bl-md shadow-sm">
                      {product.featured}
                    </span>
                  )}
                </div>

                {/* 产品信息 */}
                <div className="flex items-center gap-2 mb-2">
                  {/* 编号 - 红色 */}
                  <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                    {product.sku}
                  </span>
                  <h3 className="font-medium text-stone-900 text-sm md:text-base group-hover:text-amber-600 transition-colors truncate">
                    {product.name}
                  </h3>
                </div>

                {/* 标签 - 方框样式 */}
                <div className="flex flex-wrap gap-1.5">
                  {product.tags && product.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs text-stone-600 bg-white border border-stone-300 px-2 py-0.5 rounded-sm"
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
