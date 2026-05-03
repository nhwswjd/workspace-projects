'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Landmark, Bed, MapPin, UtensilsCrossed, Image } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  coverImage: string;
  location?: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'product' | 'category'>('product');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  useEffect(() => {
    // 加载产品数据
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.products) {
          setProducts(data.products.map((p: any) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category,
            coverImage: p.coverImage || p.cover_image,
            location: p.location
          })));
        }
      });
  }, []);

  const handleEdit = (id: string) => {
    // 跳转到编辑页面
    window.location.href = `/admin/edit/${id}`;
  };

  const handleDelete = (type: string, id: string) => {
    setDeleteTarget({ type, id });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      const response = await fetch(`/api/products/${deleteTarget.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (deleteTarget.type === 'product') {
          setProducts(products.filter(p => p.id !== deleteTarget.id));
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
    
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleAddProduct = () => {
    window.location.href = '/admin/edit/new';
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'landmark': return <Landmark className="w-5 h-5 text-teal-600" />;
      case 'bed': return <Bed className="w-5 h-5 text-teal-600" />;
      case 'map-pin': return <MapPin className="w-5 h-5 text-teal-600" />;
      case 'utensils': return <UtensilsCrossed className="w-5 h-5 text-teal-600" />;
      default: return <Image className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-20">
        <div className="h-14 px-4 flex items-center justify-between">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 -ml-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-neutral-900">管理后台</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {/* Tab 切换 */}
        <div className="px-4 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('product')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'product'
                  ? 'bg-teal-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              产品管理
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'category'
                  ? 'bg-teal-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              分类管理
            </button>
          </div>
        </div>

        {/* 产品列表 */}
        {activeTab === 'product' && (
          <div className="px-4 pt-4 space-y-3">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl p-3 flex gap-3 shadow-sm">
                <div className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.coverImage ? (
                    <img 
                      src={product.coverImage} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-neutral-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 truncate">{product.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1">分类：{product.category}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{product.sku}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(product.id)}
                      className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete('product', product.id)}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分类列表 */}
        {activeTab === 'category' && (
          <div className="px-4 pt-4 space-y-3">
            {categories.map(category => (
              <div key={category.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">{category.name}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">{category.count} 个产品</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(category.id)}
                      className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete('category', category.id)}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 底部添加按钮 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-100">
        <div className="px-4 py-3 pb-6">
          <button 
            onClick={handleAddProduct}
            className="w-full bg-teal-600 text-white py-3.5 rounded-xl text-base font-semibold hover:bg-teal-700 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加产品
          </button>
        </div>
      </div>

      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">确认删除</h3>
              <p className="text-sm text-neutral-500">确定要删除这个项目吗？此操作无法撤销。</p>
            </div>
            <div className="flex border-t border-neutral-100">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3.5 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors border-l border-neutral-100"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
