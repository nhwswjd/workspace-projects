'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  category_id?: string;
  coverImage?: string;
  cover_image?: string;
  images?: string[];
  tags?: string[];
  featured?: string | null;
  featuredRightBottom?: string | null;
  location?: string;
  hidden?: boolean;
  sortOrder?: number;
  sort_order?: number; // 兼容数据库字段
  updated_at?: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  sort_order?: number;
}

// 解析密码字符串为数组
const parsePasswords = (value: string): string[] => {
  if (!value) return [];
  if (value.startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      // 处理双重转义
      const fixed = value.replace(/\\"/g, '"');
      const reParsed = JSON.parse(fixed);
      return Array.isArray(reParsed) ? reParsed : [];
    } catch {
      return [];
    }
  }
  if (value.includes(',')) return value.split(',').filter(Boolean);
  return value ? [value] : [];
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings' | 'backup' | 'tags'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string; sort_order: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'category'; id: string; name: string } | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [siteName, setSiteName] = useState('江南风景好');
  const [adminPasswords, setAdminPasswords] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [visitorPasswords, setVisitorPasswords] = useState<string[]>([]);
  const [newVisitorPassword, setNewVisitorPassword] = useState('');
  const [randomRules, setRandomRules] = useState<{ id: number; from: number; to: number; createdAt: string }[]>([]);
  const [randomFrom, setRandomFrom] = useState('');
  const [randomTo, setRandomTo] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(true);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id?: string; name: string } | null>(null);
  const [tagName, setTagName] = useState("");
  const { isAuthenticated, isAdmin, isSuperAdmin, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/';
      return;
    }
    if (!authLoading && isAuthenticated && !isAdmin) {
      window.location.href = '/';
      return;
    }
    if (!authLoading && isAuthenticated && isAdmin) {
      loadData();
    }
  }, [authLoading, isAuthenticated, isAdmin, isSuperAdmin]);

  const loadData = async () => {
    try {
      // 根据权限决定是否加载管理员密码
      const requests: Promise<any>[] = [
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/site-settings/brand_name').then(r => r.json()).catch(() => ({ value: '江南风景好' })),
        fetch('/api/site-settings/visitor_password').then(r => r.json()).catch(() => ({ value: '' })),
        fetch('/api/site-settings/random-sort-rules').then(r => r.json()).catch(() => ({ rules: [] })),
        fetch('/api/tags').then(r => r.json()).catch(() => ({ tags: [] })),
      ];
      
      // 只有超级管理员才加载管理员密码
      if (isSuperAdmin) {
        requests.push(fetch('/api/site-settings/admin_password').then(r => r.json()).catch(() => ({ value: '' })));
      }
      
      const results = await Promise.all(requests);
      
      const productsRes = results[0];
      const categoriesRes = results[1];
      const brandRes = results[2];
      const visitorPwdRes = results[3];
      const rulesRes = results[4];
      
      if (productsRes.products) setProducts(productsRes.products);
      if (categoriesRes.categories) setCategories(categoriesRes.categories);
      if (brandRes.value) setSiteName(brandRes.value);
      
      // 加载标签
      const tagsRes = results[5];
      if (tagsRes?.tags) setTags(tagsRes.tags);
      
      // 只有超级管理员才解析管理员密码
      if (isSuperAdmin && results[6]?.value) {
        const passwords = parsePasswords(results[6].value);
        if (passwords.length > 0) {
          setAdminPasswords(passwords);
        }
      }
      // 加载访客密码
      if (visitorPwdRes.value) {
        const passwords = parsePasswords(visitorPwdRes.value);
        if (passwords.length > 0) {
          setVisitorPasswords(passwords);
        }
      }
      // 加载随机排序规则
      if (rulesRes.rules) {
        setRandomRules(rulesRes.rules);
      }
    } catch (err) {
      console.error('加载数据失败', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleDelete = (type: 'product' | 'category', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setShowDeleteModal(true);
  };

  const handleToggleHidden = async (product: Product) => {
    const newHidden = !product.hidden;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          hidden: newHidden
        })
      });
      
      if (res.ok) {
        setProducts(products.map(p => 
          p.id === product.id ? { ...p, hidden: newHidden } : p
        ));
        showToast(newHidden ? '已隐藏' : '已显示');
      } else {
        showToast('操作失败', 'error');
      }
    } catch {
      showToast('操作失败', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      const endpoint = deleteTarget.type === 'product' ? `/api/products/${deleteTarget.id}` : `/api/categories/${deleteTarget.id}`;
      await fetch(endpoint, { method: 'DELETE' });
      
      if (deleteTarget.type === 'product') {
        setProducts(products.filter(p => p.id !== deleteTarget.id));
      } else {
        setCategories(categories.filter(c => c.id !== deleteTarget.id));
      }
      
      showToast(`删除成功`);
    } catch (err) {
      showToast('删除失败', 'error');
    }
    
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      showToast('请输入分类名称', 'error');
      return;
    }

    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      });

      if (res.ok) {
        loadData();
        showToast(editingCategory ? '修改成功' : '添加成功');
      } else {
        showToast('操作失败', 'error');
      }
    } catch (err) {
      showToast('操作失败', 'error');
    }

    setShowCategoryModal(false);
    setCategoryName('');
    setEditingCategory(null);
  };

  const handleAddPassword = () => {
    if (newPassword.trim()) {
      setAdminPasswords([...adminPasswords, newPassword.trim()]);
      setNewPassword('');
    }
  };

  const handleRemovePassword = (index: number) => {
    setAdminPasswords(adminPasswords.filter((_, i) => i !== index));
  };

  const handleAddVisitorPassword = () => {
    if (newVisitorPassword.trim()) {
      setVisitorPasswords([...visitorPasswords, newVisitorPassword.trim()]);
      setNewVisitorPassword('');
    }
  };

  const handleRemoveVisitorPassword = (index: number) => {
    setVisitorPasswords(visitorPasswords.filter((_, i) => i !== index));
  };

  // 执行随机排序
  const handleRandomSort = async () => {
    const from = parseInt(randomFrom);
    const to = parseInt(randomTo);
    
    if (!from || !to || from < 1 || to < from) {
      showToast('请输入有效的范围', 'error');
      return;
    }
    
    try {
      const res = await fetch('/api/products/random-sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to }),
      });
      const data = await res.json();
      
      if (data.success) {
        showToast(`已将第${from}-${to}个产品随机排序`);
        setRandomFrom('');
        setRandomTo('');
        // 刷新产品列表
        const productsRes = await fetch('/api/products').then(r => r.json());
        if (productsRes.products) setProducts(productsRes.products);
      } else {
        showToast(data.error || '操作失败', 'error');
      }
    } catch {
      showToast('操作失败', 'error');
    }
  };

  // 删除随机排序规则
  const handleDeleteRandomRule = async (ruleId: number) => {
    const updatedRules = randomRules.filter(r => r.id !== ruleId);
    try {
      await fetch('/api/site-settings/random-sort-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: updatedRules }),
      });
      setRandomRules(updatedRules);
      showToast('规则已删除');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const handleAddTag = () => {
    setEditingTag(null);
    setTagName('');
    setShowTagModal(true);
  };

  const handleEditTag = (tag: { id: string; name: string }) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setShowTagModal(true);
  };

  const handleSaveTag = async () => {
    if (!tagName.trim()) {
      showToast('请输入标签名称', 'error');
      return;
    }
    try {
      const url = editingTag ? '/api/tags' : '/api/tags';
      const method = editingTag ? 'PUT' : 'POST';
      const body = editingTag 
        ? JSON.stringify({ id: editingTag.id, name: tagName.trim() })
        : JSON.stringify({ name: tagName.trim() });

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      
      if (res.ok) {
        const data = await res.json();
        if (editingTag) {
          setTags(tags.map(t => t.id === editingTag.id ? data.tag : t));
        } else {
          setTags([...tags, data.tag]);
        }
        setShowTagModal(false);
        showToast(editingTag ? '标签已更新' : '标签已添加');
      } else {
        const error = await res.json();
        showToast(error.error || '操作失败', 'error');
      }
    } catch {
      showToast('操作失败', 'error');
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    try {
      const res = await fetch(`/api/tags?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTags(tags.filter(t => t.id !== id));
        showToast('标签已删除');
      } else {
        showToast('删除失败', 'error');
      }
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const requests: Promise<Response>[] = [
        fetch('/api/site-settings/brand_name', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: siteName }),
        }),
      ];
      
      // 超级管理员可以保存所有密码
      if (isSuperAdmin) {
        requests.push(
          fetch('/api/site-settings/admin_password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: JSON.stringify(adminPasswords) }),
          })
        );
      }
      
      // 超级管理员和管理员都可以保存访客密码
      requests.push(
        fetch('/api/site-settings/visitor_password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: JSON.stringify(visitorPasswords) }),
        })
      );
      
      await Promise.all(requests);
      showToast('设置已保存');
    } catch (err) {
      showToast('保存失败', 'error');
    }
  };

  const handleBackup = async () => {
    showToast('备份功能开发中...');
  };

  // 按 sortOrder 排序的产品列表
  const filteredProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const aOrder = a.sortOrder ?? 999;
      const bOrder = b.sortOrder ?? 999;
      return aOrder - bOrder;
    });

  // 前移产品
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const currentProduct = filteredProducts[index];
    const prevProduct = filteredProducts[index - 1];
    
    try {
      // 前移：当前产品排到前一个之前
      const newSort = (prevProduct.sortOrder ?? 0) - 1;
      
      await fetch(`/api/products/${currentProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentProduct, sortOrder: newSort })
      });
      
      // 更新本地状态
      setProducts(products.map(p => 
        p.id === currentProduct.id ? { ...p, sortOrder: newSort } : p
      ));
      
      showToast('已上移');
    } catch {
      showToast('操作失败', 'error');
    }
  };

  // 后移产品
  const handleMoveDown = async (index: number) => {
    if (index === filteredProducts.length - 1) return;
    const currentProduct = filteredProducts[index];
    const nextProduct = filteredProducts[index + 1];
    
    try {
      // 后移：当前产品排到后一个之后
      const newSort = (nextProduct.sortOrder ?? 0) + 1;
      
      await fetch(`/api/products/${currentProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentProduct, sortOrder: newSort })
      });
      
      // 更新本地状态
      setProducts(products.map(p => 
        p.id === currentProduct.id ? { ...p, sortOrder: newSort } : p
      ));
      
      showToast('已下移');
    } catch {
      showToast('操作失败', 'error');
    }
  };

  const tabs = [
    { id: 'products', label: '产品管理' },
    { id: 'categories', label: '分类管理' },
    { id: 'tags', label: '标签管理' },
    { id: 'settings', label: '网站设置' },
    { id: 'backup', label: '数据备份' },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Tabs - 替代Header */}
      {/* Tab导航 */}
        <div className="flex border-b border-gray-100 overflow-x-auto bg-white sticky top-0 z-40">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <main className="p-4 pb-24">
        {/* 产品管理 */}
        {activeTab === 'products' && (
          <>
            {/* 搜索框 */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="搜索产品名称或SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]"
              />
            </div>

            {/* 产品网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="aspect-[3/4] relative">
                    <a href={`/product/${product.id}`} className="block w-full h-full">
                      {(product.coverImage || product.cover_image || (product.images && product.images[0])) ? (
                        <img
                          src={product.coverImage || product.cover_image || product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </a>
                    {product.featured && (
                      <span className="absolute top-2 right-2 px-2 py-1 bg-[#14b8a6] text-white text-xs rounded-full">
                        {product.featured}
                      </span>
                    )}
                    {product.featuredRightBottom && (
                      <span className="absolute bottom-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {product.featuredRightBottom}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#14b8a6] font-medium">{product.sku || product.id}</p>
                      <span className="text-xs text-gray-400">#{product.sortOrder ?? 0}</span>
                    </div>
                    <h3 className="font-medium text-gray-800 text-sm truncate mt-1">{product.name}</h3>
                    {product.tags && product.tags.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {Array.isArray(product.tags) ? product.tags.join(', ') : product.tags}
                      </p>
                    )}
                    {product.location && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{product.location}</p>
                    )}
                    <div className="flex gap-1.5 mt-3">
                      <button
                        onClick={() => handleMoveUp(filteredProducts.findIndex(p => p.id === product.id))}
                        disabled={filteredProducts.findIndex(p => p.id === product.id) === 0}
                        className="p-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="上移"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMoveDown(filteredProducts.findIndex(p => p.id === product.id))}
                        disabled={filteredProducts.findIndex(p => p.id === product.id) === filteredProducts.length - 1}
                        className="p-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="下移"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleHidden(product)}
                        className={`flex-1 py-1.5 text-xs border rounded-lg text-center transition-colors ${
                          product.hidden
                            ? 'text-gray-400 border-gray-200 hover:bg-gray-50'
                            : 'text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {product.hidden ? '显示' : '隐藏'}
                      </button>
                      <a
                        href={`/admin/edit/${product.id}`}
                        className="flex-1 py-1.5 text-xs text-[#14b8a6] border border-[#14b8a6] rounded-lg text-center hover:bg-[#14b8a6]/5"
                      >
                        编辑
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-400">没有找到产品</div>
            )}
          </>
        )}

        {/* 分类管理 */}
        {activeTab === 'categories' && (
          <>
            <button
              onClick={() => { setEditingCategory(null); setCategoryName(''); setShowCategoryModal(true); }}
              className="w-full mb-4 py-3 bg-[#14b8a6] text-white rounded-xl font-medium hover:bg-[#14b8a6]/90 transition-colors"
            >
              添加分类
            </button>

            <div className="space-y-3">
              {categories.map(category => (
                <div key={category.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#14b8a6]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#14b8a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-800">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingCategory(category); setCategoryName(category.name); setShowCategoryModal(true); }}
                      className="px-3 py-1.5 text-xs text-[#14b8a6] border border-[#14b8a6] rounded-lg hover:bg-[#14b8a6]/5"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete('category', category.id, category.name)}
                      className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12 text-gray-400">暂无分类</div>
            )}
          </>
        )}

        {/* 标签管理 */}
        {activeTab === 'tags' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">标签列表</h3>
                <button
                  onClick={() => {
                    setEditingTag(null);
                    setTagName('');
                    setShowTagModal(true);
                  }}
                  className="px-4 py-2 bg-[#14b8a6] text-white text-sm rounded-lg hover:bg-[#14b8a6]/90"
                >
                  添加标签
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-gray-500">暂无标签，请点击上方添加</p>
                ) : (
                  tags.map((tag: { id: string; name: string }) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#14b8a6]/10 text-[#14b8a6] rounded-full text-sm"
                    >
                      <span>{tag.name}</span>
                      <button
                        onClick={() => {
                          setEditingTag(tag);
                          setTagName(tag.name);
                          setShowTagModal(true);
                        }}
                        className="hover:text-[#14b8a6]/70"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 网站设置 */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">网站名称</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]"
              />
            </div>

            {/* 超级管理员可管理所有密码 */}
            {isSuperAdmin && (
              <div className="bg-white rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">超级管理员密码</label>
                <p className="text-xs text-purple-600 mb-3">超级管理员(admin2026)可管理所有密码</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2.5 bg-purple-50 border border-purple-200 rounded-lg text-sm font-mono">
                    admin2026
                  </div>
                </div>
              </div>
            )}

            {/* 管理员密码管理 - 仅超级管理员可见 */}
            {isSuperAdmin && (
              <div className="bg-white rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">管理员密码</label>
                <p className="text-xs text-amber-600 mb-3">管理员密码可进入管理后台和查看产品</p>
                
                {/* 已有密码列表 */}
                {adminPasswords.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {adminPasswords.map((pwd, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-mono">
                          {pwd}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePassword(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 新增密码输入 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPassword()}
                    placeholder="输入新管理员密码"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPassword}
                    disabled={!newPassword.trim()}
                    className="px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>
            )}

            {/* 访客密码管理 - 超级管理员和管理员都可访问 */}
            <div className="bg-white rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">访客密码</label>
              <p className="text-xs text-blue-600 mb-3">访客密码只能查看产品，无法进入管理后台</p>
              
              {/* 已有密码列表 */}
              {visitorPasswords.length > 0 && (
                <div className="space-y-2 mb-3">
                  {visitorPasswords.map((pwd, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm font-mono">
                        {pwd}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVisitorPassword(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 新增密码输入 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newVisitorPassword}
                  onChange={(e) => setNewVisitorPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddVisitorPassword()}
                  placeholder="输入新访客密码"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]"
                />
                <button
                  type="button"
                  onClick={handleAddVisitorPassword}
                  disabled={!newVisitorPassword.trim()}
                  className="px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  添加
                </button>
              </div>
            </div>

            {/* 随机排序功能 */}
            <div className="bg-white rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">随机排序产品</label>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">第</span>
                <input
                  type="number"
                  min="1"
                  value={randomFrom}
                  onChange={(e) => setRandomFrom(e.target.value)}
                  placeholder="1"
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]"
                />
                <span className="text-sm text-gray-500">个</span>
                <span className="text-sm text-gray-500 mx-2">至</span>
                <input
                  type="number"
                  min="1"
                  value={randomTo}
                  onChange={(e) => setRandomTo(e.target.value)}
                  placeholder="10"
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]"
                />
                <span className="text-sm text-gray-500">个产品</span>
              </div>
              <button
                onClick={handleRandomSort}
                disabled={!randomFrom || !randomTo}
                className="w-full py-2.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                执行随机排序
              </button>
              
              {/* 已有的随机排序规则列表 */}
              {randomRules.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">已执行的随机排序规则</label>
                  <div className="space-y-2">
                    {randomRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          第 {rule.from} - {rule.to} 个产品
                        </span>
                        <button
                          onClick={() => handleDeleteRandomRule(rule.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-3 bg-[#14b8a6] text-white rounded-xl font-medium hover:bg-[#14b8a6]/90 transition-colors"
            >
              保存设置
            </button>
          </div>
        )}

        {/* 数据备份 */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-800">自动备份状态</h3>
                  <p className="text-sm text-gray-500 mt-1">上次备份：2024-01-15 10:30</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">已启用</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleBackup}
                  className="flex-1 py-3 bg-[#14b8a6] text-white rounded-xl font-medium hover:bg-[#14b8a6]/90 transition-colors"
                >
                  创建备份
                </button>
                <button className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  恢复数据
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <h3 className="font-medium text-gray-800 mb-3">备份历史</h3>
              <div className="space-y-3">
                {[
                  { date: '2024-01-15 10:30', size: '2.3 MB', status: '完成' },
                  { date: '2024-01-14 10:30', size: '2.2 MB', status: '完成' },
                  { date: '2024-01-13 10:30', size: '2.1 MB', status: '完成' },
                ].map((backup, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm text-gray-800">{backup.date}</p>
                      <p className="text-xs text-gray-500">{backup.size}</p>
                    </div>
                    <span className="text-xs text-green-600">{backup.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 悬浮添加按钮 - 手机端圆形+图标，PC端卡片样式 */}
      {activeTab === 'products' && (
        <a
          href="/admin/new"
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-2 bg-white border-2 border-[#14b8a6] text-[#14b8a6] rounded-full md:rounded-xl shadow-lg hover:shadow-xl transition-all z-40 group"
        >
          <svg className="w-14 h-14 md:w-auto md:h-auto p-3 md:px-5 md:py-3 text-white bg-[#14b8a6] rounded-full md:rounded-l-xl group-hover:bg-[#0d9488] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden md:inline pr-4 font-medium">添加产品</span>
        </a>
      )}

      {activeTab === 'categories' && (
        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryName('');
            setShowCategoryModal(true);
          }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-2 bg-white border-2 border-[#14b8a6] text-[#14b8a6] rounded-full md:rounded-xl shadow-lg hover:shadow-xl transition-all z-40 group"
        >
          <svg className="w-14 h-14 md:w-auto md:h-auto p-3 md:px-5 md:py-3 text-white bg-[#14b8a6] rounded-full md:rounded-l-xl group-hover:bg-[#0d9488] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden md:inline pr-4 font-medium">添加分类</span>
        </button>
      )}

      {/* 删除确认模态框 */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">确定要删除「{deleteTarget.name}」吗？此操作不可撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分类编辑模态框 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingCategory ? '编辑分类' : '添加分类'}
            </h3>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="请输入分类名称"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 py-3 bg-[#14b8a6] text-white rounded-xl font-medium hover:bg-[#14b8a6]/90"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 标签管理弹窗 */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingTag ? '编辑标签' : '添加标签'}
            </h3>
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="请输入标签名称"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTagModal(false);
                  setEditingTag(null);
                  setTagName('');
                }}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveTag}
                className="flex-1 py-3 bg-[#14b8a6] text-white rounded-xl font-medium hover:bg-[#14b8a6]/90"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white text-sm z-50 ${
          toast.type === 'success' ? 'bg-[#14b8a6]' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
