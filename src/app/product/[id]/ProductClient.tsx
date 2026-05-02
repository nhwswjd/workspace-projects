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
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 递归提取视频URL，处理任意深度的嵌套对象
  const getVideoUrl = (video: any): string => {
    if (!video) return '';
    
    // 如果是字符串，检查是否是有效的URL
    if (typeof video === 'string') {
      if (video.includes('http') || video.includes('supabase')) {
        return video;
      }
      return '';
    }
    
    // 如果是数组，取第一个元素
    if (Array.isArray(video)) {
      return video.length > 0 ? getVideoUrl(video[0]) : '';
    }
    
    // 如果是对象，递归查找所有可能的URL字段
    if (typeof video === 'object') {
      // 常见URL字段名
      const urlFields = ['url', 'src', 'link', 'path', 'video_url', 'videoUrl', 'href'];
      for (const field of urlFields) {
        if (video[field] !== undefined) {
          const result = getVideoUrl(video[field]);
          if (result) return result;
        }
      }
      // 如果没找到，尝试获取第一个有值的属性
      for (const key of Object.keys(video)) {
        const value = video[key];
        if (value && typeof value === 'object') {
          const result = getVideoUrl(value);
          if (result) return result;
        }
      }
    }
    
    return '';
  };

  // 获取视频缩略图
  const getVideoThumbnail = (video: any): string => {
    if (!video) return '';
    if (typeof video === 'string') return '';
    if (video.thumbnail) return video.thumbnail;
    // 递归查找
    for (const key in video) {
      if (typeof video[key] === 'object') {
        const result = getVideoThumbnail(video[key]);
        if (result) return result;
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

  // 切换视频时重置封面和播放状态
  useEffect(() => {
    setVideoPoster('');
    setIsPlaying(false);
    setIsVideoVertical(true);
  }, [currentVideoIndex]);

  const allImages = [
    product.coverImage,
    ...product.images,
  ].filter(Boolean);

  // 根据当前视频索引获取视频数据
  const videoData = product.videos?.[currentVideoIndex];
  const videoUrl = getVideoUrl(videoData);
  
  // 调试：显示当前视频信息
  console.log('=== VIDEO DEBUG ===');
  console.log('currentVideoIndex:', currentVideoIndex);
  console.log('product.videos:', product.videos);
  console.log('videoData:', videoData);
  console.log('videoUrl:', videoUrl);
  console.log('===================');

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

      {/* 产品视频 - 所有视频排列显示 */}
      {product.videos && product.videos.length > 0 && (
        <div className="w-full space-y-4">
          {product.videos.map((video: any, index: number) => {
            const videoUrlSingle = getVideoUrl(video);
            return (
              <div key={index} className="w-full py-2 flex justify-center">
                {/* 隐藏的canvas用于截取视频帧 */}
                <canvas ref={(el) => {
                  if (el) canvasRef.current[index] = el;
                }} className="hidden" />
                
                {videoUrlSingle ? (
                  <div 
                    className="relative bg-black flex justify-center items-center"
                    style={{ 
                      width: '95vw',
                      maxWidth: '430px',
                      aspectRatio: '9/16'
                    }}
                  >
                    <video
                      ref={(el) => {
                        if (el) videoRef.current[index] = el;
                      }}
                      src={videoUrlSingle}
                      preload="metadata"
                      poster={getVideoThumbnail(video)}
                      className="w-full h-full object-cover cursor-pointer"
                      playsInline
                      disablePictureInPicture
                      controls={false}
                      onClick={(e) => {
                        const video = e.currentTarget;
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }}
                      onTouchStart={(e) => e.preventDefault()}
                      onTouchMove={(e) => e.preventDefault()}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                      }}
                      onPlay={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onPause={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    />
                    
                    {/* 播放按钮遮罩 */}
                    <div 
                      className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none"
                      onClick={(e) => {
                        const video = e.currentTarget.parentElement?.querySelector('video');
                        if (video) {
                          if (video.paused) {
                            video.play();
                          } else {
                            video.pause();
                          }
                        }
                      }}
                    >
                      <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg pointer-events-auto">
                        <svg className="w-10 h-10 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex justify-center">
                    <div 
                      className="bg-red-100 text-red-600 px-4 py-2 rounded text-sm"
                      style={{ width: '95vw', maxWidth: '430px' }}
                    >
                      视频 {index + 1} URL无效
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
