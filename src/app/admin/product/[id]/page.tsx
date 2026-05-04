'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  categoryId?: string;
  location?: string;
  tags?: string[];
  hidden?: boolean;
  featured?: boolean;
  featuredRightBottom?: string | null;
  coverImage?: string;
  cover_image?: string;
  images?: string[];
  videos?: string[];
  sortOrder?: number;
  created_at?: string;
  updated_at?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainImage, setMainImage] = useState('');

  // 检查登录状态 - 未登录则跳转到首页
  useEffect(() => {
    const authData = localStorage.getItem('atelier_authenticated');
    if (authData !== 'true') {
      router.replace('/');
      return;
    }
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.product) {
          setProduct(data.product);
          const cover = data.product.coverImage || data.product.cover_image || '';
          setMainImage(cover);
        } else {
          setError('产品不存在');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('加载失败');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
        <div className="text-gray-500 mb-4">{error || '产品不存在'}</div>
        <Link href="/admin" className="text-[#14b8a6] hover:underline">
          返回产品管理
        </Link>
      </div>
    );
  }

  const coverImage = product.coverImage || product.cover_image;
  const allImages = coverImage ? [coverImage, ...(product.images || [])] : (product.images || []);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/admin" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-medium text-gray-800 flex-1 truncate">{product.name}</h1>
          <Link
            href={`/admin/edit/${product.id}`}
            className="px-4 py-2 bg-[#14b8a6] text-white text-sm rounded-lg hover:bg-[#0d9488]"
          >
            编辑
          </Link>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4 max-w-2xl mx-auto">
        {/* 图片展示 */}
        {allImages.length > 0 && (
          <div className="bg-white rounded-xl overflow-hidden mb-4">
            {/* 主图 */}
            <div className="aspect-[3/4] relative bg-gray-100">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  暂无图片
                </div>
              )}
            </div>
            
            {/* 缩略图列表 */}
            {allImages.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      mainImage === img ? 'border-[#14b8a6]' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 视频展示 */}
        {product.videos && product.videos.length > 0 && (
          <div className="bg-white rounded-xl overflow-hidden mb-4">
            <div className="p-3 border-b border-gray-100">
              <h2 className="font-medium text-gray-800">视频</h2>
            </div>
            <div className="p-3 space-y-3">
              {product.videos.map((video, idx) => (
                <video
                  key={idx}
                  src={video}
                  controls
                  className="w-full rounded-lg bg-black max-h-64"
                />
              ))}
            </div>
          </div>
        )}

        {/* 产品信息 */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="p-4 space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">编号</label>
                <p className="text-sm font-medium text-gray-800">{product.sku || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">排序</label>
                <p className="text-sm font-medium text-gray-800">#{product.sortOrder ?? 0}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">分类</label>
                <p className="text-sm font-medium text-gray-800">{product.category || product.categoryId || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">状态</label>
                <p className="text-sm">
                  {product.hidden ? (
                    <span className="text-gray-400">已隐藏</span>
                  ) : (
                    <span className="text-green-600">显示中</span>
                  )}
                </p>
              </div>
            </div>

            {/* 标签 */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <label className="text-xs text-gray-500">标签</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 位置 */}
            {product.location && (
              <div>
                <label className="text-xs text-gray-500">位置</label>
                <p className="text-sm text-gray-800">{product.location}</p>
              </div>
            )}

            {/* 描述 */}
            {product.description && (
              <div>
                <label className="text-xs text-gray-500">描述</label>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* 右上标识 */}
            {product.featured && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#14b8a6]/10 text-[#14b8a6] text-sm rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {product.featured}
              </div>
            )}

            {/* 右下标识 */}
            {product.featuredRightBottom && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-500 text-sm rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {product.featuredRightBottom}
              </div>
            )}

            {/* 更新时间 */}
            {product.updated_at && (
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                最后更新: {new Date(product.updated_at).toLocaleString('zh-CN')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
