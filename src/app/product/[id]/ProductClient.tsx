'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types';

interface ProductClientProps {
  product: Product;
  categories: Category[];
}

export default function ProductClient({ product, categories }: ProductClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoPoster, setVideoPoster] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // 从视频中截取第一帧作为封面
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const captureFrame = () => {
      if (video.readyState >= 2 && !videoPoster) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setVideoPoster(dataUrl);
        }
      }
    };

    video.addEventListener('loadeddata', captureFrame);
    video.addEventListener('seeked', captureFrame);
    
    return () => {
      video.removeEventListener('loadeddata', captureFrame);
      video.removeEventListener('seeked', captureFrame);
    };
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const allImages = [
    product.coverImage,
    ...product.images,
  ].filter(Boolean);

  const videoUrl = getVideoUrl(product.videos?.[0]);

  return (
    <div className="min-h-screen bg-white pb-8">
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

      {/* 产品视频 - 竖向视频播放器，封面使用视频第一帧 */}
      {videoUrl && (
        <div className="w-full py-4 flex justify-center">
          {/* 隐藏的canvas用于截取视频帧 */}
          <canvas ref={canvasRef} className="hidden" />
          
          <div 
            className="relative bg-black flex justify-center items-center"
            style={{ 
              width: '90vw',
              maxWidth: '400px',
              aspectRatio: '9/16'
            }}
          >
            {/* 视频元素 */}
            <video
              ref={videoRef}
              src={videoUrl}
              controls={isPlaying}
              controlsList="nodownload"
              preload="metadata"
              poster={videoPoster}
              className="w-full h-full object-cover"
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* 播放按钮遮罩 - 未播放时显示 */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                onClick={handlePlay}
              >
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
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
          
          <Image
            src={allImages[selectedImageIndex]}
            alt={`${product.name} - 图片 ${selectedImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            width={1200}
            height={1200}
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
