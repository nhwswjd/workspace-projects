'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase配置
const SUPABASE_URL = 'https://br-bonny-deer-52ec6415.supabase2.aidap-global.cn-beijing.volces.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTgwNTI0MTIsInJvbGUiOiJhbm9uIn0.0FNIFZWNcQgZ0tL9cLNFtcrVjBFxH_npbv2TBvAQkOw';

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  id?: string;
  sku?: string;
  name?: string;
  description?: string;
  category?: string;
  category_id?: string;
  location?: string;
  tags?: string;
  featured?: string;
  hidden?: boolean;
  sort_order?: number;
  cover_image?: string;
  images?: string[];
  videos?: string[];
}

interface ProductFormProps {
  initialData?: ProductData;
  onSuccess?: () => void;
}

// 生成文件名
const generateFileName = (file: File): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split('.').pop() || 'bin';
  return `${timestamp}-${randomStr}.${ext}`;
};

// 上传单个文件到Supabase
const uploadFile = async (file: File): Promise<string | null> => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const fileName = generateFileName(file);
  
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { contentType: file.type, upsert: true });
  
  if (error) {
    console.error('上传失败:', error);
    return null;
  }
  
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return urlData.publicUrl;
};

export default function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const isEditMode = !!initialData?.id;
  
  // 表单状态
  const [name, setName] = useState(initialData?.name || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [tags, setTags] = useState(initialData?.tags || '');
  const [hidden, setHidden] = useState(initialData?.hidden || false);
  const [featured, setFeatured] = useState(initialData?.featured || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order || 0);
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [videos, setVideos] = useState<string[]>(initialData?.videos || []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  const [uploadingVideoIndex, setUploadingVideoIndex] = useState<number | null>(null);
  const [uploadingMultiple, setUploadingMultiple] = useState(false);

  // 加载分类
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      });
  }, []);

  // 处理图片变化
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 处理视频变化
  const handleVideoChange = (index: number, value: string) => {
    const newVideos = [...videos];
    newVideos[index] = value;
    setVideos(newVideos);
  };

  // 删除视频
  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      sku,
      sort_order: sortOrder,
      description,
      category,
      category_id: categoryId,
      location,
      featured: featured || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      hidden: hidden || false,
      cover_image: coverImage || null,
      images: images.filter(Boolean),
      videos: videos.filter(Boolean)
    };

    try {
      const url = isEditMode ? `/api/products/${initialData.id}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEditMode ? '保存成功' : '创建成功');
        onSuccess?.();
      } else {
        alert(isEditMode ? '保存失败' : '创建失败');
      }
    } catch {
      alert('操作失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-32">
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        {/* 基本信息 */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">基本信息</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">排序（数值越小越靠前）</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU编号</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="如: ZJ-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">产品名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="如: 西湖断桥"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">产品描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              placeholder="描述产品的特点..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">分类</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                const cat = categories.find(c => c.id === e.target.value);
                if (cat) setCategory(cat.name);
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">地点</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="如: 杭州市西湖区"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">标签（多个用逗号分隔）</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="如: 风景,古镇,日出"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm font-medium text-gray-700">隐藏（访客不可见）</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">精选标签</label>
            <input
              type="text"
              value={featured}
              onChange={(e) => setFeatured(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="如: 精选产品（留空则不显示）"
            />
          </div>
        </div>

        {/* 媒体文件 */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">媒体文件</h2>

          {/* 封面图片 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">封面图片</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="封面图片URL"
              />
              <label className={`px-4 py-3 bg-teal-50 text-teal-600 font-medium rounded-xl cursor-pointer hover:bg-teal-100 flex items-center ${uploadingCover ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {uploadingCover ? '上传中...' : '上传'}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  disabled={uploadingCover} 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingCover(true);
                      try {
                        const url = await uploadFile(file);
                        if (url) setCoverImage(url);
                        else alert('上传失败');
                      } catch {
                        alert('上传失败');
                      } finally {
                        setUploadingCover(false);
                      }
                    }
                  }} 
                />
              </label>
            </div>
            {coverImage && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <img src={coverImage} alt="封面预览" className="w-full h-48 object-contain" />
              </div>
            )}
          </div>

          {/* 图片列表 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                图片列表 ({images.length}张)
              </label>
              <label className={`text-sm text-teal-600 font-medium cursor-pointer ${uploadingMultiple ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {uploadingMultiple ? '上传中...' : '+ 批量上传图片'}
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  disabled={uploadingMultiple} 
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      setUploadingMultiple(true);
                      try {
                        const newUrls: string[] = [];
                        for (const file of files) {
                          const url = await uploadFile(file);
                          if (url) newUrls.push(url);
                        }
                        if (newUrls.length > 0) {
                          setImages([...images, ...newUrls]);
                        }
                        if (newUrls.length < files.length) {
                          alert(`成功 ${newUrls.length} 张，失败 ${files.length - newUrls.length} 张`);
                        }
                      } catch {
                        alert('上传失败');
                      } finally {
                        setUploadingMultiple(false);
                      }
                    }
                  }} 
                />
              </label>
            </div>
            
            {images.length > 0 && (
              <>
                <div className="space-y-2 mb-3">
                  {images.map((img, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="图片URL"
                      />
                      <label className={`p-2 bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 ${uploadingImageIndex === index ? 'opacity-50' : ''}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingImageIndex === index} onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadingImageIndex(index);
                            try {
                              const url = await uploadFile(file);
                              if (url) handleImageChange(index, url);
                              else alert('上传失败');
                            } catch {
                              alert('上传失败');
                            } finally {
                              setUploadingImageIndex(null);
                            }
                          }
                        }} />
                      </label>
                      <button type="button" onClick={() => handleRemoveImage(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* 图片预览网格 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((img, index) => img && (
                    <div key={index} className="relative rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200 shadow-sm">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={img} alt={`图片 ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2 flex items-center justify-between bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="bg-teal-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">
                            {index + 1}
                          </span>
                          <span className="text-xs text-gray-500">图片{index + 1}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (index > 0) {
                                const newImages = [...images];
                                [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
                                setImages(newImages);
                              }
                            }}
                            disabled={index === 0}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${index === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            title="上移"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (index < images.length - 1) {
                                const newImages = [...images];
                                [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                                setImages(newImages);
                              }
                            }}
                            disabled={index === images.length - 1}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${index === images.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            title="下移"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="w-8 h-8 bg-red-500 text-white flex items-center justify-center rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                            title="删除"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 视频列表 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                视频列表 ({videos.length}个)
              </label>
              <button type="button" onClick={() => setVideos([...videos, ''])} className="text-sm text-teal-600 font-medium">
                + 添加视频
              </button>
            </div>
            
            {videos.length > 0 && (
              <>
                <div className="space-y-2 mb-3">
                  {videos.map((video, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={video}
                        onChange={(e) => handleVideoChange(index, e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="视频URL"
                      />
                      <label className={`p-2 bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 ${uploadingVideoIndex === index ? 'opacity-50' : ''}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <input type="file" accept="video/*" className="hidden" disabled={uploadingVideoIndex === index} onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingVideoIndex(index);
                          try {
                            const url = await uploadFile(file);
                            if (url) handleVideoChange(index, url);
                            else alert('上传失败');
                          } catch (err: unknown) {
                            alert('上传失败: ' + (err instanceof Error ? err.message : '未知错误'));
                          } finally {
                            setUploadingVideoIndex(null);
                          }
                        }} />
                      </label>
                      <button type="button" onClick={() => handleRemoveVideo(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* 视频预览网格 */}
                <div className="grid grid-cols-2 gap-2">
                  {videos.map((video, index) => video && (
                    <div key={index} className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200" style={{minHeight: '150px'}}>
                      <video 
                        src={video} 
                        className="w-full h-auto max-h-48 object-contain" 
                        controls 
                        preload="metadata"
                      />
                      <div className="absolute top-0 left-0 bg-teal-600 text-white text-xs px-2 py-0.5 rounded-br">
                        视频 {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 底部提交按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-teal-500 text-white font-medium rounded-xl disabled:opacity-50"
        >
          {saving ? '保存中...' : (isEditMode ? '保存修改' : '创建产品')}
        </button>
      </div>
    </form>
  );
}
