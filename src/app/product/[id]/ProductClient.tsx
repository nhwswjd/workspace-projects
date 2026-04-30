'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface ProductClientProps {
  product: Product;
  categories: Category[];
}

export default function ProductClient({ product, categories }: ProductClientProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const allImages = [
    product.coverImage,
    ...product.images,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* 返回和标题 */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← 返回
        </button>
        <h1 className="flex-1 text-center font-medium text-gray-900 pr-12 truncate">
          {product.name}
        </h1>
      </div>

      {/* 分类导航 */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-gray-100">
        <Link
          href="/gallery"
          className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          全部
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.name}`}
            className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* 产品信息 */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-black text-white text-xs px-2 py-0.5 rounded">
            {product.sku}
          </span>
          <span className="text-sm text-gray-500">{product.category}</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {product.name}
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        {product.description && (
          <p className="text-gray-600 text-sm">{product.description}</p>
        )}
      </div>

      {/* 产品图片 - 竖向单列 */}
      <div className="px-4 space-y-4">
        {allImages.map((image, index) => (
          <div 
            key={index} 
            className="relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
            style={{ aspectRatio: '3/4', maxHeight: '500px' }}
            onClick={() => setSelectedImageIndex(index)}
          >
            <Image
              src={image}
              alt={`${product.name} - 图片 ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      {/* 产品视频 */}
      {product.videos && product.videos.length > 0 && (
        <div className="px-4 py-4">
          <video
            controls
            className="w-full max-w-md mx-auto rounded-lg bg-black"
            style={{ aspectRatio: '3/4' }}
          >
            <source src={product.videos[0].url} type="video/mp4" />
          </video>
        </div>
      )}

      {/* 图片查看器 */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl p-2"
            onClick={() => setSelectedImageIndex(null)}
          >
            ✕
          </button>
          <button
            className="absolute left-4 text-white text-2xl p-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex((prev) => 
                prev !== null ? (prev > 0 ? prev - 1 : allImages.length - 1) : null
              );
            }}
          >
            ←
          </button>
          <button
            className="absolute right-4 text-white text-2xl p-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex((prev) => 
                prev !== null ? (prev < allImages.length - 1 ? prev + 1 : 0) : null
              );
            }}
          >
            →
          </button>
          <div 
            className="relative w-full h-full max-w-lg max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[selectedImageIndex]}
              alt="查看大图"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <div className="absolute bottom-4 text-white text-sm">
            {selectedImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
