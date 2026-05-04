'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Image, Video, Plus, Check } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  // Generate unique session ID for uploads
  const sessionId = useState(() => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)[0];

  useEffect(() => {
    // Load tags
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => {
        if (data.tags) setAllTags(data.tags);
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
            setTags(p.tags?.join('，') || '');

            // Handle images - merge cover and images
            const imgList: string[] = [];
            if (p.cover_image) {
              const coverUrl = typeof p.cover_image === 'string' ? p.cover_image : p.cover_image?.url;
              if (coverUrl) imgList.push(coverUrl);
            }
            if (p.images && Array.isArray(p.images)) {
              p.images.forEach((img: any) => {
                const url = typeof img === 'string' ? img : img?.url;
                if (url && !imgList.includes(url)) imgList.push(url);
              });
            }
            setImages(imgList);

            // Handle videos
            if (p.videos) {
              let vidList: string[] = [];
              if (typeof p.videos === 'string') {
                try { vidList = JSON.parse(p.videos); } catch {}
              } else if (Array.isArray(p.videos)) {
                vidList = p.videos;
              }
              setVideos(vidList.map((v: any) => typeof v === 'string' ? v : v?.url || '').filter(Boolean));
            }

            // Extract tag IDs from tag names
            const tagNames = Array.isArray(p.tags) ? p.tags : [];
            const matchedIds = allTags.filter(t => tagNames.includes(t.name)).map(t => t.id);
            setSelectedTagIds(matchedIds);
          }
        });
    }
  }, [id]);

  // Upload multiple images
  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('sessionId', sessionId);

    try {
      const res = await fetch('/api/upload-multiple', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.urls) {
        setImages(prev => [...prev, ...data.urls]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploadingImages(false);
    e.target.value = '';
  };

  // Upload multiple videos
  const handleUploadVideos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingVideos(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('sessionId', sessionId);

    try {
      const res = await fetch('/api/upload-multiple', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.urls) {
        setVideos(prev => [...prev, ...data.urls]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploadingVideos(false);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  // Toggle tag selection
  const toggleTag = (tagId: string, tagName: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
      // Remove from tags string
      const currentTags = tags.split(/[,，]/).map(t => t.trim()).filter(Boolean);
      setTags(currentTags.filter(t => t !== tagName).join('，'));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
      // Add to tags string
      const currentTags = tags.split(/[,，]/).map(t => t.trim()).filter(Boolean);
      if (!currentTags.includes(tagName)) {
        setTags([...currentTags, tagName].join('，'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) {
      alert('请输入编号');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          sku: sku.trim(),
          tags: tags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
          cover_image: images[0] || null,
          images: images.slice(1),
          videos: videos.filter(Boolean)
        })
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        alert('保存失败');
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('保存失败');
    }
    setSaving(false);
  };

  if (!id) {
    return <div className="p-4">无效的产品ID</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-medium">编辑产品</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
        {/* 编号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            编号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入编号"
          />
        </div>

        {/* 名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="可选"
          />
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {allTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id, tag.name)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="选标签或手动输入，逗号分隔"
          />
        </div>

        {/* 产品图片 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            产品图片 {images.length > 0 && <span className="text-gray-400 font-normal">(第1张为封面)</span>}
          </label>
          
          {/* Upload button */}
          <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUploadImages}
              className="hidden"
              disabled={uploadingImages}
            />
            {uploadingImages ? (
              <span className="text-gray-500">上传中...</span>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500">点击选择多张图片</span>
              </>
            )}
          </label>

          {/* Image grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 px-1 py-0.5 bg-blue-500 text-white text-xs rounded">封面</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 产品视频 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">产品视频</label>
          
          {/* Upload button */}
          <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleUploadVideos}
              className="hidden"
              disabled={uploadingVideos}
            />
            {uploadingVideos ? (
              <span className="text-gray-500">上传中...</span>
            ) : (
              <>
                <Video className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500">点击选择多个视频</span>
              </>
            )}
          </label>

          {/* Video list */}
          {videos.length > 0 && (
            <div className="space-y-2 mt-3">
              {videos.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                  <Video className="w-4 h-4 text-gray-500" />
                  <span className="flex-1 text-sm text-gray-600 truncate">视频 {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
