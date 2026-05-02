'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Video, Loader2, Check, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Product, Category } from '@/types/admin'; 

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

interface FormData {
  id: string;
  sku: string;
  name: string;
  tags: string;
  description: string;
  category: string;
  categoryId: string;
  coverImage: string;
  images: string;
  videos: string;
  featured: string;
  location: string;
  hidden: boolean;
  sortOrder: number;
}

const initialFormData: FormData = {
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
};

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  message?: string;
}

export default function ProductModal({ product, categories, isOpen, onClose, onSave }: ProductModalProps) {
  const [form, setForm] = useState<FormData>(initialFormData);
  const [uploadingImages, setUploadingImages] = useState<Record<string, 'uploading' | 'success' | 'error'>>({});
  const [uploadingVideos, setUploadingVideos] = useState<Record<string, 'uploading' | 'success' | 'error'>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseRef = useRef<SupabaseClient | null>(null);
  
  const getSupabaseClient = () => {
    if (!supabaseRef.current && supabaseUrl && supabaseAnonKey) {
      supabaseRef.current = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseRef.current;
  };

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

  const uploadFile = async (file: File, type: 'images' | 'videos'): Promise<UploadResult> => {
    const bucketId = type === 'videos' ? 'product-videos' : 'product-images';
    const maxSize = type === 'videos' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    const allowedTypes = type === 'videos' 
      ? ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
      : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
      return { success: false, message: `文件大小超过${type === 'videos' ? '100MB' : '10MB'}限制` };
    }
    if (!allowedTypes.includes(file.type)) {
      return { success: false, message: `不支持的文件类型: ${file.type}` };
    }
    
    const ext = file.name.split('.').pop() || (type === 'videos' ? 'mp4' : 'jpg');
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    
    try {
      const client = getSupabaseClient();
      if (!client) {
        return { success: false, message: 'Supabase客户端未初始化' };
      }
      
      const { data, error } = await client.storage
        .from(bucketId)
        .upload(fileName, file, { contentType: file.type, upsert: true });
      
      if (error) {
        return { success: false, message: `上传失败: ${error.message}` };
      }
      
      const { data: urlData } = client.storage.from(bucketId).getPublicUrl(fileName);
      const publicUrl = typeof urlData === 'string' ? urlData : (urlData as { publicUrl?: string })?.publicUrl || '';
      return { success: true, url: publicUrl, path: fileName };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return { success: false, message: err?.message || '上传失败' };
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
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
    }
    
    if (hasError) {
      setTimeout(() => setUploadError(null), 3000);
    }
    
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
      if (file.size > 100 * 1024 * 1024) {
        setUploadError(`文件 "${file.name}" 超过100MB限制`);
        continue;
      }
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
      
      setTimeout(() => setUploadingVideos(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      }), 2000);
    }
    
    if (newUrls.length > 0) {
      const currentVideos = form.videos.split('\n').filter(Boolean);
      console.log('[DEBUG] handleVideoUpload - currentVideos:', currentVideos);
      console.log('[DEBUG] handleVideoUpload - newUrls:', newUrls);
      setForm(prev => ({
        ...prev,
        videos: [...currentVideos, ...newUrls].join('\n')
      }));
      console.log('[DEBUG] handleVideoUpload - new form.videos:', [...currentVideos, ...newUrls].join('\n'));
    }
    
    if (hasError) {
      setTimeout(() => setUploadError(null), 3000);
    }
    
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const moveImage = (index: number, direction: number) => {
    const images = form.images.split('\n').filter(Boolean);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    [images[index], images[newIndex]] = [images[newIndex], images[index]];
    setForm(prev => ({ ...prev, images: images.join('\n') }));
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
    const videosData = form.videos.split('\n').map(v => v.trim()).filter(Boolean).map(url => ({ url, thumbnail: '' }));
    console.log('[DEBUG] form.videos:', form.videos);
    console.log('[DEBUG] videosData:', videosData);
    onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: form.images.split('\n').map(i => i.trim()).filter(Boolean),
      videos: videosData,
      category: selectedCategory?.name || form.category,
      featured: form.featured || null,
    });
  };

  const currentImages = form.images.split('\n').filter(Boolean);
  const currentVideos = form.videos.split('\n').filter(Boolean);
  const isUploading = Object.values(uploadingImages).includes('uploading') || Object.values(uploadingVideos).includes('uploading');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">{product?.id ? '编辑产品' : '添加产品'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 基本信息 */}
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">精选标签</label>
              <input
                type="text"
                value={form.featured}
                onChange={e => setForm({ ...form, featured: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="留空则不显示"
              />
            </div>
          </div>

          {/* 封面图 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面图</label>
            <input type="file" ref={coverInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />
            <div className="flex items-center gap-3">
              {form.coverImage ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <Image src={form.coverImage} alt="封面" fill className="object-cover" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400"
                >
                  <ImageIcon size={24} />
                  <span className="text-xs mt-1">上传</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                disabled={uploadingImages.cover === 'uploading'}
              >
                {uploadingImages.cover === 'uploading' ? (
                  <><Loader2 size={14} className="animate-spin" /> 上传中...</>
                ) : uploadingImages.cover === 'success' ? (
                  <><Check size={14} className="text-green-600" /> 成功</>
                ) : uploadingImages.cover === 'error' ? (
                  <><AlertCircle size={14} className="text-red-600" /> 失败</>
                ) : (
                  <><Upload size={14} /> 选择封面</>
                )}
              </button>
            </div>
          </div>

          {/* 产品图片 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">产品图片</label>
            <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm mb-2"
              disabled={Object.values(uploadingImages).includes('uploading')}
            >
              {Object.values(uploadingImages).includes('uploading') ? (
                <><Loader2 size={14} className="animate-spin" /> 上传中...</>
              ) : (
                <><Upload size={14} /> 添加图片</>
              )}
            </button>
            
            {uploadError && (
              <div className="mb-2 px-2 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{uploadError}</div>
            )}
            
            {currentImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {currentImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-20 rounded-lg overflow-hidden border">
                      <Image src={url} alt={`图片 ${index + 1}`} fill className="object-cover" />
                      <div className="absolute top-1 left-1 flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveImage(index, -1)}
                          disabled={index === 0}
                          className="w-5 h-5 bg-black/50 text-white rounded flex items-center justify-center disabled:opacity-30"
                        >
                          <ArrowUp size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, 1)}
                          disabled={index === currentImages.length - 1}
                          className="w-5 h-5 bg-black/50 text-white rounded flex items-center justify-center disabled:opacity-30"
                        >
                          <ArrowDown size={10} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
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

          {/* 产品视频 */}
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
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm mb-2"
              disabled={Object.values(uploadingVideos).includes('uploading')}
            >
              {Object.values(uploadingVideos).includes('uploading') ? (
                <><Loader2 size={14} className="animate-spin" /> 上传中...</>
              ) : (
                <><Video size={14} /> 添加视频</>
              )}
            </button>
            
            {currentVideos.length > 0 && (
              <div className="space-y-2">
                {currentVideos.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Video size={16} className="text-gray-400" />
                    <span className="flex-1 text-sm text-gray-600 truncate">{url.split('/').pop()}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">支持 MP4、WebM，最大 100MB</p>
          </div>

          {/* 隐藏选项 */}
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

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <><Loader2 size={16} className="animate-spin" /> 上传中...</>
              ) : '保存'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
