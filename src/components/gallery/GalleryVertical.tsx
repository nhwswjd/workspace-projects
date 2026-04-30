'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { Product, Video } from '@/types';

interface GalleryVerticalProps {
  product: Product;
  isAuthenticated: boolean;
  onImageClick: (index: number) => void;
  onVideoClick: (video: Video) => void;
}

export function GalleryVertical({
  product,
  isAuthenticated,
  onImageClick,
  onVideoClick,
}: GalleryVerticalProps) {
  return (
    <div className="space-y-3">
      {/* Images - Vertical single column */}
      {product.images.map((src, idx) => (
        <div
          key={idx}
          className="relative w-full"
          style={{ aspectRatio: '3/4' }}
        >
          <Image
            src={src}
            alt={`图片 ${idx + 1}`}
            fill
            className="object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => isAuthenticated && onImageClick(idx)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
            loading="lazy"
          />
          {!isAuthenticated && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 px-3 py-1.5 rounded-full text-sm text-muted-foreground">
                点击解锁查看
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Videos - At the bottom */}
      {product.videos.map((video) => (
        <div
          key={video.id}
          className="relative w-full cursor-pointer group"
          style={{ aspectRatio: '3/4' }}
          onClick={() => isAuthenticated && onVideoClick(video)}
        >
          <Image
            src={video.poster}
            alt="视频封面"
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-[#1A1A1A] fill-current ml-1" />
            </div>
          </div>
          {video.duration && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </div>
          )}
          {!isAuthenticated && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 px-3 py-1.5 rounded-full text-sm text-muted-foreground">
                点击解锁查看
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
