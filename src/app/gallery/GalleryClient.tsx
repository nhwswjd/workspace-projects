'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, X, Heart, Share2, ChevronLeft, MoreVertical, ShoppingBag, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  category_id: string;
  coverImage: string;
  featured?: string | null;
  location: string;
}

interface Category {
  id: string;
  name: string;
}

export default function GalleryClient({ 
  initialProducts, 
  initialCategories, 
  brandInfo 
}: { 
  initialProducts: any[]; 
  initialCategories: any[];
  brandInfo: { name: string } | null;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const brandName = brandInfo?.name || '江南风景好';

  useEffect(() => {
    let result = initialProducts;

    if (selectedCategory !== 'all') {
      result = result.filter(p => 
        p.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.location && p.location.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.tags && p.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      );
    }

    setFilteredProducts(result.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999)));
  }, [selectedCategory, searchQuery, initialProducts]);

  // 滚动监听 - 显示/隐藏返回顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      // 同时监听 window 和 mainRef 的滚动
      const scrollY = window.scrollY || (mainRef.current?.scrollTop || 0);
      setShowBackToTop(scrollY > 100);
    };
    
    // 监听 window 滚动
    window.addEventListener('scroll', handleScroll);
    // 监听 mainRef 滚动（移动端）
    mainRef.current?.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      mainRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    // 同时滚动 window 和 mainRef
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    // 搜索逻辑已在 useEffect 中处理
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchRef.current?.focus();
  };

  const getCategoryDisplayName = (category: string) => {
    const mapping: Record<string, string> = {
      'all': '全部',
      'shanghai': '上海',
      'beijing': '北京',
      'nanjing': '南京',
      'zhongbei': '中北',
      'dongnan': '东南',
      'zhongxi': '中西'
    };
    return mapping[category.toLowerCase()] || category;
  };

  return (
    <>
      <main ref={mainRef} className="min-h-screen bg-gray-50 overflow-y-auto pb-4">
        {/* 搜索框 */}
        <div className="px-1.5 pt-1.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400/50" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder=""
                className="w-full bg-gray-100 border border-teal-200 rounded-full pl-10 pr-4 py-2.5 text-sm
                         text-gray-900 placeholder:text-gray-400/50
                         focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button 
              onClick={handleSearch}
              className="bg-teal-500 text-white px-1.5 py-2.5 rounded-full text-sm font-medium
                       hover:bg-teal-600 active:scale-[0.98] transition-all"
            >
              搜索
            </button>
          </div>
        </div>

        {/* 分类标签 */}
        <div className="px-1.5 pb-1.5">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${selectedCategory === 'all' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              全部
            </button>
            {initialCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${selectedCategory === cat.id 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                {getCategoryDisplayName(cat.name)}
              </button>
            ))}
          </div>
        </div>

        {/* 横向网格 */}
        <div className="px-1.5">
          <div className="grid-layout">
            {filteredProducts.map((product) => (
              <div key={product.id} className="grid-item">
                <a 
                  href={`/product/${product.id}`}
                  className="block bg-white rounded-xl overflow-hidden hover:shadow-float transition-shadow"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div className="relative" style={{ paddingBottom: '133.33%' }}>
                    {product.coverImage ? (
                      <img
                        src={product.coverImage}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    {product.featured && (
                      <span className="absolute top-2 left-2 bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
                        精选
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="text-teal-600">{product.sku}</span> {product.name}
                    </p>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.tags.slice(0, 3).map((tag: string, index: number) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{product.location}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>暂无相关产品</p>
            </div>
          )}
        </div>
      </main>

      {/* 返回顶部按钮 - 在main外面确保fixed定位正常工作 */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-700 transition-all z-50"
          aria-label="返回顶部"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}

      {/* 移动端菜单 */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{brandName}</h2>
            </div>
            <nav className="p-2">
              <a href="/gallery" className="flex items-center gap-3 px-1.5 py-3 rounded-lg bg-teal-50 text-teal-600">
                <ShoppingBag className="w-5 h-5" />
                <span>产品广场</span>
              </a>
              <a href="/admin" className="flex items-center gap-3 px-1.5 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                <ShoppingBag className="w-5 h-5" />
                <span>管理后台</span>
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
