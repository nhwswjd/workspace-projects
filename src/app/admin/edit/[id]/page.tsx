'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [hidden, setHidden] = useState(false);
  const [featured, setFeatured] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [coverImage, setCoverImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  const [uploadingVideoIndex, setUploadingVideoIndex] = useState<number | null>(null);

  useEffect(() => {
    // Load categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      });

    // Load product
    if (id) {
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.product) {
            const p = data.product;
            setName(p.name || '');
            setSku(p.sku || '');
            setDescription(p.description || '');
            setCategoryId(p.category_id || '');
            setCategory(p.category || '');
            setLocation(p.location || '');
            setTags(Array.isArray(p.tags) ? p.tags.join('，') : (p.tags || ''));
            setHidden(p.hidden || false);
            setFeatured(p.featured || '');
            setSortOrder(p.sort_order || 0);
            
            // Handle cover image - might be string or object
            if (p.cover_image) {
              if (typeof p.cover_image === 'string') {
                setCoverImage(p.cover_image);
              } else if (p.cover_image?.url) {
                setCoverImage(p.cover_image.url);
              }
            }
            
            // Handle images array
            if (p.images) {
              const imgArray = Array.isArray(p.images) 
                ? p.images.map((img: any) => typeof img === 'string' ? img : img?.url || '')
                : [];
              setImages(imgArray.filter(Boolean));
            }
            
            // Handle videos array - properly extract video URLs
            if (p.videos) {
              if (typeof p.videos === 'string') {
                try {
                  const parsed = JSON.parse(p.videos);
                  setVideos(Array.isArray(parsed) ? parsed.map((v: any) => typeof v === 'string' ? v : v?.url || '').filter(Boolean) : []);
                } catch {
                  setVideos([]);
                }
              } else if (Array.isArray(p.videos)) {
                setVideos(p.videos.map((v: any) => typeof v === 'string' ? v : v?.url || '').filter(Boolean));
              } else {
                setVideos([]);
              }
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });

      if (res.ok) {
        alert('保存成功');
        router.push('/admin');
      } else {
        alert('保存失败');
      }
    } catch {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个产品吗？')) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('删除成功');
        router.push('/admin');
      } else {
        alert('删除失败');
      }
    } catch {
      alert('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 h-[52px]">
          <button onClick={() => router.push('/admin')} className="p-2 -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-medium">编辑产品</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-32">
        <div className="p-4 sm:p-6 lg:p-8 space-y-5">
          {/* Basic Info */}
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

            {/* 标签 */}
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

            {/* 隐藏 */}
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

          {/* Media Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">媒体文件</h2>

            {/* Cover Image */}
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
                  <svg className="w-5 h-5 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {uploadingCover ? '上传中...' : '上传'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingCover} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingCover(true);
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('type', 'images');
                      try {
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (data.success && data.url) {
                          setCoverImage(data.url);
                        } else {
                          alert(data.message || '上传失败');
                        }
                      } catch {
                        alert('上传失败');
                      } finally {
                        setUploadingCover(false);
                      }
                    }
                  }} />
                </label>
              </div>
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
                        <label className={`p-2 bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 ${uploadingImageIndex === index ? 'opacity-50' : ''}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <input type="file" accept="image/*" className="hidden" disabled={uploadingImageIndex === index} onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadingImageIndex(index);
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', 'images');
                              try {
                                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                const data = await res.json();
                                if (data.success && data.url) {
                                  handleImageChange(index, data.url);
                                } else {
                                  alert(data.message || '上传失败');
                                }
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
                  
                  {/* Image Preview Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, index) => img && (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                        <img src={img} alt={`图片 ${index + 1}`} className="w-full h-full object-cover" />
                        {/* Image Actions */}
                        <div className="absolute top-0 right-0 flex gap-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            className={`p-1 rounded ${index === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            title="上移"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
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
                            className={`p-1 rounded ${index === images.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            title="下移"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
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
                        <label className={`p-2 bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 ${uploadingVideoIndex === index ? 'opacity-50' : ''}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <input type="file" accept="video/*" className="hidden" disabled={uploadingVideoIndex === index} onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadingVideoIndex(index);
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', 'videos');
                              try {
                                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                const data = await res.json();
                                if (data.success && data.url) {
                                  handleVideoChange(index, data.url);
                                } else {
                                  alert(data.message || '上传失败');
                                }
                              } catch {
                                alert('上传失败');
                              } finally {
                                setUploadingVideoIndex(null);
                              }
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
                  
                  {/* Video Preview Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {videos.map((video, index) => video && (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <video 
                          src={video} 
                          className="w-full h-full" 
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
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-teal-500 text-white font-medium rounded-xl disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  );
}
