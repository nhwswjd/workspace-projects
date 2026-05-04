'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';

interface ProductData {
  id: string;
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.product) {
            const p = data.product;
            // 转换数据格式
            setProduct({
              id: p.id,
              sku: p.sku || '',
              name: p.name || '',
              description: p.description || '',
              category: p.category || '',
              category_id: p.category_id || '',
              location: p.location || '',
              tags: Array.isArray(p.tags) ? p.tags.join('，') : (p.tags || ''),
              featured: p.featured || '',
              hidden: p.hidden || false,
              sort_order: p.sort_order || 0,
              cover_image: typeof p.cover_image === 'string' ? p.cover_image : p.cover_image?.url || '',
              images: Array.isArray(p.images) 
                ? p.images.map((img: unknown) => typeof img === 'string' ? img : (img as {url?: string})?.url || '')
                : [],
              videos: Array.isArray(p.videos)
                ? p.videos.map((v: unknown) => typeof v === 'string' ? v : (v as {url?: string})?.url || '')
                : []
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

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

  const handleSuccess = () => {
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">产品不存在</div>
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
      <ProductForm initialData={product} onSuccess={handleSuccess} />

      {/* Delete Button */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="pt-4 border-t border-gray-200">
          <button 
            type="button" 
            onClick={handleDelete} 
            disabled={deleting}
            className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl disabled:opacity-50"
          >
            {deleting ? '删除中...' : '删除产品'}
          </button>
        </div>
      </div>
    </div>
  );
}
