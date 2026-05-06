'use client';

import { useState } from 'react';
import { Tag, Category, FeaturedOption } from './types';

interface TagsProps {
  tags: Tag[];
  categories: Category[];
  featuredOptions: FeaturedOption[];
  featuredRightBottomOptions: FeaturedOption[];
  isSuperAdmin: boolean;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onRefresh: () => void;
}

export default function Tags({
  tags,
  categories,
  featuredOptions,
  featuredRightBottomOptions,
  isSuperAdmin,
  showToast,
  onRefresh
}: TagsProps) {
  // 标签状态
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newFeaturedName, setNewFeaturedName] = useState('');
  const [newBottomRightFeaturedName, setNewBottomRightFeaturedName] = useState('');

  // 添加普通标签
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag.trim(), type: 'normal' })
      });
      if (res.ok) {
        setNewTag('');
        onRefresh();
        showToast('标签已添加');
      }
    } catch { showToast('添加失败', 'error'); }
  };

  // 删除普通标签
  const handleDeleteTag = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
        showToast('标签已删除');
      } else {
        showToast('删除失败', 'error');
      }
    } catch { showToast('删除失败', 'error'); }
  };

  // 添加分类
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() })
      });
      if (res.ok) {
        setNewCategory('');
        onRefresh();
        showToast('分类已添加');
      }
    } catch { showToast('添加失败', 'error'); }
  };

  // 删除分类
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
        showToast('分类已删除');
      } else {
        showToast('删除失败', 'error');
      }
    } catch { showToast('删除失败', 'error'); }
  };

  // 添加右上标签
  const handleAddFeatured = async () => {
    if (!newFeaturedName.trim()) return;
    try {
      const res = await fetch('/api/featured-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'featured', name: newFeaturedName.trim() })
      });
      if (res.ok) {
        setNewFeaturedName('');
        onRefresh();
        showToast('右上标签已添加');
      }
    } catch { showToast('添加失败', 'error'); }
  };

  // 删除右上标签
  const handleDeleteFeatured = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    try {
      const res = await fetch(`/api/featured-options?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
        showToast('右上标签已删除');
      } else {
        showToast('删除失败', 'error');
      }
    } catch { showToast('删除失败', 'error'); }
  };

  // 添加右下标签
  const handleAddBottomRightFeatured = async () => {
    if (!newBottomRightFeaturedName.trim()) return;
    try {
      const res = await fetch('/api/featured-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'featured_right_bottom', name: newBottomRightFeaturedName.trim() })
      });
      if (res.ok) {
        setNewBottomRightFeaturedName('');
        onRefresh();
        showToast('右下标签已添加');
      }
    } catch { showToast('添加失败', 'error'); }
  };

  // 删除右下标签
  const handleDeleteFeaturedRightBottom = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    try {
      const res = await fetch(`/api/featured-options?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
        showToast('右下标签已删除');
      } else {
        showToast('删除失败', 'error');
      }
    } catch { showToast('删除失败', 'error'); }
  };

  const normalTags = tags.filter(t => t.type === 'normal');

  return (
    <div className="space-y-8">
      {/* 普通标签管理 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">普通标签</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="输入新标签名称"
            className="input input-bordered flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <button onClick={handleAddTag} className="btn btn-primary">添加</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {normalTags.map(tag => (
            <div key={tag.id} className="badge badge-lg gap-2 p-3">
              {tag.name}
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
          {normalTags.length === 0 && <span className="text-gray-400">暂无标签</span>}
        </div>
      </div>

      {/* 分类管理 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">分类管理</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="输入新分类名称"
            className="input input-bordered flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button onClick={handleAddCategory} className="btn btn-primary">添加</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <div key={cat.id} className="badge badge-lg badge-outline gap-2 p-3">
              {cat.name}
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
          {categories.length === 0 && <span className="text-gray-400">暂无分类</span>}
        </div>
      </div>

      {/* 右上角标签管理 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">右上角标签</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newFeaturedName}
            onChange={(e) => setNewFeaturedName(e.target.value)}
            placeholder="输入右上角标签名称"
            className="input input-bordered flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddFeatured()}
          />
          <button onClick={handleAddFeatured} className="btn btn-primary">添加</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {featuredOptions.map(opt => (
            <div key={opt.id} className="badge badge-lg badge-primary gap-2 p-3">
              {opt.name}
              <button
                onClick={() => handleDeleteFeatured(opt.id)}
                className="text-primary-content hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
          {featuredOptions.length === 0 && <span className="text-gray-400">暂无右上角标签</span>}
        </div>
      </div>

      {/* 右下角标签管理 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">右下角标签</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newBottomRightFeaturedName}
            onChange={(e) => setNewBottomRightFeaturedName(e.target.value)}
            placeholder="输入右下角标签名称"
            className="input input-bordered flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddBottomRightFeatured()}
          />
          <button onClick={handleAddBottomRightFeatured} className="btn btn-primary">添加</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {featuredRightBottomOptions.map(opt => (
            <div key={opt.id} className="badge badge-lg badge-secondary gap-2 p-3">
              {opt.name}
              <button
                onClick={() => handleDeleteFeaturedRightBottom(opt.id)}
                className="text-secondary-content hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
          {featuredRightBottomOptions.length === 0 && <span className="text-gray-400">暂无右下角标签</span>}
        </div>
      </div>
    </div>
  );
}
