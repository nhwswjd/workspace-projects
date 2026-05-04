'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id?: string;
  sku?: string;
  name?: string;
  description?: string;
  price?: string;
  location?: string;
  contact?: string;
  images?: string[];
  videos?: string[];
  tags?: string;
  category_id?: string;
  sort_order?: number;
  video_urls?: string;
}

interface Tag {
  id: string;
  name: string;
  sort_order: number;
}

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [formData, setFormData] = useState<Product>({
    sku: '',
    name: '',
    description: '',
    price: '',
    location: '',
    contact: '',
    images: [],
    videos: [],
    tags: '',
    category_id: '',
    sort_order: 0,
    video_urls: ''
  });

  // Fetch available tags
  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const data = await res.json();
        setAvailableTags(data.tags || []);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem('atelier_authenticated');
      if (!authenticated) {
        router.push('/');
        return false;
      }
      return true;
    };

    if (!checkAuth()) return;
    fetchTags();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const uploadFormData = new FormData();
      for (let i = 0; i < files.length; i++) {
        uploadFormData.append('files', files[i]);
      }
      uploadFormData.append('sessionId', 'new-product');

      const res = await fetch('/api/upload-multiple', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrls([...imageUrls, ...data.urls]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploadingImages(false);
  };

  const uploadVideos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingVideos(true);
    try {
      const uploadFormData = new FormData();
      for (let i = 0; i < files.length; i++) {
        uploadFormData.append('files', files[i]);
      }
      uploadFormData.append('sessionId', 'new-product-videos');

      const res = await fetch('/api/upload-multiple', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setVideoUrls([...videoUrls, ...data.urls]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploadingVideos(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku) {
      alert('SKU编号不能为空');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: imageUrls,
          videos: videoUrls,
          video_urls: videoUrls.join(',')
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert('产品创建成功！');
        router.push('/admin');
      } else {
        const error = await res.json();
        alert('创建失败: ' + (error.error || '未知错误'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('创建失败');
    }
    setIsLoading(false);
  };

  const handleTagClick = (tagName: string) => {
    const currentTags = formData.tags || '';
    if (currentTags.includes(tagName)) {
      const newTags = currentTags.split(',').filter(t => t.trim() !== tagName).join(',');
      setFormData({ ...formData, tags: newTags });
    } else {
      const newTags = currentTags ? `${currentTags},${tagName}` : tagName;
      setFormData({ ...formData, tags: newTags });
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <Link href="/admin" className="text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold">新建产品</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU编号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="例如: P2024001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="产品名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagClick(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.tags?.includes(tag.name)
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="点击上方标签或手动输入，用逗号分隔"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="产品描述"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价格</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="价格"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="地址"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系方式</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="联系方式"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              产品图片（第1张将作为封面）
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => uploadImages(e.target.files)}
              className="hidden"
              id="image-upload"
              disabled={uploadingImages}
            />
            <label
              htmlFor="image-upload"
              className="block w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-teal-500 transition-colors"
            >
              {uploadingImages ? (
                <span className="text-gray-500">上传中...</span>
              ) : (
                <>
                  <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-500">点击选择多张图片</span>
                </>
              )}
            </label>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} alt="" className="w-full h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-teal-600 text-white text-xs px-1 rounded">封面</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">产品视频</label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => uploadVideos(e.target.files)}
              className="hidden"
              id="video-upload"
              disabled={uploadingVideos}
            />
            <label
              htmlFor="video-upload"
              className="block w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-teal-500 transition-colors"
            >
              {uploadingVideos ? (
                <span className="text-gray-500">上传中...</span>
              ) : (
                <>
                  <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-500">点击选择多个视频</span>
                </>
              )}
            </label>
            {videoUrls.length > 0 && (
              <div className="space-y-2 mt-3">
                {videoUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 rounded p-2">
                    <span className="text-sm text-gray-600">视频 {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400"
            >
              {isLoading ? '创建中...' : '创建产品'}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
