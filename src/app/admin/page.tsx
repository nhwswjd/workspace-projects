'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';

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
  icon?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name?: string } | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = () => {
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
  };

  const loadCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon
          })));
        }
      });
  };

  const handleEdit = (id: string) => {
    window.location.href = `/admin/edit/${id}`;
  };

  const handleDelete = (type: string, id: string, name?: string) => {
    setDeleteTarget({ type, id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    const endpoint = deleteTarget.type === 'product' ? `/api/products/${deleteTarget.id}` : `/api/categories/${deleteTarget.id}`;
    
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        if (deleteTarget.type === 'product') {
          setProducts(products.filter(p => p.id !== deleteTarget.id));
        } else {
          setCategories(categories.filter(c => c.id !== deleteTarget.id));
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowCategoryModal(true);
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) return;
    
    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryName })
        });
        if (res.ok) {
          setCategories(categories.map(c => 
            c.id === editingCategory.id ? { ...c, name: categoryName } : c
          ));
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryName })
        });
        if (res.ok) {
          const data = await res.json();
          setCategories([...categories, { id: data.id, name: categoryName }]);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
    }
    setShowCategoryModal(false);
    setCategoryName('');
  };

  const handleAddProduct = () => {
    window.location.href = '/admin/edit/new';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-100">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="w-10" />
          <h1 className="text-lg font-semibold text-neutral-900">管理后台</h1>
          <div className="w-10" />
        </div>
        
        {/* Tab切换 */}
        <div className="flex px-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-neutral-500'
            }`}
          >
            产品管理
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-neutral-500'
            }`}
          >
            分类管理
          </button>
        </div>
      </header>

      {/* 内容区 */}
      <main className="p-4 pb-24">
        {/* 产品列表 */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-[4/3] bg-neutral-100 relative">
                  {product.coverImage ? (
                    <img src={product.coverImage} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-neutral-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-neutral-900 truncate">{product.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{product.category}</p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleEdit(product.id)}
                      className="flex-1 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={() => handleDelete('product', product.id, product.name)}
                      className="py-1.5 px-2 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
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
        {activeTab === 'categories' && (
          <div className="space-y-3">
            {categories.map(category => (
              <div key={category.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-base text-neutral-900">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditCategory(category)}
                    className="py-2 px-3 text-xs font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    编辑
                  </button>
                  <button 
                    onClick={() => handleDelete('category', category.id, category.name)}
                    className="py-2 px-3 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
            onClick={activeTab === 'products' ? handleAddProduct : handleAddCategory}
            className="w-full bg-teal-600 text-white py-3.5 rounded-xl text-base font-semibold hover:bg-teal-700 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'products' ? '添加产品' : '添加分类'}
          </button>
        </div>
      </div>

      {/* 删除确认模态框 */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">确认删除</h3>
              <p className="text-sm text-neutral-500">
                确定要删除 {deleteTarget.name || (deleteTarget.type === 'product' ? '这个产品' : '这个分类')} 吗？此操作无法撤销。
              </p>
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

      {/* 分类编辑模态框 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCategoryModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-900">
                {editingCategory ? '编辑分类' : '添加分类'}
              </h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="请输入分类名称"
                className="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button 
                onClick={saveCategory}
                className="w-full mt-4 bg-teal-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
