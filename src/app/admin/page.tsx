'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  sku: string;
  name: string;
  tags: string[];
  description: string;
  category: string;
  categoryId: string;
  coverImage: string;
  images: string[];
  videos: { url: string; thumbnail: string }[];
  featured: string | null;
  location: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/gallery');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json())
      ]);
      if (productsRes.success) setProducts(productsRes.products || []);
      if (categoriesRes.success) setCategories(categoriesRes.categories || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: '产品已删除' });
        loadData();
      } else {
        setMessage({ type: 'error', text: '删除失败' });
      }
    } catch {
      setMessage({ type: 'error', text: '删除失败' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProduct = async (product: Partial<Product>) => {
    try {
      const url = editingProduct?.id 
        ? `/api/products/${editingProduct.id}` 
        : '/api/products';
      const method = editingProduct?.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: editingProduct ? '产品已更新' : '产品已创建' });
        setIsModalOpen(false);
        setEditingProduct(null);
        loadData();
      } else {
        setMessage({ type: 'error', text: data.message || '保存失败' });
      }
    } catch {
      setMessage({ type: 'error', text: '保存失败' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: '分类已删除' });
        loadData();
      } else {
        setMessage({ type: 'error', text: data.message || '删除失败' });
      }
    } catch {
      setMessage({ type: 'error', text: '删除失败' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveCategory = async (category: Partial<Category>) => {
    try {
      const url = '/api/categories';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: '分类已创建' });
        loadData();
      } else {
        setMessage({ type: 'error', text: data.message || '保存失败' });
      }
    } catch {
      setMessage({ type: 'error', text: '保存失败' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">正在跳转...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
        <button
          onClick={() => router.push('/gallery')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          返回
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          产品管理
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          分类管理
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">加载中...</div>
      ) : activeTab === 'products' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditingProduct({} as Product); setIsModalOpen(true); }}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              添加产品
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">编号</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">名称</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">分类</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">位置</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">标签</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.location || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {product.featured && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                              {product.featured}
                            </span>
                          )}
                          {product.tags?.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                          className="text-blue-600 hover:text-blue-800 mr-3 text-sm"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                const name = prompt('分类名称:');
                if (name) {
                  handleSaveCategory({ id: name.toLowerCase().replace(/\s+/g, '-'), name, description: '' });
                }
              }}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              添加分类
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">名称</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{cat.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{cat.name}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
}

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onSave: (product: Partial<Product>) => void;
  onClose: () => void;
}

function ProductModal({ product, categories, onSave, onClose }: ProductModalProps) {
  const [form, setForm] = useState({
    id: product?.id || '',
    sku: product?.sku || '',
    name: product?.name || '',
    tags: product?.tags?.join(', ') || '',
    description: product?.description || '',
    category: product?.category || '',
    categoryId: product?.categoryId || '',
    coverImage: product?.coverImage || '',
    images: product?.images?.join('\n') || '',
    featured: product?.featured || '',
    location: product?.location || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCategory = categories.find(c => c.id === form.categoryId);
    onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: form.images.split('\n').map(i => i.trim()).filter(Boolean),
      category: selectedCategory?.name || form.category,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">{product?.id ? '编辑产品' : '添加产品'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">关闭</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">产品ID</label>
              <input
                type="text"
                value={form.id}
                onChange={e => setForm({ ...form, id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                required
                disabled={!!product?.id}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">编号</label>
              <input
                type="text"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">产品名称</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                required
              >
                <option value="">选择分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="如: A区-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="如: 沙发, 客厅, 简约"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">精选标签</label>
            <select
              value={form.featured}
              onChange={e => setForm({ ...form, featured: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="">无</option>
              <option value="精选产品">精选产品</option>
              <option value="优选产品">优选产品</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面图URL</label>
            <input
              type="text"
              value={form.coverImage}
              onChange={e => setForm({ ...form, coverImage: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图片URL（每行一个）</label>
            <textarea
              value={form.images}
              onChange={e => setForm({ ...form, images: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 h-32"
              placeholder="每行一个图片URL"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
