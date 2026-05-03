'use client';

import { useState, useEffect } from 'react';

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
  location?: string;
  hidden?: boolean;
  sort_order?: number;
  updated_at?: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  sort_order?: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings' | 'backup'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'category'; id: string; name: string } | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [siteName, setSiteName] = useState('江南风景好');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, settingsRes] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/site-settings/brand_name').then(r => r.json()).catch(() => ({ value: '江南风景好' })),
      ]);
      
      if (productsRes.products) setProducts(productsRes.products);
      if (categoriesRes.categories) setCategories(categoriesRes.categories);
      if (settingsRes.value) setSiteName(settingsRes.value);
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

  const handleSaveSettings = async () => {
    try {
      await Promise.all([
        fetch('/api/site-settings/brand_name', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: siteName }),
        }),
        fetch('/api/site-settings/admin_password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: adminPassword }),
        }),
      ]);
      showToast('设置已保存');
    } catch (err) {
      showToast('保存失败', 'error');
    }
  };

  const handleBackup = async () => {
    showToast('备份功能开发中...');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tabs = [
    { id: 'products', label: '产品管理' },
    { id: 'categories', label: '分类管理' },
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="h-14 px-4 flex items-center justify-between">
          <button className="p-2 -ml-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800">{siteName}</h1>
          <div className="w-10" />
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#14b8a6] border-b-2 border-[#14b8a6]'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

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
                    {product.coverImage || product.cover_image ? (
                      <img
                        src={product.coverImage || product.cover_image}
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
                    {product.featured && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-[#14b8a6] text-white text-xs rounded-full">
                        精选
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{product.category || product.category_id}</p>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={`/admin/edit/${product.id}`}
                        className="flex-1 py-1.5 text-xs text-[#14b8a6] border border-[#14b8a6] rounded-lg text-center hover:bg-[#14b8a6]/5"
                      >
                        编辑
                      </a>
                      <button
                        onClick={() => handleDelete('product', product.id, product.name)}
                        className="flex-1 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        删除
                      </button>
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

            <div className="bg-white rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">访问密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="请输入访问密码"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l1.499 1.499M14.5 14.5v.01a3 3 0 01-3 3h-1a3 3 0 01-3-3v-.01M9 9h.01M12 12h.01M14.5 14.5l-1-1" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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
