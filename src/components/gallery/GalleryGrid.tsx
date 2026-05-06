'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { Product, Video } from '@/types';
import { cn } from '@/lib/utils';

interface GalleryGridProps {
  product: Product;
  isAuthenticated: boolean;
  onImageClick: (index: number) => void;
  onVideoClick: (video: Video) => void;
}

// 安全代理 URL，避免直接暴露存储地址
function getSecureUrl(url: string): string {
  if (!url) return '';
  // 如果是相对路径，直接返回
  if (url.startsWith('/')) return url;
  // 如果需要代理，转换为代理 URL
  const encodedUrl = encodeURIComponent(url);
  return `/api/file?url=${encodedUrl}`;
}

export function GalleryGrid({
  product,
  isAuthenticated,
  onImageClick,
  onVideoClick,
}: GalleryGridProps) {
  const mediaItems: Array<{
    type: 'image' | 'video';
    src?: string;
    poster?: string;
    url?: string;
    thumbnail?: string;
    id?: string;
    index: number;
    duration?: string;
  }> = [
    ...product.images.map((img: string, idx: number) => ({
      type: 'image' as const,
      src: img,
      index: idx,
    })),
    ...product.videos.map((video: Video) => ({
      type: 'video' as const,
      ...video,
      poster: video.poster,
      index: product.images.length,
    })),
  ];

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      {mediaItems.map((item, idx) => {
        if (item.type === 'video') {
          return (
            <button
              key={item.id || `video-${idx}`}
              onClick={() => onVideoClick(item as Video)}
              disabled={!isAuthenticated}
              className={cn(
                'relative aspect-[3/4] overflow-hidden rounded-lg group cursor-pointer disabled:cursor-not-allowed',
                !isAuthenticated && 'blur-sm'
              )}
            >
              <Image
                src={getSecureUrl(item.poster || item.thumbnail || item.url || '')}
                alt={`视频 ${item.id || idx + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-5 h-5 md:w-6 md:h-6 text-[#1A1A1A] fill-current ml-0.5" />
                </div>
              </div>
              {item.duration && (
                <span className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">
                  {item.duration}
                </span>
              )}
              {!isAuthenticated && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-4 h-4 text-[#1A1A1A]" />
                  </div>
                </div>
              )}
            </button>
          );
        }

        return (
          <button
            key={item.src || `image-${idx}`}
            onClick={() => onImageClick(item.index)}
            disabled={!isAuthenticated}
            className={cn(
              'relative aspect-[3/4] overflow-hidden rounded-lg group cursor-pointer disabled:cursor-not-allowed',
              !isAuthenticated && 'blur-sm'
            )}
          >
            <Image
              src={getSecureUrl(item.src || '')}
              alt={`图片 ${item.index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="33vw"
              loading="lazy"
            />
            {!isAuthenticated && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <span className="text-xs font-medium text-[#1A1A1A]">
                    {idx + 1}
                  </span>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
