'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

// Supabase配置
const SUPABASE_URL = 'https://br-bonny-deer-52ec6415.supabase2.aidap-global.cn-beijing.volces.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTgwNTI0MTIsInJvbGUiOiJhbm9uIn0.0FNIFZWNcQgZ0tL9cLNFtcrVjBFxH_npbv2TBvAQkOw';

interface Category {
  id: string;
  name: string;
}

interface Tag {
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
  featured_right_bottom?: string;
  hidden?: boolean;
  sort_order?: number;
  cover_image?: string;
  images?: string[];
  videos?: string[];
  notes?: string;
}

interface FeaturedOption {
  id: string;
  type: string;
  name: string;
  sort_order: number;
}

interface ProductFormProps {
  initialData?: ProductData;
  onSuccess?: () => void;
}

// 标签选项现在从数据库加载（见 useEffect）

// ==================== 文件压缩功能 ====================

// 图片压缩配置：90%质量，保持原尺寸
const imageCompressionOptions = {
  maxSizeMB: 2, // 最大2MB
  maxWidthOrHeight: 3000, // 最大尺寸，不裁剪
  useWebWorker: true,
  fileType: 'image/webp' as const, // 转为WebP格式，体积更小
  initialQuality: 0.9, // 90%质量，几乎无损
};

// 压缩图片
async function compressImage(file: File): Promise<File> {
  try {
    console.log(`[压缩] 原始图片: ${file.name}, 大小: ${(file.size / 1024).toFixed(1)}KB`);
    const compressedFile = await imageCompression(file, imageCompressionOptions);
    console.log(`[压缩] 压缩后: ${file.name}, 大小: ${(compressedFile.size / 1024).toFixed(1)}KB, 减少: ${((1 - compressedFile.size / file.size) * 100).toFixed(0)}%`);
    return compressedFile;
  } catch (error) {
    console.error('[压缩] 图片压缩失败，使用原图:', error);
    return file;
  }
}

// 视频压缩配置
const videoCompressionOptions = {
  maxWidth: 1280, // 最大宽度
  maxHeight: 720, // 最大高度
  videoBitrate: 2000, // 2Mbps，清晰且体积小
  audioBitrate: '128k',
};

// FFmpeg实例（全局复用）
let ffmpegInstance: any = null;
let ffmpegLoaded = false;

// 初始化FFmpeg
async function getFFmpeg() {
  if (ffmpegInstance && ffmpegLoaded) {
    return ffmpegInstance;
  }
  
  // 动态加载 FFmpeg
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { fetchFile } = await import('@ffmpeg/util');
  
  ffmpegInstance = new FFmpeg();
  
  ffmpegInstance.on('progress', ({ progress }: { progress: number }) => {
    console.log(`[视频压缩] 进度: ${Math.round(progress * 100)}%`);
  });
  
  // 使用 CDN 加载，避免构建问题
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpegInstance.load({
    coreURL: `${baseURL}/ffmpeg-core.js`,
    wasmURL: `${baseURL}/ffmpeg-core.wasm`,
  });
  
  ffmpegLoaded = true;
  console.log('[视频压缩] FFmpeg加载完成');
  
  // 返回包含 fetchFile 的对象
  return { ffmpeg: ffmpegInstance, fetchFile };
}

// 压缩视频
async function compressVideo(file: File): Promise<File> {
  try {
    console.log(`[视频压缩] 原始视频: ${file.name}, 大小: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
    
    const { ffmpeg, fetchFile } = await getFFmpeg();
    const inputName = 'input.mp4';
    const outputName = 'output.mp4';
    
    // 写入输入文件
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    
    // 执行压缩：720p, 2Mbps
    await ffmpeg.exec([
      '-i', inputName,
      '-vf', `scale='min(${videoCompressionOptions.maxWidth},iw)':min'(${videoCompressionOptions.maxHeight},ih)':force_original_aspect_ratio=decrease`,
      '-c:v', 'libx264',
      '-b:v', `${videoCompressionOptions.videoBitrate}k`,
      '-c:a', 'aac',
      '-b:a', videoCompressionOptions.audioBitrate,
      '-preset', 'fast',
      '-crf', '23',
      '-movflags', '+faststart',
      outputName
    ]);
    
    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data], { type: 'video/mp4' });
    const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.mp4'), { type: 'video/mp4' });
    
    // 清理临时文件
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);
    
    console.log(`[视频压缩] 压缩后: ${compressedFile.name}, 大小: ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB, 减少: ${((1 - compressedFile.size / file.size) * 100).toFixed(0)}%`);
    return compressedFile;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[视频压缩] 压缩失败，使用原视频:', errorMsg);
    alert(`视频压缩失败: ${errorMsg}\n将使用原视频上传。`);
    return file;
  }
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
  const [tags, setTags] = useState<string[]>([]); // 改为数组
  const [tagInput, setTagInput] = useState(''); // 手动输入标签
  const [hidden, setHidden] = useState(initialData?.hidden || false);
  const [featured, setFeatured] = useState(initialData?.featured || '');
  const [featuredRightBottom, setFeaturedRightBottom] = useState(initialData?.featured_right_bottom || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order || 0);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [videos, setVideos] = useState<string[]>(initialData?.videos || []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [featuredOptions, setFeaturedOptions] = useState<{ featured: FeaturedOption[], featuredRightBottom: FeaturedOption[] }>({ featured: [], featuredRightBottom: [] });
  const [saving, setSaving] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  const [uploadingVideoIndex, setUploadingVideoIndex] = useState<number | null>(null);
  const [uploadingMultiple, setUploadingMultiple] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  // 初始化标签（从字符串解析）
  useEffect(() => {
    if (initialData?.tags) {
      if (typeof initialData.tags === 'string') {
        setTags(initialData.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean));
      } else if (Array.isArray(initialData.tags)) {
        setTags(initialData.tags);
      }
    }
  }, [initialData]);

  // 加载分类、标签和标签选项
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/tags').then(res => res.json()),
      fetch('/api/featured-options').then(res => res.json())
    ]).then(([catData, tagData, optionsData]) => {
      if (catData.categories) setCategories(catData.categories);
      if (tagData.tags) setAvailableTags(tagData.tags);
      if (optionsData.success) {
        setFeaturedOptions({
          featured: optionsData.featuredOptions || [],
          featuredRightBottom: optionsData.featuredRightBottomOptions || []
        });
      }
    });
  }, []);

  // 切换标签选中
  const toggleTag = (tagName: string) => {
    if (tags.includes(tagName)) {
      setTags(tags.filter(t => t !== tagName));
    } else {
      setTags([...tags, tagName]);
    }
  };

  // 添加手动输入的标签
  const addCustomTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    // 如果删除的是封面图片，用新的第一张作为封面
    if (coverImage === images[index]) {
      setCoverImage(newImages[0] || '');
    }
  };

  // 批量上传图片后自动设置封面（自动压缩）
  const handleBatchUploadImages = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadingMultiple(true);
    try {
      const newUrls: string[] = [];
      for (const file of files) {
        // 自动压缩图片
        const compressedFile = await compressImage(file);
        const url = await uploadFile(compressedFile);
        if (url) newUrls.push(url);
      }
      if (newUrls.length > 0) {
        const updatedImages = [...images, ...newUrls];
        setImages(updatedImages);
        // 如果之前没有封面，设置第一张为封面
        if (!coverImage && updatedImages.length > 0) {
          setCoverImage(updatedImages[0]);
        }
      }
      if (newUrls.length < files.length) {
        alert(`成功 ${newUrls.length} 张，失败 ${files.length - newUrls.length} 张`);
      }
    } catch {
      alert('上传失败');
    } finally {
      setUploadingMultiple(false);
    }
  };

  // 单个上传图片（自动压缩）
  const handleSingleUploadImage = async (index: number, file: File) => {
    setUploadingImageIndex(index);
    try {
      // 自动压缩图片
      const compressedFile = await compressImage(file);
      const url = await uploadFile(compressedFile);
      if (url) {
        const newImages = [...images];
        newImages[index] = url;
        setImages(newImages);
        // 如果是第一张图片，更新封面
        if (index === 0 && !coverImage) {
          setCoverImage(url);
        }
      } else {
        alert('上传失败');
      }
    } catch {
      alert('上传失败');
    } finally {
      setUploadingImageIndex(null);
    }
  };

  // 批量上传视频（自动压缩转码为720p）
  const handleBatchUploadVideos = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadingVideos(true);
    try {
      const newUrls: string[] = [];
      for (const file of files) {
        // 自动压缩视频
        const compressedFile = await compressVideo(file);
        const url = await uploadFile(compressedFile);
        if (url) newUrls.push(url);
      }
      if (newUrls.length > 0) {
        setVideos([...videos, ...newUrls]);
      }
      if (newUrls.length < files.length) {
        alert(`成功 ${newUrls.length} 个，失败 ${files.length - newUrls.length} 个`);
      }
    } catch {
      alert('上传失败');
    } finally {
      setUploadingVideos(false);
    }
  };

  // 单个上传视频（自动压缩）
  const handleSingleUploadVideo = async (index: number, file: File) => {
    setUploadingVideoIndex(index);
    try {
      // 自动压缩视频
      const compressedFile = await compressVideo(file);
      const url = await uploadFile(compressedFile);
      if (url) {
        const newVideos = [...videos];
        newVideos[index] = url;
        setVideos(newVideos);
      } else {
        alert('上传失败');
      }
    } catch {
      alert('上传失败');
    } finally {
      setUploadingVideoIndex(null);
    }
  };

  // 删除视频
  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  // 设置封面图片
  const setAsCover = (index: number) => {
    if (images[index]) {
      setCoverImage(images[index]);
    }
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
      categoryId,
      location,
      featured: featured || null,
      featured_right_bottom: featuredRightBottom || null,
      tags,
      hidden,
      notes: notes || null,
      coverImage: coverImage || images[0] || '', // 优先用封面，否则用第一张图片
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              placeholder="产品备注信息"
              rows={3}
            />
          </div>

          {/* 标签 - 点选 + 输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">标签</label>
            {/* 常用标签点选 */}
            <div className="flex flex-wrap gap-2 mb-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    tags.includes(tag.name)
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            {/* 手动输入 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="输入非常用标签，按回车添加"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
              >
                添加
              </button>
            </div>
            {/* 已选标签展示 */}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      className="hover:text-teal-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 展示状态 - 点选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">展示状态</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHidden(false)}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  !hidden
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                展示中
              </button>
              <button
                type="button"
                onClick={() => setHidden(true)}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  hidden
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                已隐藏
              </button>
            </div>
          </div>

          {/* 右上标签 - 点选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">右上标签</label>
            <div className="flex flex-wrap gap-2">
              {featuredOptions.featured?.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFeatured(opt.name)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    featured === opt.name
                      ? 'bg-orange-500 text-white'
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* 右下标签 - 点选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">右下标签</label>
            <div className="flex flex-wrap gap-2">
              {featuredOptions.featuredRightBottom?.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFeaturedRightBottom(opt.name)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    featuredRightBottom === opt.name
                      ? 'bg-green-500 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 媒体文件 */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">媒体文件</h2>

          {/* 图片列表 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                图片列表 ({images.length}张)
                {coverImage && <span className="ml-2 text-xs text-teal-600">✓ 封面已设置</span>}
              </label>
              <label className={`text-sm text-teal-600 font-medium cursor-pointer ${uploadingMultiple ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {uploadingMultiple ? '上传中...' : '+ 批量上传图片'}
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  disabled={uploadingMultiple} 
                  onChange={(e) => handleBatchUploadImages(Array.from(e.target.files || []))}
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
                        onChange={(e) => {
                          const newImages = [...images];
                          newImages[index] = e.target.value;
                          setImages(newImages);
                        }}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="图片URL"
                      />
                      {/* 单个上传按钮 */}
                      <label className={`p-2 bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 ${uploadingImageIndex === index ? 'opacity-50' : ''}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          disabled={uploadingImageIndex === index} 
                          onChange={(e) => e.target.files?.[0] && handleSingleUploadImage(index, e.target.files[0])}
                        />
                      </label>
                      {/* 删除按钮 */}
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
                    <div key={index} className={`relative rounded-xl overflow-hidden bg-gray-50 border-2 ${coverImage === img ? 'border-teal-500' : 'border-gray-200'} shadow-sm`}>
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={img} alt={`图片 ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2 flex items-center justify-between bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold ${
                            coverImage === img ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-xs text-gray-500">图片{index + 1}</span>
                          {coverImage === img && <span className="text-xs text-teal-600 font-medium">封面</span>}
                        </div>
                        <div className="flex gap-1">
                          {/* 上移 */}
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
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                              index === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            ↑
                          </button>
                          {/* 下移 */}
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
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                              index === images.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            ↓
                          </button>
                          {/* 设为封面 */}
                          <button
                            type="button"
                            onClick={() => setAsCover(index)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                              coverImage === img 
                                ? 'bg-teal-500 text-white cursor-default' 
                                : 'bg-gray-100 text-gray-600 hover:bg-teal-500 hover:text-white'
                            }`}
                            title="设为封面"
                          >
                            ★
                          </button>
                          {/* 删除 */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="w-8 h-8 bg-red-500 text-white flex items-center justify-center rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
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

          {/* 视频列表 - 批量上传 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                视频列表 ({videos.length}个)
              </label>
              <label className={`text-sm text-teal-600 font-medium cursor-pointer ${uploadingVideos ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {uploadingVideos ? '上传中...' : '+ 批量上传视频'}
                <input 
                  type="file" 
                  accept="video/*" 
                  multiple 
                  className="hidden" 
                  disabled={uploadingVideos} 
                  onChange={(e) => handleBatchUploadVideos(Array.from(e.target.files || []))}
                />
              </label>
            </div>
            
            {videos.length > 0 && (
              <>
                {/* 视频预览网格 */}
                <div className="grid grid-cols-2 gap-4">
                  {videos.map((video, index) => video && (
                    <div key={index} className="relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200" style={{minHeight: '150px'}}>
                      <video 
                        src={video} 
                        className="w-full h-auto max-h-48 object-contain" 
                        controls 
                        preload="metadata"
                      />
                      <div className="absolute top-0 left-0 right-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-2">
                        <span className="text-white text-xs font-medium">视频 {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(index)}
                          className="w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
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
