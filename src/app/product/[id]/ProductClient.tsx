'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types';

interface ProductClientProps {
  product: Product;
  categories: Category[];
}

export default function ProductClient({ product, categories }: ProductClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const allImages = [
    product.coverImage,
    ...product.images,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white pb-8 pt-10">
      {/* 产品名称 */}
      <div className="max-w-full mx-auto px-1 py-4 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900 text-center">
          {product.name}
        </h1>
      </div>

      {/* 产品图片 - 竖向单列，无圆角，左右1mm空间 */}
      <div className="max-w-full mx-auto px-1 space-y-2 mt-2">
        {allImages.map((image, index) => (
          <div 
            key={index} 
            className="relative bg-gray-100 overflow-hidden cursor-pointer mx-auto"
            style={{ aspectRatio: '3/4', width: 'calc(100% - 2px)' }}
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
        <div className="max-w-[90%] mx-auto px-2 py-4">
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
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(null);
            }}
          >
            ×
          </button>
          
          {selectedImageIndex > 0 && (
            <button 
              className="absolute left-4 text-white text-3xl hover:text-gray-300 z-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex - 1);
              }}
            >
              ‹
            </button>
          )}
          
          {selectedImageIndex < allImages.length - 1 && (
            <button 
              className="absolute right-4 text-white text-3xl hover:text-gray-300 z-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex + 1);
              }}
            >
              ›
            </button>
          )}
          
          <div 
            className="relative w-full h-full max-w-3xl max-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[selectedImageIndex]}
              alt={`${product.name} - 图片 ${selectedImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {selectedImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
