'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ProductVideo {
  url: string;
  thumbnail?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  category_id?: string;
  coverImage?: string;
  cover_image?: string;
  images?: string[];
  videos?: ProductVideo[];
  tags?: string[];
  featured?: string | null;
  featuredRightBottom?: string | null;
  location?: string;
  hidden?: boolean;
  sortOrder?: number;
  sort_order?: number; // 兼容数据库字段
  updated_at?: string;
  notes?: string;
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
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'backup' | 'tags'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string; sort_order: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [orphanFiles, setOrphanFiles] = useState<{ name: string; bucket: string; size: number; url: string }[]>([]);
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [storageStats, setStorageStats] = useState({ images: 0, imageSize: 0, videos: 0, videoSize: 0 });
  const [totalStorageSize, setTotalStorageSize] = useState(0);
  const [storageFiles, setStorageFiles] = useState<{ name: string; type: string; size: number; orphan?: boolean }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedBuckets, setSelectedBuckets] = useState<Set<string>>(new Set(['product-images', 'product-videos']))
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id?: string; name: string } | null>(null);
  const [tagName, setTagName] = useState("");
  
  // 右上标签状态
  const [featuredOptions, setFeaturedOptions] = useState<{ id: string; name: string }[]>([]);
  const [newFeatured, setNewFeatured] = useState('');
  const [editingFeatured, setEditingFeatured] = useState<string | null>(null);
  const [editingFeaturedName, setEditingFeaturedName] = useState('');
  
  // 右下标签状态
  const [featuredRightBottomOptions, setFeaturedRightBottomOptions] = useState<{ id: string; name: string }[]>([]);
  const [newFeaturedRightBottom, setNewFeaturedRightBottom] = useState('');
  const [editingFeaturedRightBottom, setEditingFeaturedRightBottom] = useState<string | null>(null);
  const [editingFeaturedRightBottomName, setEditingFeaturedRightBottomName] = useState('');
  
  // 分类状态
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  
  // 消息提示
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };
  const [analyticsStats, setAnalyticsStats] = useState<{
    todayVisits: number;
    yesterdayVisits: number;
    totalVisits: number;
    uniqueVisitors: number;
    recentLogs: { id: string; password_used: string; ip: string; location: string; device: string; browser: string; visited_at: string }[];
    passwordStats: Record<string, number>;
    deviceStats: Record<string, number>;
    browserStats: Record<string, number>;
  } | null>(null);
  const [clearingLogs, setClearingLogs] = useState(false);
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
      // 使用合并API，一次请求获取所有数据
      const res = await fetch(`/api/admin/data?super_admin=${isSuperAdmin}`);
      const data = await res.json();
      
      if (data.products) setProducts(data.products);
      if (data.brandName) setSiteName(data.brandName);
      if (data.tags) setTags(data.tags);
      if (data.categories) setCategories(data.categories);
      if (data.featuredOptions) setFeaturedOptions(data.featuredOptions);
      if (data.featuredRightBottomOptions) setFeaturedRightBottomOptions(data.featuredRightBottomOptions);
      
      // 解析管理员密码
      if (isSuperAdmin && data.adminPassword) {
        const passwords = parsePasswords(data.adminPassword);
        if (passwords.length > 0) {
          setAdminPasswords(passwords);
        }
      }
      
      // 解析访客密码
      if (data.visitorPassword) {
        const passwords = parsePasswords(data.visitorPassword);
        if (passwords.length > 0) {
          setVisitorPasswords(passwords);
        }
      }
      
      // 加载随机排序规则
      if (data.randomSortRules) {
        setRandomRules(data.randomSortRules);
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

  const handleAddPassword = async () => {
    if (newPassword.trim()) {
      const newPasswords = [...adminPasswords, newPassword.trim()];
      console.log('[DEBUG] 添加管理员密码:', newPasswords);
      try {
        const res = await fetch('/api/site-settings/admin_password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: JSON.stringify(newPasswords) }),
        });
        const data = await res.json();
        console.log('[DEBUG] API响应:', res.status, data);
        if (res.ok) {
          setAdminPasswords(newPasswords);
          setNewPassword('');
        }
      } catch (err) {
        console.error('保存管理员密码失败', err);
      }
    }
  };

  const handleRemovePassword = async (index: number) => {
    const newPasswords = adminPasswords.filter((_, i) => i !== index);
    console.log('[DEBUG] 删除管理员密码, index:', index, 'new list:', newPasswords);
    try {
      const res = await fetch('/api/site-settings/admin_password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(newPasswords) }),
      });
      const data = await res.json();
      console.log('[DEBUG] 删除API响应:', res.status, data);
      if (res.ok) {
        setAdminPasswords(newPasswords);
      }
    } catch (err) {
      console.error('删除管理员密码失败', err);
    }
  };

  const handleAddVisitorPassword = async () => {
    if (newVisitorPassword.trim()) {
      const newPasswords = [...visitorPasswords, newVisitorPassword.trim()];
      try {
        const res = await fetch('/api/site-settings/visitor_password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: JSON.stringify(newPasswords) }),
        });
        if (res.ok) {
          setVisitorPasswords(newPasswords);
          setNewVisitorPassword('');
        }
      } catch (err) {
        console.error('保存访客密码失败', err);
      }
    }
  };

  const handleRemoveVisitorPassword = async (index: number) => {
    const newPasswords = visitorPasswords.filter((_, i) => i !== index);
    try {
      const res = await fetch('/api/site-settings/visitor_password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(newPasswords) }),
      });
      if (res.ok) {
        setVisitorPasswords(newPasswords);
      }
    } catch (err) {
      console.error('删除访客密码失败', err);
    }
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

  const handleAddTagDirectly = async () => {
    if (!tagName.trim()) return;
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName.trim() })
      });
      const data = await res.json();
      if (data.tag) {
        setTags([...tags, data.tag]);
        setTagName('');
        showToast('标签添加成功');
      } else {
        showToast(data.error || '添加失败', 'error');
      }
    } catch {
      showToast('添加失败', 'error');
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

  // ========== 分类操作 ==========
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() })
      });
      const data = await res.json();
      if (data.category) {
        setCategories([...categories, data.category]);
        setNewCategory('');
        showToast('分类添加成功');
      } else {
        showToast(data.error || '添加失败', 'error');
      }
    } catch {
      showToast('添加失败', 'error');
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingCategoryName.trim() })
      });
      const data = await res.json();
      if (data.category) {
        setCategories(categories.map(c => c.id === id ? data.category : c));
        setEditingCategory(null);
        showToast('分类更新成功');
      } else {
        showToast(data.error || '更新失败', 'error');
      }
    } catch {
      showToast('更新失败', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter(c => c.id !== id));
        showToast('分类已删除');
      } else {
        showToast(data.error || '删除失败', 'error');
      }
    } catch {
      showToast('删除失败', 'error');
    }
  };

  // ========== 右上标签操作 ==========
  const handleAddFeatured = async () => {
    if (!newFeatured.trim()) return;
    try {
      const res = await fetch('/api/featured-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'featured', name: newFeatured.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeaturedOptions([...featuredOptions, data.data]);
        setNewFeatured('');
        showToast('右上标签添加成功');
      } else {
        showToast(data.error || '添加失败', 'error');
      }
    } catch {
      showToast('添加失败', 'error');
    }
  };

  const handleUpdateFeatured = async (id: string) => {
    if (!editingFeaturedName.trim()) return;
    try {
      const res = await fetch('/api/featured-options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingFeaturedName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeaturedOptions(featuredOptions.map(o => o.id === id ? data.data : o));
        setEditingFeatured(null);
        showToast('右上标签更新成功');
      } else {
        showToast(data.error || '更新失败', 'error');
      }
    } catch {
      showToast('更新失败', 'error');
    }
  };

  const handleDeleteFeatured = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    try {
      const res = await fetch(`/api/featured-options?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeaturedOptions(featuredOptions.filter(o => o.id !== id));
        showToast('右上标签已删除');
      } else {
        showToast(data.error || '删除失败', 'error');
      }
    } catch {
      showToast('删除失败', 'error');
    }
  };

  // ========== 右下标签操作 ==========
  const handleAddFeaturedRightBottom = async () => {
    if (!newFeaturedRightBottom.trim()) return;
    try {
      const res = await fetch('/api/featured-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'featured_right_bottom', name: newFeaturedRightBottom.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeaturedRightBottomOptions([...featuredRightBottomOptions, data.data]);
        setNewFeaturedRightBottom('');
        showToast('右下标签添加成功');
      } else {
        showToast(data.error || '添加失败', 'error');
      }
    } catch {
      showToast('添加失败', 'error');
    }
  };

  const handleUpdateFeaturedRightBottom = async (id: string) => {
    if (!editingFeaturedRightBottomName.trim()) return;
    try {
      const res = await fetch('/api/featured-options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingFeaturedRightBottomName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeaturedRightBottomOptions(featuredRightBottomOptions.map(o => o.id === id ? data.data : o));
        setEditingFeaturedRightBottom(null);
        showToast('右下标签更新成功');
      } else {
        showToast(data.error || '更新失败', 'error');
      }
    } catch {
      showToast('更新失败', 'error');
    }
  };

  const handleDeleteFeaturedRightBottom = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    try {
      const res = await fetch(`/api/featured-options?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeaturedRightBottomOptions(featuredRightBottomOptions.filter(o => o.id !== id));
        showToast('右下标签已删除');
      } else {
        showToast(data.error || '删除失败', 'error');
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

  // 数据库备份下载
  const handleDatabaseBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('备份失败');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('数据库备份下载成功');
    } catch (err) {
      console.error(err);
      showToast('备份失败', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  // 媒体文件备份下载
  const handleMediaBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch('/api/backup/media');
      if (!res.ok) throw new Error('备份失败');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `media-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('媒体文件备份下载成功');
    } catch (err) {
      console.error(err);
      showToast('备份失败', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  // 完整备份（数据库+媒体）
  const handleFullBackup = async () => {
    setIsBackingUp(true);
    try {
      // 并行下载数据库和媒体备份
      const [dbRes, mediaRes] = await Promise.all([
        fetch('/api/backup'),
        fetch('/api/backup/media'),
      ]);

      if (!dbRes.ok || !mediaRes.ok) throw new Error('备份失败');

      const [dbBlob, mediaBlob] = await Promise.all([dbRes.blob(), mediaRes.blob()]);
      const date = new Date().toISOString().split('T')[0];

      // 创建 zip 文件包含两个备份
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      zip.file(`database-backup-${date}.json`, dbBlob);
      zip.file(`media-backup-${date}.zip`, mediaBlob);
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `full-backup-${date}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('完整备份下载成功');
    } catch (err) {
      console.error(err);
      showToast('备份失败', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  // 存储清理
  const [orphanedFiles, setOrphanedFiles] = useState<{name: string; bucket: string; size: number}[]>([]);
  const [selectedOrphanFiles, setSelectedOrphanFiles] = useState<Set<string>>(new Set());
  const [isCleaning, setIsCleaning] = useState(false);

  // 加载访问统计
  const loadAnalytics = async () => {
    try {
      // 根据用户角色获取统计数据
      const role = isSuperAdmin ? 'super_admin' : isAdmin ? 'admin' : 'visitor';
      const res = await fetch('/api/analytics/stats?days=30', {
        headers: { 'x-user-role': role }
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setAnalyticsStats(data.stats);
      }
    } catch (err) {
      console.error('加载访问统计失败:', err);
    }
  };

  // 清除所有访问记录
  const handleClearAccessLogs = async () => {
    if (!confirm('确定要清除所有访问记录吗？此操作不可恢复。')) {
      return;
    }
    setClearingLogs(true);
    try {
      const res = await fetch('/api/analytics/clear', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`已清除 ${data.deleted} 条访问记录`);
        loadAnalytics();
      } else {
        alert('清除失败: ' + (data.error || '未知错误'));
      }
    } catch (err) {
      console.error('清除访问记录失败:', err);
      alert('清除失败');
    } finally {
      setClearingLogs(false);
    }
  };

  const handleScanStorage = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/storage/list');
      const data = await res.json();
      if (data.files && data.stats) {
        setStorageStats({
          images: data.stats.imageCount || 0,
          imageSize: data.stats.imageSize || 0,
          videos: data.stats.videoCount || 0,
          videoSize: data.stats.videoSize || 0,
        });
        setTotalStorageSize(data.stats.totalSize || 0);
        setStorageFiles(data.files.map((f: { name: string; type: string; size: number; id: string }) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          orphan: data.orphaned?.includes(f.name) || false,
        })));
        setOrphanedFiles((data.orphaned || []).map((f: { name: string; bucket: string; size: number }) => ({
          name: f.name,
          bucket: f.bucket,
          size: f.size || 0,
        })));
        setSelectedOrphanFiles(new Set());
        showToast(`扫描完成，共 ${data.files.length} 个文件，${(data.orphaned || []).length} 个孤立文件`);
      } else {
        showToast(data.error || '扫描失败', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('扫描失败', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCleanStorage = async () => {
    const selected = orphanedFiles.filter(f => selectedOrphanFiles.has(`${f.bucket}/${f.name}`));
    if (selected.length === 0) {
      showToast('请先选择要删除的文件', 'error');
      return;
    }

    if (!confirm(`确定删除 ${selected.length} 个选中的孤立文件吗？`)) return;

    setIsCleaning(true);
    try {
      const fileNames = selected.map((f) => ({ name: f.name, bucket: f.bucket }));
      const res = await fetch('/api/storage/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: fileNames }),
      });
      const data = await res.json();
      if (data.success) {
        const saved = data.deletedSize || 0;
        showToast(`已删除 ${data.deleted} 个文件，节省 ${(saved / 1024 / 1024).toFixed(2)} MB`);
        setOrphanedFiles([]);
        setSelectedOrphanFiles(new Set());
      } else {
        showToast('删除失败: ' + (data.error || '未知错误'), 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('删除失败', 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  // 恢复数据库
  const handleRestoreDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('恢复操作将清空现有数据并导入备份数据，是否继续？')) {
      e.target.value = '';
      return;
    }

    setIsRestoring(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/backup', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('恢复失败');
      
      showToast('数据恢复成功，请手动刷新页面');
      // 重新加载数据
      // loadAllData();
    } catch (err) {
      console.error(err);
      showToast('恢复失败', 'error');
    } finally {
      setIsRestoring(false);
      e.target.value = '';
    }
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
                      <span className="absolute top-0 right-0 px-2 py-1 bg-[#14b8a6] text-white text-xs rounded-bl-lg">
                        {product.featured}
                      </span>
                    )}
                    {product.featuredRightBottom && (
                      <span className="absolute bottom-0 right-0 px-2 py-1 bg-green-500 text-white text-xs rounded-bl-md">
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
                    {product.notes && (
                      <p className="text-xs text-orange-500 mt-1 truncate" title={product.notes}>备注: {product.notes}</p>
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

        {/* 标签管理 */}
        {activeTab === 'tags' && (
          <div className="space-y-4">
            {/* 消息提示 */}
            {message && (
              <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 普通标签 */}
              <div className="bg-white rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">普通标签</h3>
                <p className="text-xs text-gray-500 mb-3">用于产品分类筛选</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="输入标签名称"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingTag?.id) {
                          // 更新标签 - 通过 modal 处理
                        } else if (tagName.trim()) {
                          // 添加标签
                          handleAddTagDirectly();
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                  />
                  <button
                    onClick={() => {
                      if (tagName.trim()) {
                        handleAddTagDirectly();
                      }
                    }}
                    className="px-3 py-2 bg-[#14b8a6] text-white rounded-lg hover:bg-[#14b8a6]/90"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{tag.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingTag(tag);
                            setTagName(tag.name);
                            setShowTagModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-[#14b8a6]"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右上标签 */}
              <div className="bg-white rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">右上标签</h3>
                <p className="text-xs text-gray-500 mb-3">显示在图片右上角</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="输入标签名称"
                    value={newFeatured}
                    onChange={(e) => setNewFeatured(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFeatured()}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                  />
                  <button
                    onClick={handleAddFeatured}
                    disabled={!newFeatured.trim()}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {featuredOptions.map(option => (
                    <div key={option.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      {editingFeatured === option.id ? (
                        <>
                          <input
                            type="text"
                            value={editingFeaturedName}
                            onChange={(e) => setEditingFeaturedName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm mr-2"
                            autoFocus
                          />
                          <button onClick={() => handleUpdateFeatured(option.id)} className="p-1 text-green-500">✓</button>
                          <button onClick={() => setEditingFeatured(null)} className="p-1 text-gray-400">×</button>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">右上</span>
                            {option.name}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingFeatured(option.id);
                                setEditingFeaturedName(option.name);
                              }}
                              className="p-1 text-gray-400 hover:text-[#14b8a6]"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDeleteFeatured(option.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 右下标签 */}
              <div className="bg-white rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">右下标签</h3>
                <p className="text-xs text-gray-500 mb-3">显示在图片右下角</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="输入标签名称"
                    value={newFeaturedRightBottom}
                    onChange={(e) => setNewFeaturedRightBottom(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFeaturedRightBottom()}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                  />
                  <button
                    onClick={handleAddFeaturedRightBottom}
                    disabled={!newFeaturedRightBottom.trim()}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {featuredRightBottomOptions.map(option => (
                    <div key={option.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      {editingFeaturedRightBottom === option.id ? (
                        <>
                          <input
                            type="text"
                            value={editingFeaturedRightBottomName}
                            onChange={(e) => setEditingFeaturedRightBottomName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm mr-2"
                            autoFocus
                          />
                          <button onClick={() => handleUpdateFeaturedRightBottom(option.id)} className="p-1 text-green-500">✓</button>
                          <button onClick={() => setEditingFeaturedRightBottom(null)} className="p-1 text-gray-400">×</button>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">右下</span>
                            {option.name}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingFeaturedRightBottom(option.id);
                                setEditingFeaturedRightBottomName(option.name);
                              }}
                              className="p-1 text-gray-400 hover:text-[#14b8a6]"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDeleteFeaturedRightBottom(option.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 分类管理 */}
              <div className="bg-white rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">分类管理</h3>
                <p className="text-xs text-gray-500 mb-3">用于产品分类筛选</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="输入分类名称"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                    className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      {editingCategory?.id === category.id ? (
                        <>
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm mr-2"
                            autoFocus
                          />
                          <button onClick={() => handleUpdateCategory(category.id)} className="p-1 text-green-500">✓</button>
                          <button onClick={() => setEditingCategory(null)} className="p-1 text-gray-400">×</button>
                        </>
                      ) : (
                        <>
                          <span>{category.name}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingCategory(category);
                                setEditingCategoryName(category.name);
                              }}
                              className="p-1 text-gray-400 hover:text-[#14b8a6]"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
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

            {/* 访问统计 */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center justify-between">
                <span>访问记录</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAccessLogs}
                    disabled={clearingLogs}
                    className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                  >
                    {clearingLogs ? '清除中...' : '清除全部'}
                  </button>
                  <button
                    onClick={loadAnalytics}
                    className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    刷新
                  </button>
                </div>
              </h3>
              <p className="text-sm text-gray-500 mb-4">记录访客使用密码登录的情况</p>
              {analyticsStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{analyticsStats.todayVisits}</p>
                      <p className="text-xs text-gray-500">今日访问</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{analyticsStats.yesterdayVisits}</p>
                      <p className="text-xs text-gray-500">昨日访问</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-purple-600">{analyticsStats.totalVisits}</p>
                      <p className="text-xs text-gray-500">总访问量</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-orange-600">{analyticsStats.uniqueVisitors}</p>
                      <p className="text-xs text-gray-500">独立访客</p>
                    </div>
                  </div>
                  
                  {/* 逐条访问记录列表 */}
                  <div className="bg-white rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-500 font-medium">时间</th>
                            <th className="px-3 py-2 text-left text-gray-500 font-medium">密码</th>
                            <th className="px-3 py-2 text-left text-gray-500 font-medium">IP / 归属地</th>
                            <th className="px-3 py-2 text-left text-gray-500 font-medium">设备</th>
                            <th className="px-3 py-2 text-left text-gray-500 font-medium">浏览器</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {analyticsStats.recentLogs && analyticsStats.recentLogs.length > 0 ? (
                            analyticsStats.recentLogs.slice(0, 100).map((log: { id: string; password_used: string; ip: string; location: string; device: string; browser: string; visited_at: string }) => (
                              <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                                  {new Date(log.visited_at).toLocaleString('zh-CN', { 
                                    month: '2-digit', 
                                    day: '2-digit', 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </td>
                                <td className="px-3 py-2">
                                  <span className="font-mono bg-teal-50 text-teal-600 px-2 py-0.5 rounded text-xs">
                                    {log.password_used}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="text-xs">
                                    <span className="text-gray-800 font-mono">{log.ip}</span>
                                    {log.location && log.location !== '未知' && (
                                      <span className="ml-2 text-gray-400">({log.location})</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{log.device}</td>
                                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{log.browser}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                                暂无访问记录
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {analyticsStats.recentLogs && analyticsStats.recentLogs.length > 100 && (
                      <div className="px-3 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
                        显示前100条记录，共 {analyticsStats.recentLogs.length} 条
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={loadAnalytics}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  加载访问记录
                </button>
              )}
            </div>
          </div>
        )}

        {/* 数据备份 */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            {/* 数据库备份 */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-medium text-gray-800 mb-2">数据库备份</h3>
              <p className="text-sm text-gray-500 mb-4">包含：产品、分类、标签等所有数据</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDatabaseBackup}
                  disabled={isBackingUp}
                  className="flex-1 py-3 bg-[#14b8a6] text-white rounded-xl font-medium hover:bg-[#14b8a6]/90 transition-colors disabled:opacity-50"
                >
                  {isBackingUp ? '备份中...' : '下载数据库备份'}
                </button>
                <label className="flex-1 py-3 bg-white border border-[#14b8a6] text-[#14b8a6] rounded-xl font-medium hover:bg-[#14b8a6]/5 transition-colors text-center cursor-pointer">
                  {isRestoring ? '恢复中...' : '恢复数据库'}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreDatabase}
                    disabled={isRestoring}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 媒体文件备份 */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-medium text-gray-800 mb-2">媒体文件备份</h3>
              <p className="text-sm text-gray-500 mb-4">包含：产品图片、封面图、视频等</p>
              <button
                onClick={handleMediaBackup}
                disabled={isBackingUp}
                className="w-full py-3 bg-[#14b8a6] text-white rounded-xl font-medium hover:bg-[#14b8a6]/90 transition-colors disabled:opacity-50"
              >
                {isBackingUp ? '备份中...' : '下载媒体文件备份'}
              </button>
            </div>

            {/* 完整备份 */}
            <div className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] rounded-xl p-4 text-white">
              <h3 className="font-medium mb-2">一键完整备份</h3>
              <p className="text-sm text-white/80 mb-4">同时下载数据库和媒体文件备份</p>
              <button
                onClick={handleFullBackup}
                disabled={isBackingUp}
                className="w-full py-3 bg-white text-[#14b8a6] rounded-xl font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isBackingUp ? '备份中...' : '下载完整备份'}
              </button>
            </div>
          <div className="border-t border-gray-100 pt-4 mt-4">
          </div>
            <h3 className="font-medium text-gray-800 mb-3">存储空间清理</h3>
            <p className="text-sm text-gray-500 mb-4">扫描并删除孤立的图片/视频文件</p>
            
            {/* 存储空间统计 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-blue-600 mb-2 font-medium">存储空间占用</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-gray-500">图片</p>
                  <p className="font-medium text-gray-800">{storageStats.images} 个 ({(storageStats.imageSize / 1024 / 1024).toFixed(2)} MB)</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-gray-500">视频</p>
                  <p className="font-medium text-gray-800">{storageStats.videos} 个 ({(storageStats.videoSize / 1024 / 1024).toFixed(2)} MB)</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-gray-500">已使用</p>
                  <p className="font-medium text-green-600">{storageStats.images + storageStats.videos - orphanedFiles.length} 个 ({( (totalStorageSize - orphanedFiles.reduce((s, f) => s + f.size, 0)) / 1024 / 1024).toFixed(2)} MB)</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-gray-500">总占用</p>
                  <p className="font-medium text-gray-800">{(totalStorageSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
            
            {orphanedFiles.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-orange-600">发现 {orphanedFiles.length} 个孤立文件，共 {(orphanedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB</p>
                  <label className="flex items-center gap-1 text-xs text-orange-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOrphanFiles.size === orphanedFiles.length && orphanedFiles.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrphanFiles(new Set(orphanedFiles.map(f => `${f.bucket}/${f.name}`)));
                        } else {
                          setSelectedOrphanFiles(new Set());
                        }
                      }}
                      className="rounded"
                    />
                    全选
                  </label>
                </div>
                <div className="max-h-60 overflow-y-auto text-xs text-gray-600 space-y-1">
                  {orphanedFiles.map((file) => {
                    const key = `${file.bucket}/${file.name}`;
                    return (
                      <div key={key} className="flex justify-between items-center hover:bg-orange-100 rounded px-1">
                        <label className="flex items-center gap-2 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedOrphanFiles.has(key)}
                            onChange={() => {
                              setSelectedOrphanFiles(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(key)) {
                                  newSet.delete(key);
                                } else {
                                  newSet.add(key);
                                }
                                return newSet;
                              });
                            }}
                            className="rounded"
                          />
                          <span className="truncate flex-1">{file.bucket}/{file.name}</span>
                        </label>
                        <span className="ml-2 text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    );
                  })}
                </div>
                {selectedOrphanFiles.size > 0 && (
                  <p className="text-xs text-orange-600 mt-2">已选择 {selectedOrphanFiles.size} 个文件</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleScanStorage}
                disabled={isScanning}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isScanning ? '扫描中...' : '扫描孤立文件'}
              </button>
              <button
                onClick={handleCleanStorage}
                disabled={isCleaning || selectedOrphanFiles.size === 0}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isCleaning ? '删除中...' : `删除选中 (${selectedOrphanFiles.size})`}
              </button>
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
