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
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16/9); // 默认横向

  // 提取视频URL，处理两种格式
  const getVideoUrl = (video: any): string => {
    if (!video) return '';
    if (typeof video.url === 'string') {
      return video.url;
    }
    if (typeof video.url === 'object' && video.url?.url) {
      return video.url.url;
    }
    return '';
  };

  // 检测视频方向
  const handleVideoLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.videoWidth && video.videoHeight) {
      const ratio = video.videoWidth / video.videoHeight;
      setVideoAspectRatio(ratio);
    }
  };

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

      {/* 产品图片 - 自适应图片比例，宽度不超过屏幕 */}
      <div className="max-w-full mx-auto px-1 space-y-2 mt-2">
        {allImages.map((image, index) => (
          <div 
            key={index} 
            className="relative bg-gray-100 overflow-hidden cursor-pointer mx-auto max-w-full"
            style={{ maxHeight: '70vh', width: 'auto' }}
            onClick={() => setSelectedImageIndex(index)}
          >
            <Image
              src={image}
              alt={`${product.name} - 图片 ${index + 1}`}
              width={800}
              height={600}
              className="object-contain max-w-full max-h-[70vh] mx-auto"
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '70vh' }}
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* 产品视频 - 根据视频方向自适应尺寸 */}
      {(() => {
        const firstVideoUrl = product.videos?.[0] ? getVideoUrl(product.videos[0]) : '';
        return firstVideoUrl ? (
          <div className="max-w-[95%] mx-auto px-2 py-4">
            <div 
              className="mx-auto bg-black rounded-lg overflow-hidden"
              style={{ 
                width: videoAspectRatio >= 1 ? '100%' : `${Math.min(70, videoAspectRatio * 100)}vh`,
                maxWidth: '100%',
                height: videoAspectRatio >= 1 ? 'auto' : '80vh',
                aspectRatio: videoAspectRatio >= 1 ? 'auto' : `${videoAspectRatio}`
              }}
            >
              <video
                controls
                className="w-full h-full object-contain"
                playsInline
                onLoadedMetadata={handleVideoLoaded}
              >
                <source src={firstVideoUrl} type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
            </div>
          </div>
        ) : null;
      })()}

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
