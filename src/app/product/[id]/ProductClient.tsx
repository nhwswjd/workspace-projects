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
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isVideoVertical, setIsVideoVertical] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 递归提取视频URL，处理任意深度的嵌套对象
  const getVideoUrl = (video: any): string => {
    if (!video) return '';
    
    // 如果是字符串且包含 http，返回它
    if (typeof video === 'string') {
      return video.includes('http') ? video : '';
    }
    
    // 如果是对象，递归查找所有可能的URL字段
    if (typeof video === 'object') {
      // 常见URL字段名
      const urlFields = ['url', 'src', 'link', 'path', 'video_url', 'videoUrl'];
      for (const field of urlFields) {
        if (video[field]) {
          const result = getVideoUrl(video[field]);
          if (result) return result;
        }
      }
    }
    
    return '';
  };

  // 检测视频方向
  const detectVideoOrientation = (video: HTMLVideoElement) => {
    if (video.videoWidth && video.videoHeight) {
      setIsVideoVertical(video.videoHeight > video.videoWidth);
    }
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
    video.addEventListener('loadedmetadata', () => detectVideoOrientation(video));
    video.addEventListener('seeked', captureFrame);
    
    return () => {
      video.removeEventListener('loadeddata', captureFrame);
      video.removeEventListener('loadedmetadata', () => detectVideoOrientation(video));
      video.removeEventListener('seeked', captureFrame);
    };
  }, []);

  // 监听滚动显示/隐藏Top按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVideoClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const allImages = [
    product.coverImage,
    ...product.images,
  ].filter(Boolean);

  // 调试：打印视频数据结构
  console.log('product.videos:', product.videos);
  console.log('product.videos?.[0]:', product.videos?.[0]);
  
  const videoUrl = getVideoUrl(product.videos?.[0]);
  console.log('videoUrl:', videoUrl);

  // 根据视频方向确定播放器的aspect-ratio
  const videoAspectRatio = isVideoVertical ? '9/16' : '16/9';
  const videoMaxWidth = isVideoVertical ? '430px' : '800px';

  return (
    <div className="min-h-screen bg-white pb-8 relative">
      {/* Top按钮 - 始终在页面上方 */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-stone-800 text-white rounded-lg shadow-lg hover:bg-stone-700 transition-all z-40 flex items-center justify-center text-xl font-bold"
          style={{ position: 'fixed', bottom: '24px', right: '24px' }}
        >
          TOP
        </button>
      )}

      {/* 产品名称 */}
      <div className="max-w-full mx-auto px-1 py-4 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900 text-center">
          {product.name}
        </h1>
      </div>

      {/* 产品图片 - 竖向图片占满屏幕宽度 */}
      <div className="max-w-full mx-auto space-y-2 mt-2">
        {allImages.map((image, index) => {
          // 检查图片是否是竖向的（通过URL参数判断或默认处理）
          const isVertical = image.includes('vertical') || image.includes('portrait');
          
          return (
            <div 
              key={index} 
              className={`relative bg-gray-100 overflow-hidden cursor-pointer ${isVertical ? 'w-full' : 'w-full'}`}
              style={{ 
                height: isVertical ? 'auto' : 'auto',
              }}
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image
                src={image}
                alt={`${product.name} - 图片 ${index + 1}`}
                width={1200}
                height={isVertical ? 1600 : 800}
                className={`object-contain ${isVertical ? 'w-full' : 'w-full'}`}
                style={{ 
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
                sizes="100vw"
                unoptimized
              />
            </div>
          );
        })}
      </div>

      {/* 产品视频 - 自适应视频方向 */}
      {videoUrl && (
        <div className="w-full py-4 flex justify-center">
          {/* 隐藏的canvas用于截取视频帧 */}
          <canvas ref={canvasRef} className="hidden" />
          
          <div 
            className="relative bg-black flex justify-center items-center"
            style={{ 
              width: '95vw',
              maxWidth: videoMaxWidth,
              aspectRatio: videoAspectRatio
            }}
          >
            {/* 视频容器 */}
            <div 
              className="relative w-full h-full"
              onClick={handleVideoClick}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                preload="metadata"
                poster={videoPoster}
                className="w-full h-full object-cover cursor-pointer"
                playsInline
                disablePictureInPicture
                controls={false}
                onClick={handleVideoClick}
                onTouchStart={(e) => e.preventDefault()}
                onTouchMove={(e) => e.preventDefault()}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleVideoClick(e);
                }}
                onPlay={() => handlePlayStateChange(true)}
                onPause={() => handlePlayStateChange(false)}
                onEnded={() => handlePlayStateChange(false)}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    detectVideoOrientation(videoRef.current);
                  }
                }}
              />
              
              {/* 播放按钮遮罩 - 未播放时显示 */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
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
