'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
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
  sortOrder?: number;
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

// 可编辑单元格组件 - 独立管理编辑状态
function EditableCell({
  value,
  onSave,
  renderDisplay,
  renderEdit,
  editValue,
  setEditValue,
  isEditing,
  onStartEdit,
  onSaveEdit,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
  renderDisplay: () => React.ReactNode;
  renderEdit: () => React.ReactNode;
  editValue: string;
  setEditValue: (v: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onSaveEdit: () => void;
}) {
  if (isEditing) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        {renderEdit()}
      </div>
    );
  }
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onStartEdit();
      }}
      className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
    >
      {renderDisplay()}
    </div>
  );
}

export default function AdminPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [passwords, setPasswords] = useState<VisitorPassword[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 单元格编辑状态: Map<"productId-field", editValue>
  const [editingCells, setEditingCells] = useState<Record<string, string>>({});
  
  // 筛选和排序状态
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSku, setFilterSku] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [filterHidden, setFilterHidden] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState<'sku' | 'name' | 'category' | 'sortOrder' | 'featured'>('sortOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 获取所有唯一标签用于筛选（基于原始产品列表）
  const allTags = Array.from(new Set(products.flatMap(p => p.tags || []))).sort();

  // 筛选和排序后的产品列表
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    // 编号筛选
    if (filterSku) {
      result = result.filter(p => p.sku === filterSku);
    }

    // 名称筛选
    if (filterName) {
      const term = filterName.toLowerCase();
      result = result.filter(p => p.name?.toLowerCase().includes(term));
    }

    // 分类筛选
    if (filterCategory) {
      result = result.filter(p => p.categoryId === filterCategory);
    }

    // 普通标签筛选
    if (filterTag) {
      result = result.filter(p => p.tags && p.tags.includes(filterTag));
    }

    // 精选筛选
    if (filterFeatured) {
      result = result.filter(p => p.featured === filterFeatured);
    }

    // 状态筛选
    if (filterStatus === 'visible') {
      result = result.filter(p => !p.hidden);
    } else if (filterStatus === 'hidden') {
      result = result.filter(p => p.hidden);
    }

    // 排序
    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortBy) {
        case 'sku':
          aVal = a.sku || '';
          bVal = b.sku || '';
          break;
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'category':
          aVal = a.category || '';
          bVal = b.category || '';
          break;
        case 'sortOrder':
          aVal = a.sortOrder ?? 0;
          bVal = b.sortOrder ?? 0;
          break;
        case 'featured':
          aVal = a.featured || '';
          bVal = b.featured || '';
          break;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [products, searchTerm, filterSku, filterName, filterCategory, filterTag, filterFeatured, filterStatus, sortBy, sortDirection]);

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

  // 检查 URL 参数，如果有 productId 则打开对应的编辑模态框
  useEffect(() => {
    if (!loading && products.length > 0) {
      const productId = searchParams.get('productId');
      if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
          setEditingProduct(product);
          setIsModalOpen(true);
        }
      }
    }
  }, [loading, products, searchParams]);

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

  // 开始编辑单元格
  const startCellEdit = (productId: string, field: string, currentValue: string) => {
    setEditingCells(prev => ({ ...prev, [`${productId}-${field}`]: currentValue }));
  };

  // 保存单元格编辑
  const saveCellEdit = async (productId: string, field: string) => {
    const cellKey = `${productId}-${field}`;
    const editValue = editingCells[cellKey];
    if (editValue === undefined) return;
    
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    // 乐观更新：立即更新本地状态
    const updatedProducts = [...products];
    const originalProduct = { ...updatedProducts[productIndex] };
    
    switch (field) {
      case 'sku':
        updatedProducts[productIndex] = { ...updatedProducts[productIndex], sku: editValue };
        break;
      case 'name':
        updatedProducts[productIndex] = { ...updatedProducts[productIndex], name: editValue };
        break;
      case 'sortOrder':
        updatedProducts[productIndex] = { ...updatedProducts[productIndex], sortOrder: parseInt(editValue) || 0 };
        break;
      case 'featured':
        updatedProducts[productIndex] = { ...updatedProducts[productIndex], featured: editValue || null };
        break;
      case 'hidden':
        updatedProducts[productIndex] = { ...updatedProducts[productIndex], hidden: editValue === 'true' };
        break;
      case 'category':
        updatedProducts[productIndex] = { 
          ...updatedProducts[productIndex], 
          categoryId: editValue, 
          category: categories.find(c => c.id === editValue)?.name || '' 
        };
        break;
      case 'tags':
        updatedProducts[productIndex] = { ...updatedProducts[productIndex], tags: editValue.split(',').map(t => t.trim()).filter(Boolean) };
        break;
    }
    
    // 立即更新状态，防止闪烁
    setProducts(updatedProducts);
    
    // 清除编辑状态
    setEditingCells(prev => {
      const next = { ...prev };
      delete next[cellKey];
      return next;
    });
    
    // 准备更新数据
    let updateData: Partial<Product> = {};
    switch (field) {
      case 'sku':
        updateData = { sku: editValue };
        break;
      case 'name':
        updateData = { name: editValue };
        break;
      case 'sortOrder':
        updateData = { sortOrder: parseInt(editValue) || 0 };
        break;
      case 'featured':
        updateData = { featured: editValue || null };
        break;
      case 'hidden':
        updateData = { hidden: editValue === 'true' };
        break;
      case 'category':
        updateData = { categoryId: editValue, category: categories.find(c => c.id === editValue)?.name || '' };
        break;
      case 'tags':
        updateData = { tags: editValue.split(',').map(t => t.trim()).filter(Boolean) };
        break;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: '已保存' });
        // 成功后刷新数据以确保同步
        loadData();
      } else {
        setMessage({ type: 'error', text: '保存失败' });
        // 失败时回滚
        setProducts(prev => prev.map(p => p.id === productId ? originalProduct : p));
      }
    } catch {
      setMessage({ type: 'error', text: '保存失败' });
      // 失败时回滚
      setProducts(prev => prev.map(p => p.id === productId ? originalProduct : p));
    }
    
    setTimeout(() => setMessage(null), 2000);
  };

  // 取消编辑
  const cancelCellEdit = (productId: string, field: string) => {
    setEditingCells(prev => {
      const next = { ...prev };
      delete next[`${productId}-${field}`];
      return next;
    });
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

      {/* 搜索栏 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="搜索产品名称、编号或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          {(searchTerm || filterSku || filterCategory || filterFeatured || filterStatus) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSku('');
                setFilterCategory('');
                setFilterFeatured('');
                setFilterStatus('');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

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

          {/* 移动端水平滚动提示 */}
          <div className="md:hidden text-xs text-gray-400 text-center py-1">
            ← 左右滑动查看更多 →
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-6 md:px-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-600 w-12 md:w-16">序号</th>
                    <th className="px-2 py-6 md:px-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-600 w-20 md:w-24">
                      编号
                      <select
                        value={filterSku}
                        onChange={(e) => setFilterSku(e.target.value)}
                        className="ml-1 px-1 py-0.5 text-xs border border-gray-300 rounded w-14 md:w-auto md:ml-2"
                      >
                        <option value="">全部</option>
                        {Array.from(new Set(products.map(p => p.sku).filter(Boolean))).sort().map(sku => (
                          <option key={sku} value={sku}>{sku}</option>
                        ))}
                      </select>
                    </th>
                    <th className="px-2 py-6 md:px-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-600">
                      名称
                      <input
                        type="text"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder="搜索..."
                        className="ml-1 px-1 py-0.5 text-xs border border-gray-300 rounded w-16 md:w-24 md:ml-2 md:px-2 md:py-1"
                      />
                    </th>
                    <th className="px-2 py-6 md:px-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-600">
                      分类
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="ml-1 px-1 py-0.5 text-xs border border-gray-300 rounded w-14 md:w-auto md:ml-2 md:px-2 md:py-1"
                      >
                        <option value="">全部</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </th>
                    <th className="px-2 py-6 md:px-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-600">
                      标签
                      <select
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="ml-1 px-1 py-0.5 text-xs border border-gray-300 rounded w-12 md:w-auto md:ml-2 md:px-2 md:py-1"
                      >
                        <option value="">全部</option>
                        {allTags.map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                    </th>
                    <th className="px-2 py-6 md:px-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-600">
                      精选
                      <select
                        value={filterFeatured}
                        onChange={(e) => setFilterFeatured(e.target.value)}
                        className="ml-1 px-1 py-0.5 text-xs border border-gray-300 rounded w-10 md:w-auto md:ml-2 md:px-2 md:py-1"
                      >
                        <option value="">全部</option>
                        <option value="精选产品">精选产品</option>
                        <option value="优选产品">优选产品</option>
                      </select>
                    </th>
                    <th className="px-3 py-6 text-left text-sm font-medium text-gray-600">
                      排序
                      <select
                        value={`${sortBy}-${sortDirection}`}
                        onChange={(e) => {
                          const [by, dir] = e.target.value.split('-');
                          setSortBy(by as typeof sortBy);
                          setSortDirection(dir as typeof sortDirection);
                        }}
                        className="ml-1 px-1 py-0.5 text-xs border border-gray-300 rounded w-10 md:w-auto md:ml-2 md:px-2 md:py-1"
                      >
                        <option value="sortOrder-asc">序号↑</option>
                        <option value="sortOrder-desc">序号↓</option>
                        <option value="sku-asc">编号A-Z</option>
                        <option value="sku-desc">编号Z-A</option>
                        <option value="name-asc">名称A-Z</option>
                        <option value="name-desc">名称Z-A</option>
                        <option value="category-asc">分类A-Z</option>
                        <option value="category-desc">分类Z-A</option>
                        <option value="featured-asc">精选A-Z</option>
                        <option value="featured-desc">精选Z-A</option>
                      </select>
                    </th>
                    <th className="px-3 py-6 md:px-3 md:py-4 text-left text-sm font-medium text-gray-600">
                      排序
                      <select
                        value={`${sortBy}-${sortDirection}`}
                        onChange={(e) => {
                          const [by, dir] = e.target.value.split('-');
                          setSortBy(by as typeof sortBy);
                          setSortDirection(dir as typeof sortDirection);
                        }}
                        className="ml-1 px-1 py-0.5 text-xs border border-gray-300 rounded w-10 md:w-auto md:ml-2 md:px-2 md:py-1"
                      >
                        <option value="sortOrder-asc">序号↑</option>
                        <option value="sortOrder-desc">序号↓</option>
                        <option value="sku-asc">编号A-Z</option>
                        <option value="sku-desc">编号Z-A</option>
                        <option value="name-asc">名称A-Z</option>
                        <option value="name-desc">名称Z-A</option>
                        <option value="category-asc">分类A-Z</option>
                        <option value="category-desc">分类Z-A</option>
                        <option value="featured-asc">精选A-Z</option>
                        <option value="featured-desc">精选Z-A</option>
                      </select>
                    </th>
                    <th className="px-2 py-6 md:px-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-600">
                      状态
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="ml-1 px-1 py-0.5 text-xs border border-gray-300 rounded w-12 md:w-auto md:ml-2 md:px-2 md:py-1"
                      >
                        <option value="">全部</option>
                        <option value="visible">可见</option>
                        <option value="hidden">已隐藏</option>
                      </select>
                    </th>
                    <th className="px-2 py-6 md:px-3 md:py-4 text-right text-xs md:text-sm font-medium text-gray-600 w-20 md:w-32">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-2 py-8 md:px-3 md:py-10 text-center text-gray-500 text-sm">暂无产品</td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <tr key={product.id} className={`hover:bg-gray-50 ${product.hidden ? 'bg-gray-100' : ''}`}>
                        {/* 序号 */}
                        <td className="px-2 py-6 md:px-3 md:py-4 text-xs md:text-sm text-gray-600 text-center">{index + 1}</td>
                        
                        {/* 编号 - 可编辑 */}
                        <td className="px-2 py-6 md:px-3 md:py-4 text-xs md:text-sm">
                          {editingCells[`${product.id}-sku`] !== undefined ? (
                            <input
                              type="text"
                              value={editingCells[`${product.id}-sku`]}
                              onChange={(e) => setEditingCells(prev => ({ ...prev, [`${product.id}-sku`]: e.target.value }))}
                              onBlur={() => saveCellEdit(product.id, 'sku')}
                              onKeyDown={(e) => e.key === 'Enter' && saveCellEdit(product.id, 'sku')}
                              autoFocus
                              className="w-full px-1 py-0.5 text-xs md:text-sm border border-blue-400 rounded"
                            />
                          ) : (
                            <div
                              onClick={() => startCellEdit(product.id, 'sku', product.sku || '')}
                              className="cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded"
                            >
                              {product.sku || '-'}
                            </div>
                          )}
                        </td>
                        
                        {/* 名称 - 可编辑 */}
                        <td className="px-2 py-6 md:px-3 md:py-4 text-xs md:text-sm">
                          {editingCells[`${product.id}-name`] !== undefined ? (
                            <input
                              type="text"
                              value={editingCells[`${product.id}-name`]}
                              onChange={(e) => setEditingCells(prev => ({ ...prev, [`${product.id}-name`]: e.target.value }))}
                              onBlur={() => saveCellEdit(product.id, 'name')}
                              onKeyDown={(e) => e.key === 'Enter' && saveCellEdit(product.id, 'name')}
                              autoFocus
                              className="w-full px-1 py-0.5 text-xs md:text-sm border border-blue-400 rounded font-medium"
                            />
                          ) : (
                            <div
                              onClick={() => startCellEdit(product.id, 'name', product.name || '')}
                              className="cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded max-w-[100px] md:max-w-[150px] truncate font-medium"
                            >
                              {product.name}
                            </div>
                          )}
                        </td>
                        
                        {/* 分类 - 可编辑 */}
                        <td className="px-2 py-6 md:px-3 md:py-4 text-xs md:text-sm">
                          {editingCells[`${product.id}-category`] !== undefined ? (
                            <select
                              value={editingCells[`${product.id}-category`]}
                              onChange={(e) => setEditingCells(prev => ({ ...prev, [`${product.id}-category`]: e.target.value }))}
                              onBlur={() => saveCellEdit(product.id, 'category')}
                              onKeyDown={(e) => e.key === 'Enter' && saveCellEdit(product.id, 'category')}
                              autoFocus
                              className="px-1 py-0.5 text-xs md:text-sm border border-blue-400 rounded"
                            >
                              <option value="">无分类</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          ) : (
                            <div
                              onClick={() => startCellEdit(product.id, 'category', product.categoryId || '')}
                              className="cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded max-w-[60px] md:max-w-[100px] truncate"
                            >
                              {product.category || '-'}
                            </div>
                          )}
                        </td>
                        
                        {/* 标签 - 可编辑 */}
                        <td className="px-2 py-6 md:px-3 md:py-4 text-xs md:text-sm">
                          {editingCells[`${product.id}-tags`] !== undefined ? (
                            <input
                              type="text"
                              value={editingCells[`${product.id}-tags`]}
                              onChange={(e) => setEditingCells(prev => ({ ...prev, [`${product.id}-tags`]: e.target.value }))}
                              onBlur={() => saveCellEdit(product.id, 'tags')}
                              onKeyDown={(e) => e.key === 'Enter' && saveCellEdit(product.id, 'tags')}
                              autoFocus
                              placeholder="标签1, 标签2, 标签3"
                              className="w-full px-1 py-0.5 text-xs md:text-sm border border-blue-400 rounded"
                            />
                          ) : (
                            <div
                              onClick={() => startCellEdit(product.id, 'tags', (product.tags || []).join(', '))}
                              className="cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded"
                            >
                              {product.tags && product.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-0.5 md:gap-1">
                                  {product.tags.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="px-1 py-0.5 text-xs rounded bg-gray-100 text-gray-600">{tag}</span>
                                  ))}
                                  {product.tags.length > 2 && (
                                    <span className="px-1 py-0.5 text-xs rounded bg-gray-100 text-gray-500">+{product.tags.length - 2}</span>
                                  )}
                                </div>
                              ) : '-'}
                            </div>
                          )}
                        </td>
                        
                        {/* 精选 - 可编辑 */}
                        <td className="px-2 py-6 md:px-3 md:py-4 text-xs md:text-sm">
                          {editingCells[`${product.id}-featured`] !== undefined ? (
                            <select
                              value={editingCells[`${product.id}-featured`]}
                              onChange={(e) => setEditingCells(prev => ({ ...prev, [`${product.id}-featured`]: e.target.value }))}
                              onBlur={() => saveCellEdit(product.id, 'featured')}
                              onKeyDown={(e) => e.key === 'Enter' && saveCellEdit(product.id, 'featured')}
                              autoFocus
                              className="px-1 py-0.5 text-xs md:text-sm border border-blue-400 rounded"
                            >
                              <option value="">无</option>
                              <option value="精选产品">精选产品</option>
                              <option value="优选产品">优选产品</option>
                            </select>
                          ) : (
                            <div
                              onClick={() => startCellEdit(product.id, 'featured', product.featured || '')}
                              className="cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded inline-block"
                            >
                              {product.featured ? (
                                <span className="px-1 py-0.5 text-xs rounded bg-amber-100 text-amber-700">{product.featured}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          )}
                        </td>
                        
                        {/* 排序 - 可编辑 */}
                        <td className="px-2 py-6 md:px-3 md:py-4 text-xs md:text-sm">
                          {editingCells[`${product.id}-sortOrder`] !== undefined ? (
                            <input
                              type="number"
                              value={editingCells[`${product.id}-sortOrder`]}
                              onChange={(e) => setEditingCells(prev => ({ ...prev, [`${product.id}-sortOrder`]: e.target.value }))}
                              onBlur={() => saveCellEdit(product.id, 'sortOrder')}
                              onKeyDown={(e) => e.key === 'Enter' && saveCellEdit(product.id, 'sortOrder')}
                              autoFocus
                              className="w-12 md:w-16 px-1 py-0.5 text-xs md:text-sm border border-blue-400 rounded text-center"
                            />
                          ) : (
                            <div
                              onClick={() => startCellEdit(product.id, 'sortOrder', String(product.sortOrder ?? 0))}
                              className="cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded text-center"
                            >
                              {product.sortOrder ?? '-'}
                            </div>
                          )}
                        </td>
                        
                        {/* 状态 - 可切换 */}
                        <td className="px-2 py-6 md:px-3 md:py-4 text-xs md:text-sm">
                          <button
                            onClick={() => handleToggleHidden(product)}
                            className={`px-1 py-0.5 md:px-2 md:py-1 text-xs rounded cursor-pointer hover:opacity-80 ${product.hidden ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                          >
                            {product.hidden ? '隐藏' : '可见'}
                          </button>
                        </td>
                        
                        {/* 操作 */}
                        <td className="px-2 py-6 md:px-3 md:py-4 text-right">
                          <div className="flex justify-end gap-1 md:gap-2">
                            <button
                              onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                              className="px-2 py-1 md:px-3 md:py-1 text-blue-600 hover:bg-blue-50 rounded text-xs md:text-sm font-medium"
                              title="编辑详情"
                            >
                              详情
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="px-2 py-1 md:px-3 md:py-1 text-red-600 hover:bg-red-50 rounded text-xs md:text-sm font-medium"
                              title="删除产品"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
    sortOrder: 0,
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
      sortOrder: product?.sortOrder || 0,
    });
  }, [product]);

  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: 'uploading' | 'success' | 'error' }>({});
  const [uploadingVideos, setUploadingVideos] = useState<{ [key: string]: 'uploading' | 'success' | 'error' }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  // 检测是否为移动端
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Supabase客户端
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseRef = useRef<SupabaseClient | null>(null);
  
  const getSupabaseClient = () => {
    if (!supabaseRef.current && supabaseUrl && supabaseAnonKey) {
      supabaseRef.current = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseRef.current;
  };

  const uploadFile = async (file: File, type: 'images' | 'videos'): Promise<UploadResult> => {
    const bucketId = type === 'videos' ? 'product-videos' : 'product-images';
    
    // 验证文件大小
    const maxSize = type === 'videos' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, message: `文件大小超过${type === 'videos' ? '100MB' : '10MB'}限制` };
    }
    
    // 验证文件类型
    const allowedTypes = type === 'videos' 
      ? ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
      : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return { success: false, message: `不支持的文件类型: ${file.type}` };
    }
    
    // 生成唯一文件名
    const ext = file.name.split('.').pop() || (type === 'videos' ? 'mp4' : 'jpg');
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    
    try {
      const client = getSupabaseClient();
      if (!client) {
        return { success: false, message: 'Supabase客户端未初始化' };
      }
      
      // 直接上传到Supabase Storage
      const { data, error } = await client.storage
        .from(bucketId)
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });
      
      if (error) {
        console.error('上传失败:', error);
        return { success: false, message: `上传失败: ${error.message}` };
      }
      
      // 获取公开URL
      const { data: urlData } = client.storage.from(bucketId).getPublicUrl(fileName);
      
      return {
        success: true,
        url: urlData.publicUrl,
        path: fileName,
      };
    } catch (error: any) {
      console.error('上传错误:', error);
      return { success: false, message: error?.message || '上传失败' };
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小 (限制10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('封面图片超过10MB限制');
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    setUploadingImages(prev => ({ ...prev, cover: 'uploading' }));
    const result = await uploadFile(file, 'images');
    
    if (result.success && result.url) {
      setForm(prev => ({ ...prev, coverImage: result.url! }));
      setUploadingImages(prev => ({ ...prev, cover: 'success' }));
    } else {
      setUploadError(result.message || '封面上传失败');
      setUploadingImages(prev => ({ ...prev, cover: 'error' }));
    }
    
    setTimeout(() => {
      setUploadingImages(prev => {
        const newState = { ...prev };
        delete newState.cover;
        return newState;
      });
      setUploadError(null);
    }, 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadError(null);
    const newUrls: string[] = [];
    let hasError = false;
    
    for (const file of files) {
      // 检查文件大小 (限制10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`图片 "${file.name}" 超过10MB限制`);
        hasError = true;
        continue;
      }
      
      const key = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setUploadingImages(prev => ({ ...prev, [key]: 'uploading' }));
      
      const result = await uploadFile(file, 'images');
      if (result.success && result.url) {
        newUrls.push(result.url);
        setUploadingImages(prev => ({ ...prev, [key]: 'success' }));
      } else {
        hasError = true;
        setUploadError(result.message || '图片上传失败');
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
      setUploadError(null);
    }
    
    if (hasError) {
      setTimeout(() => setUploadError(null), 3000);
    }
    
    // 清除input值
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    setUploadError(null);
    const newUrls: string[] = [];
    let hasError = false;
    
    for (const file of files) {
      // 检查文件大小 (限制100MB)
      if (file.size > 100 * 1024 * 1024) {
        setUploadError(`文件 "${file.name}" 超过100MB限制`);
        continue;
      }
      
      // 检查文件类型
      if (!file.type.startsWith('video/')) {
        setUploadError(`"${file.name}" 不是有效的视频文件`);
        continue;
      }
      
      const key = `vid_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setUploadingVideos(prev => ({ ...prev, [key]: 'uploading' }));
      
      const result = await uploadFile(file, 'videos');
      if (result.success && result.url) {
        newUrls.push(result.url);
        setUploadingVideos(prev => ({ ...prev, [key]: 'success' }));
      } else {
        hasError = true;
        setUploadError(result.message || '视频上传失败');
        setUploadingVideos(prev => ({ ...prev, [key]: 'error' }));
      }
      
      // 2秒后清除状态
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
      setUploadError(null);
    }
    
    // 3秒后清除错误提示
    if (hasError) {
      setTimeout(() => setUploadError(null), 3000);
    }
    
    // 清除input值，允许重复选择同一文件
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序（数字越小越靠前）</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="0"
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
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 md:py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors mb-2"
              disabled={Object.values(uploadingVideos).includes('uploading')}
            >
              {Object.values(uploadingVideos).includes('uploading') ? (
                <><Loader2 size={14} className="animate-spin" /> 上传中...</>
              ) : (
                <><Video size={14} /> 添加视频</>
              )}
            </button>
            
            {/* 错误提示 */}
            {uploadError && (
              <div className="mb-2 px-2 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                {uploadError}
              </div>
            )}
            
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
            <p className="text-xs text-gray-500 mt-1">支持 MP4、WebM 格式，最大 100MB</p>
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
