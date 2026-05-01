'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Video, Loader2, Check, AlertCircle } from 'lucide-react';

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
  hidden?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  message?: string;
}

interface VisitorPassword {
  id: string;
  password: string;
  description: string;
  created_at: string;
}

export default function AdminPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [passwords, setPasswords] = useState<VisitorPassword[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // 只有加载完成后才判断，未加载时保持当前页面
    if (isLoading) return;
    // 只有非管理员或未登录才跳转
    if (!isAuthenticated || !isAdmin) {
      router.push('/gallery');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadData();
    }
  }, [isAuthenticated, isAdmin]);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, passwordsRes] = await Promise.all([
        fetch('/api/products?includeHidden=true').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/passwords').then(r => r.json())
      ]);
      if (productsRes.success) setProducts(productsRes.products || []);
      if (categoriesRes.success) setCategories(categoriesRes.categories || []);
      if (passwordsRes.success) setPasswords(passwordsRes.passwords || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？此操作不可恢复！')) return;
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

  const handleToggleHidden = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: !product.hidden })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: product.hidden ? '产品已显示' : '产品已隐藏' 
        });
        loadData();
      } else {
        setMessage({ type: 'error', text: '操作失败' });
      }
    } catch {
      setMessage({ type: 'error', text: '操作失败' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProduct = async (product: Partial<Product>) => {
    try {
      const url = editingProduct?.id && editingProduct?.id !== ''
        ? `/api/products/${editingProduct.id}` 
        : '/api/products';
      const method = editingProduct?.id && editingProduct?.id !== '' ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: editingProduct?.id ? '产品已更新' : '产品已创建' });
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

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">正在跳转...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingProduct({
              id: '',
              sku: '',
              name: '',
              tags: [],
              description: '',
              category: '',
              categoryId: '',
              coverImage: '',
              images: [],
              videos: [],
              featured: null,
              location: '',
              hidden: false
            }); setIsModalOpen(true); }}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            添加产品
          </button>
          <button
            onClick={() => router.push('/gallery')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            返回
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">加载中...</div>
      ) : (
        <>
          {/* 分类管理 */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">分类管理</h2>
              <button
                onClick={() => {
                  const name = prompt('请输入新分类名称：');
                  if (name?.trim()) {
                    const id = name.trim().toLowerCase().replace(/\s+/g, '-');
                    fetch('/api/categories', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id, name: name.trim(), description: '' })
                    }).then(r => r.json()).then(data => {
                      if (data.success) {
                        setCategories(prev => [...prev, { id, name: name.trim(), description: '' }]);
                        setMessage({ type: 'success', text: '分类已添加' });
                      } else {
                        setMessage({ type: 'error', text: '添加失败' });
                      }
                    });
                  }
                }}
                className="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                添加分类
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <button
                    onClick={() => {
                      const newName = prompt('请输入新的分类名称：', cat.name);
                      if (newName?.trim() && newName !== cat.name) {
                        fetch(`/api/categories/${cat.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: newName.trim() })
                        }).then(r => r.json()).then(data => {
                          if (data.success) {
                            setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: newName.trim() } : c));
                            setMessage({ type: 'success', text: '分类已更新' });
                          }
                        });
                      }
                    }}
                    className="text-gray-500 hover:text-blue-600"
                    title="编辑分类"
                  >
                    <span className="text-xs">编辑</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 访客密码管理 */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">访客密码管理</h2>
              <button
                onClick={() => {
                  const password = prompt('请输入新访客密码：');
                  if (password?.trim()) {
                    const description = prompt('请输入密码描述（可选）：') || '';
                    fetch('/api/passwords', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ password: password.trim(), description })
                    }).then(r => r.json()).then(data => {
                      if (data.success) {
                        loadData();
                        setMessage({ type: 'success', text: '密码已添加' });
                      } else {
                        setMessage({ type: 'error', text: data.message || '添加失败' });
                      }
                    });
                  }
                }}
                className="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                添加密码
              </button>
            </div>
            <div className="space-y-2">
              {passwords.map(pwd => (
                <div key={pwd.id} className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{pwd.password}</span>
                    {pwd.description && (
                      <span className="ml-2 text-xs text-gray-500">({pwd.description})</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (passwords.length <= 1) {
                        setMessage({ type: 'error', text: '至少需要保留一个访客密码' });
                        return;
                      }
                      if (confirm('确定要删除这个密码吗？')) {
                        fetch(`/api/passwords?id=${pwd.id}`, { method: 'DELETE' })
                          .then(r => r.json())
                          .then(data => {
                            if (data.success) {
                              setPasswords(prev => prev.filter(p => p.id !== pwd.id));
                              setMessage({ type: 'success', text: '密码已删除' });
                            } else {
                              setMessage({ type: 'error', text: '删除失败' });
                            }
                          });
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 w-20">图片</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">编号</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">名称</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">分类</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">位置</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">标签</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 w-20">状态</th>
                    <th className="px-3 py-3 text-right text-sm font-medium text-gray-600 w-48">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className={`hover:bg-gray-50 ${product.hidden ? 'bg-gray-100' : ''}`}>
                      <td className="px-3 py-3">
                        <div className="relative w-12 h-16 bg-gray-200 rounded overflow-hidden">
                          <Image
                            src={product.coverImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">{product.sku}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 font-medium max-w-[150px] truncate">{product.name}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{product.category}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{product.location || '-'}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {product.featured && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded whitespace-nowrap">
                              {product.featured}
                            </span>
                          )}
                          {product.tags?.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded whitespace-nowrap">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${product.hidden ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {product.hidden ? '已隐藏' : '可见'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                          className="text-blue-600 hover:text-blue-800 mr-2 text-sm"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleToggleHidden(product)}
                          className={`text-sm mr-2 ${product.hidden ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}`}
                        >
                          {product.hidden ? '显示' : '隐藏'}
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
        </>
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
    id: '',
    sku: '',
    name: '',
    tags: '',
    description: '',
    category: '',
    categoryId: '',
    coverImage: '',
    images: '',
    videos: '',
    featured: '',
    location: '',
    hidden: false,
  });

  // 当 product prop 更新时，重置表单
  useEffect(() => {
    setForm({
      id: product?.id || '',
      sku: product?.sku || '',
      name: product?.name || '',
      tags: product?.tags?.join(', ') || '',
      description: product?.description || '',
      category: product?.category || '',
      categoryId: product?.categoryId || '',
      coverImage: product?.coverImage || '',
      images: product?.images?.join('\n') || '',
      videos: product?.videos?.map(v => v.url).join('\n') || '',
      featured: product?.featured || '',
      location: product?.location || '',
      hidden: product?.hidden || false,
    });
  }, [product]);

  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: 'uploading' | 'success' | 'error' }>({});
  const [uploadingVideos, setUploadingVideos] = useState<{ [key: string]: 'uploading' | 'success' | 'error' }>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, type: 'images' | 'videos'): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      return await res.json();
    } catch (error) {
      return { success: false, message: '上传失败' };
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImages(prev => ({ ...prev, cover: 'uploading' }));
    const result = await uploadFile(file, 'images');
    
    if (result.success && result.url) {
      setForm(prev => ({ ...prev, coverImage: result.url! }));
      setUploadingImages(prev => ({ ...prev, cover: 'success' }));
    } else {
      setUploadingImages(prev => ({ ...prev, cover: 'error' }));
    }
    
    setTimeout(() => setUploadingImages(prev => {
      const newState = { ...prev };
      delete newState.cover;
      return newState;
    }), 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newUrls: string[] = [];
    
    for (const file of files) {
      const key = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setUploadingImages(prev => ({ ...prev, [key]: 'uploading' }));
      
      const result = await uploadFile(file, 'images');
      if (result.success && result.url) {
        newUrls.push(result.url);
        setUploadingImages(prev => ({ ...prev, [key]: 'success' }));
      } else {
        setUploadingImages(prev => ({ ...prev, [key]: 'error' }));
      }
      
      setTimeout(() => setUploadingImages(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      }), 2000);
    }

    if (newUrls.length > 0) {
      const currentImages = form.images.split('\n').filter(Boolean);
      setForm(prev => ({
        ...prev,
        images: [...currentImages, ...newUrls].join('\n')
      }));
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newUrls: string[] = [];
    
    for (const file of files) {
      const key = `vid_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setUploadingVideos(prev => ({ ...prev, [key]: 'uploading' }));
      
      const result = await uploadFile(file, 'videos');
      if (result.success && result.url) {
        newUrls.push(result.url);
        setUploadingVideos(prev => ({ ...prev, [key]: 'success' }));
      } else {
        setUploadingVideos(prev => ({ ...prev, [key]: 'error' }));
      }
      
      setTimeout(() => setUploadingVideos(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      }), 2000);
    }

    if (newUrls.length > 0) {
      const currentVideos = form.videos.split('\n').filter(Boolean);
      setForm(prev => ({
        ...prev,
        videos: [...currentVideos, ...newUrls].join('\n')
      }));
    }
  };

  const removeImage = (index: number) => {
    const images = form.images.split('\n').filter(Boolean);
    images.splice(index, 1);
    setForm(prev => ({ ...prev, images: images.join('\n') }));
  };

  const removeVideo = (index: number) => {
    const videos = form.videos.split('\n').filter(Boolean);
    videos.splice(index, 1);
    setForm(prev => ({ ...prev, videos: videos.join('\n') }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCategory = categories.find(c => c.id === form.categoryId);
    onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: form.images.split('\n').map(i => i.trim()).filter(Boolean),
      videos: form.videos.split('\n').map(v => v.trim()).filter(Boolean).map(url => ({ url, thumbnail: '' })),
      category: selectedCategory?.name || form.category,
      featured: form.featured || null,
    });
  };

  const currentImages = form.images.split('\n').filter(Boolean);
  const currentVideos = form.videos.split('\n').filter(Boolean);
  const isUploading = Object.values(uploadingImages).includes('uploading') || Object.values(uploadingVideos).includes('uploading');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">{product?.id ? '编辑产品' : '添加产品'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">产品ID（唯一标识）</label>
              <input
                type="text"
                value={form.id}
                onChange={e => setForm({ ...form, id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="如: product-001"
                required
                disabled={!!product?.id}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">编号（显示用）</label>
              <input
                type="text"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="如: LIVING-001"
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

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">精选标签（可自定义）</label>
              <input
                type="text"
                value={form.featured}
                onChange={e => setForm({ ...form, featured: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="如: 精选产品、优选产品、新品等"
              />
              <p className="text-xs text-gray-500 mt-1">留空则不显示标签</p>
            </div>
          </div>

          {/* 封面图上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面图</label>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="flex items-center gap-3">
              {form.coverImage ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <Image src={form.coverImage} alt="封面" fill className="object-cover" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 transition-colors"
                >
                  <ImageIcon size={24} />
                  <span className="text-xs mt-1">上传</span>
                </button>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  disabled={uploadingImages.cover === 'uploading'}
                >
                  {uploadingImages.cover === 'uploading' ? (
                    <><Loader2 size={14} className="animate-spin" /> 上传中...</>
                  ) : uploadingImages.cover === 'success' ? (
                    <><Check size={14} className="text-green-600" /> 上传成功</>
                  ) : uploadingImages.cover === 'error' ? (
                    <><AlertCircle size={14} className="text-red-600" /> 上传失败</>
                  ) : (
                    <><Upload size={14} /> 选择封面图</>
                  )}
                </button>
                <span className="text-xs text-gray-500">支持 JPG、PNG、WebP</span>
              </div>
            </div>
          </div>

          {/* 产品图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">产品图片</label>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors mb-2"
              disabled={Object.values(uploadingImages).includes('uploading')}
            >
              {Object.values(uploadingImages).includes('uploading') ? (
                <><Loader2 size={14} className="animate-spin" /> 上传中...</>
              ) : (
                <><Upload size={14} /> 添加图片</>
              )}
            </button>
            
            {currentImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {currentImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-20 rounded-lg overflow-hidden border">
                      <Image src={url} alt={`图片 ${index + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">支持多选，支持 JPG、PNG、WebP</p>
          </div>

          {/* 产品视频上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">产品视频</label>
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors mb-2"
              disabled={Object.values(uploadingVideos).includes('uploading')}
            >
              {Object.values(uploadingVideos).includes('uploading') ? (
                <><Loader2 size={14} className="animate-spin" /> 上传中...</>
              ) : (
                <><Upload size={14} /> 添加视频</>
              )}
            </button>
            
            {currentVideos.length > 0 && (
              <div className="space-y-2">
                {currentVideos.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group">
                    <Video size={16} className="text-gray-400" />
                    <span className="flex-1 text-sm text-gray-600 truncate">{url.split('/').pop()}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">支持 MP4、WebM 格式</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hidden"
              checked={form.hidden}
              onChange={e => setForm({ ...form, hidden: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="hidden" className="text-sm text-gray-700">隐藏此产品（访客不可见）</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <><Loader2 size={16} className="animate-spin" /> 上传中，请稍候...</>
              ) : (
                '保存'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
