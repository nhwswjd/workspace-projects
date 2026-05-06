'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  category_id: string;
  coverImage: string;
  featured?: string | null;
  location: string;
  notes?: string;
  tags?: string[];
  sortOrder?: number;
  images?: string[];
  featuredRightBottom?: string | null;
}

interface Category {
  id: string;
  name: string;
}

export default function GalleryClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const router = useRouter();

  // 检查认证状态
  useEffect(() => {
    const authData = localStorage.getItem('atelier_authenticated');
    if (authData !== 'true') {
      router.replace('/');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // 获取数据
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || []);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // 过滤产品
  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'all') {
      result = result.filter(p => 
        p.category_id === selectedCategory || 
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query) ||
        p.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(result.sort((a, b) => {
      const aOrder = a.sortOrder ?? 999;
      const bOrder = b.sortOrder ?? 999;
      return aOrder - bOrder;
    }));
  }, [selectedCategory, searchQuery, products]);

  // 滚动监听 - 显示/隐藏返回顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || (mainRef.current?.scrollTop || 0);
      // 滚动相关状态可以在这里处理
    };
    
    window.addEventListener('scroll', handleScroll);
    mainRef.current?.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      mainRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  // 未认证或加载中状态
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-teal-500/50 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

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
                placeholder=""
                disabled={isLoading}
                className="w-full bg-gray-100 border border-teal-200 rounded-full pl-10 pr-4 py-2.5 text-sm
                         text-gray-900 placeholder:text-gray-400/50
                         focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-colors
                         disabled:opacity-50"
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
              onClick={() => searchRef.current?.focus()}
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
              className={`px-2 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                ${selectedCategory === 'all' 
                  ? 'bg-teal-500 text-white border-teal-500' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-300'}`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                  ${selectedCategory === cat.id 
                    ? 'bg-teal-500 text-white border-teal-500' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-300'}`}
              >
                {getCategoryDisplayName(cat.name)}
              </button>
            ))}
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-500/50 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
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
                        {(product.coverImage || (product.images && product.images[0])) ? (
                          <img
                            src={product.coverImage || product.images?.[0]}
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
                          <span className="absolute top-0 right-0 bg-teal-500 text-white text-xs px-2 py-0.5 rounded-bl-lg">
                            {product.featured}
                          </span>
                        )}
                        {product.featuredRightBottom && (
                          <span className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-tl-lg">
                            {product.featuredRightBottom}
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
          </>
        )}
      </main>
    </>
  );
}
