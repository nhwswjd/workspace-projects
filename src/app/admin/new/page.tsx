'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category_id: '',
    location: '',
    tags: '',
    description: '',
    cover_image: '',
    images: [] as string[],
    videos: [] as string[],
    hidden: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [newImage, setNewImage] = useState('');
  const [newVideo, setNewVideo] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      setMessage({ type: 'error', text: '请填写必填项' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: '创建成功' });
        setTimeout(() => router.push('/admin'), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || '创建失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '创建失败' });
    }
    setSaving(false);
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImage.trim()] });
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const addVideo = () => {
    if (newVideo.trim()) {
      setFormData({ ...formData, videos: [...formData.videos, newVideo.trim()] });
      setNewVideo('');
    }
  };

  const removeVideo = (index: number) => {
    setFormData({ ...formData, videos: formData.videos.filter((_, i) => i !== index) });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center">
          <button onClick={() => router.push('/admin')} className="p-2 -ml-2">
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800 ml-2">新建产品</h1>
        </div>
      </header>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 py-6 pb-32">
        {/* 基本信息 */}
        <div className="bg-white rounded-2xl p-5 mb-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">基本信息</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU编号 *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 focus:border-[#14b8a6]"
                placeholder="如：PROD-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 focus:border-[#14b8a6]"
                placeholder="输入产品名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 focus:border-[#14b8a6]"
              >
                <option value="">选择分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 focus:border-[#14b8a6]"
                placeholder="产品所在地"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标签（用逗号分隔）</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 focus:border-[#14b8a6]"
                placeholder="如：风景,山水,日落"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 focus:border-[#14b8a6] resize-none"
                placeholder="产品描述"
              />
            </div>

            {/* 隐藏设置 */}
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div>
                <label className="text-sm font-medium text-gray-700">隐藏产品</label>
                <p className="text-xs text-gray-500">隐藏后访客将看不到此产品</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hidden: !formData.hidden })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.hidden ? 'bg-[#14b8a6]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.hidden ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 封面图片 */}
        <div className="bg-white rounded-2xl p-5 mb-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">封面图片</h2>
          <div className="flex gap-3">
            <input
              type="url"
              value={formData.cover_image}
              onChange={e => setFormData({ ...formData, cover_image: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 focus:border-[#14b8a6]"
              placeholder="输入图片URL"
            />
            <button type="button" className="px-4 py-2 bg-[#14b8a6] text-white rounded-xl text-sm font-medium">
              上传
            </button>
          </div>
          {formData.cover_image && (
            <div className="mt-3 relative inline-block">
              <img src={formData.cover_image} alt="封面" className="w-32 h-32 object-cover rounded-xl" />
            </div>
          )}
        </div>

        {/* 产品图片 */}
        <div className="bg-white rounded-2xl p-5 mb-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">产品图片</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="url"
              value={newImage}
              onChange={e => setNewImage(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 focus:border-[#14b8a6]"
              placeholder="输入图片URL"
            />
            <button type="button" onClick={addImage} className="px-4 py-2 bg-[#14b8a6] text-white rounded-xl text-sm font-medium">
              添加
            </button>
          </div>
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {formData.images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 视频 */}
        <div className="bg-white rounded-2xl p-5 mb-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">视频</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="url"
              value={newVideo}
              onChange={e => setNewVideo(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 focus:border-[#14b8a6]"
              placeholder="输入视频URL"
            />
            <button type="button" onClick={addVideo} className="px-4 py-2 bg-[#14b8a6] text-white rounded-xl text-sm font-medium">
              添加
            </button>
          </div>
          {formData.videos.length > 0 && (
            <div className="space-y-3">
              {formData.videos.map((video, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#14b8a6]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#14b8a6]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 truncate max-w-[200px]">{video}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(i)}
                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`fixed top-20 left-4 right-4 ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-3 rounded-xl text-center z-50`}>
            {message.text}
          </div>
        )}
      </form>

      {/* 底部保存按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40">
        <div className="max-w-5xl mx-auto flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 bg-[#14b8a6] text-white rounded-xl font-medium hover:bg-[#14b8a6]/90 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
