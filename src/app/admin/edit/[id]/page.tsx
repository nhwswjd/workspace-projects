'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  category_id: string;
  cover_image: string;
  images: string[];
  videos: string[];
  featured: string;
  location: string;
}

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [featured, setFeatured] = useState('');
  const [location, setLocation] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Load categories
      const { data: cats } = await supabase.from('categories').select('id, name').order('name');
      if (cats) setCategories(cats);
      
      // Load product
      const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
      if (product) {
        setSku(product.sku || '');
        setName(product.name || '');
        setDescription(product.description || '');
        setCategory(product.category || '');
        setCategoryId(product.category_id || '');
        setCoverImage(product.cover_image || '');
        setImages(product.images || []);
        setVideos(product.videos || []);
        setFeatured(product.featured || '');
        setLocation(product.location || '');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.from('products').update({
        sku,
        name,
        description,
        category,
        category_id: categoryId,
        cover_image: coverImage,
        images,
        videos,
        featured: featured || null,
        location,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: '保存成功！' });
      setTimeout(() => router.push('/admin'), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  // Image handlers
  const handleAddImage = () => {
    setImages([...images, '']);
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Video handlers
  const handleAddVideo = () => {
    setVideos([...videos, '']);
  };

  const handleVideoChange = (index: number, value: string) => {
    const newVideos = [...videos];
    newVideos[index] = value;
    setVideos(newVideos);
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个产品吗？')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      router.push('/admin');
    } catch (error) {
      alert('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-bold text-gray-900">编辑产品</h1>
          <button type="submit" form="product-form" disabled={saving} className="text-teal-600 font-medium">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      {/* Form */}
      <form id="product-form" onSubmit={handleSubmit} className="flex-1 px-4 py-4 pb-24 space-y-6 max-w-2xl mx-auto w-full overflow-y-auto">
        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Basic Info Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">基本信息</h2>
          
          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">产品编号</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="如: ZJ-001"
            />
          </div>

          {/* Name */}
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

          {/* Description */}
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

          {/* Category */}
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

          {/* Location */}
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

          {/* Featured */}
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

        {/* Media Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">媒体文件</h2>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">封面图片</label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="封面图片URL"
            />
            {coverImage && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <img src={coverImage} alt="封面预览" className="w-full h-48 object-contain" />
              </div>
            )}
          </div>

          {/* Images List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                图片列表 ({images.length}张)
              </label>
              <button type="button" onClick={handleAddImage} className="text-sm text-teal-600 font-medium">
                + 添加图片
              </button>
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
                      <button type="button" onClick={() => handleRemoveImage(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Image Preview Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, index) => img && (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={img} alt={`图片 ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Videos List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                视频列表 ({videos.length}个)
              </label>
              <button type="button" onClick={handleAddVideo} className="text-sm text-teal-600 font-medium">
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
                      <button type="button" onClick={() => handleRemoveVideo(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Video Preview Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {videos.map((video, index) => video && (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <video 
                        src={video} 
                        className="w-full h-full object-cover" 
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

        {/* Delete Button */}
        <div className="pt-4 border-t border-gray-200">
          <button type="button" onClick={handleDelete} className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl">
            删除产品
          </button>
        </div>
      </form>
    </div>
  );
}
