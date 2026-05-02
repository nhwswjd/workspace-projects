'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, ImageIcon, Search } from 'lucide-react';
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
  const [showTopButton, setShowTopButton] = useState(false);

  // 监听滚动显示Top按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 点击"全部"按钮 - 清空搜搜并显示所有产品
  const handleShowAll = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  // 点击分类按钮 - 清空搜搜并只显示该分类
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

    // 再按搜搜关键词筛选
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
    <div className="min-h-screen bg-orange-100">
      {/* Top按钮 - 回到顶部 */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 bg-stone-800 text-white rounded-lg shadow-lg flex items-center justify-center hover:bg-stone-700 transition-all"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* 移动端顶部两栏 */}
      <div className="md:hidden px-4 pt-4 pb-2 space-y-3 bg-orange-100">
        {/* 第一栏 - 搜索栏高度缩减80%，淡灰色背景 */}
        <div className="bg-stone-200 rounded-full px-4 py-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400 ml-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="编号/名称/地址"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 py-2 text-sm bg-transparent border-none focus:ring-0 focus:outline-none focus:border-transparent shadow-none text-stone-900 placeholder:text-stone-400"
          />
          <button className="w-11 h-11 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-orange-500 transition-colors">
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 第二栏 - 分类栏高度加倍，左对齐，黄色背景 */}
        <div className="bg-orange-200 rounded-2xl p-12">
          <div className="flex flex-wrap gap-2 justify-start">
            <button
              onClick={handleShowAll}
              className={`px-5 py-3 text-base font-medium rounded-full transition-all ${
                selectedCategory === null
                  ? 'bg-orange-500 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              全部
            </button>
            {initialCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-5 py-3 text-base font-medium rounded-full transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 桌面端搜索框和分类导航 - 保持原有样式 */}
      <div className="hidden md:block bg-stone-50">
        <div className="w-2/5 mx-auto px-2 py-6">
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="编号/名称/地址"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 md:py-2 text-base md:text-sm bg-stone-100 border border-stone-300 focus:outline-none focus:border-stone-500 placeholder:text-stone-400"
            />
            <button className="px-4 py-3 md:py-2 text-base md:text-sm font-medium bg-stone-800 text-white hover:bg-stone-700 transition-colors whitespace-nowrap min-w-[60px] md:min-w-[50px]">
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 桌面端分类导航 */}
      <div className="hidden md:block bg-white border-b border-stone-200">
        <div className="w-full px-4 py-8">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={handleShowAll}
              className={`flex-shrink-0 px-5 py-3 text-base font-medium border-2 transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'
              }`}
            >
              全部
            </button>
            {initialCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex-shrink-0 px-5 py-3 text-base font-medium border-2 transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区 - 左右1mm空间 */}
      <main className="max-w-full mx-auto px-1 py-4 md:py-8">
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
                {/* 图片容器 - 无圆角，左右1mm空间 */}
                <div className="relative bg-stone-200 overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow duration-300"
                  style={{ aspectRatio: '3/4' }}
                >
                  {product.coverImage ? (
                    <Image
                      src={product.coverImage}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-stone-200 flex items-center justify-center">
                      <ImageIcon className="text-stone-400" size={32} />
                    </div>
                  )}
                  {/* 精选标签 - 右上角紧贴，无圆角 */}
                  {product.featured && (
                    <span className="absolute top-0 right-0 bg-amber-500/95 text-white text-xs font-medium px-2.5 py-1.5">
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
                      className="text-xs text-stone-600 bg-white border border-stone-300 px-2 py-0.5"
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
