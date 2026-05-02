"use client";

interface Product {
  code: string;
  name: string;
  images: string[];
  videos: unknown[];
  coverImage: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  price?: number;
  hidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, MoreVertical, Home, Upload, LogOut, RotateCcw } from "lucide-react";


interface ProductClientProps {
  product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoVertical, setIsVideoVertical] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // 递归查找URL
  function getVideoUrl(data: unknown): string {
    if (!data) return "";
    if (typeof data === "string") return data;
    if (typeof data === "object") {
      const obj = data as Record<string, unknown>;
      // 直接是URL字符串
      if (obj.url && typeof obj.url === "string") return obj.url;
      // 递归查找
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) {
          return value;
        }
        if (typeof value === "object" && value !== null) {
          const result = getVideoUrl(value);
          if (result) return result;
        }
      }
    }
    return "";
  }

  // 监听滚动显示/隐藏Top按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 处理视频点击
  const handleVideoClick = (video: HTMLVideoElement) => {
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // 切换视频时重置播放状态
  useEffect(() => {
    setIsPlaying(false);
  }, [currentVideoIndex]);

  const allImages = [
    product.coverImage,
    ...(product.images as string[] || []),
  ].filter(Boolean);

  // 根据当前视频索引获取视频数据
  const videoData = (product.videos as unknown)?.[currentVideoIndex];
  const videoUrl = getVideoUrl(videoData);

  return (
    <div className="min-h-screen bg-white pb-8 relative">
      {/* Top按钮 - 始终在页面上方 */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-stone-800 text-white rounded-lg shadow-lg hover:bg-stone-700 transition-all z-40 flex items-center justify-center text-xl font-bold"
          style={{ bottom: "1.5rem", right: "1.5rem" }}
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      )}

      {/* Header */}
      <div className="w-full transition-all duration-500">
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-stone-200">
          <Link
            href="/gallery"
            className="flex items-center gap-1 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-stone-800">
              {product.brandInfo?.name || "ATELIER"}
            </span>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-stone-600" />
            </button>
          </div>
        </div>

        {/* 菜单弹框 */}
        {showMenu && (
          <div className="absolute right-0 top-14 w-36 bg-white border border-stone-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 hover:bg-stone-100 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">首页</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-3 hover:bg-stone-100 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">管理产品</span>
            </Link>
            <button
              onClick={() => setShowMenu(false)}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-stone-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">退出登录</span>
            </button>
          </div>
        )}
      </div>

      {/* 产品信息 */}
      <div className="px-4 py-4">
        <div className="mb-4">
          <p className="text-xs text-stone-400 mb-1">编号 {product.code}</p>
          <h1 className="text-xl font-bold text-stone-900">{product.name}</h1>
        </div>

        {/* 图片网格 */}
        {allImages.length > 0 && (
          <div className="grid grid-cols-3 gap-1 mb-4">
            {allImages.map((img, index) => (
              <div
                key={`img-${index}`}
                className="relative aspect-square bg-stone-100 overflow-hidden"
              >
                <img
                  src={img}
                  alt={`${product.name} - 图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* 视频区域 */}
        {product.videos && product.videos.length > 0 && (
          <div className="space-y-4">
            {/* 视频切换器 */}
            {product.videos.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                {product.videos.map((_: string, index: number) => (
                  <button
                    key={`video-btn-${index}`}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`px-3 py-1 text-sm rounded ${
                      index === currentVideoIndex
                        ? "bg-stone-800 text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    视频 {index + 1}
                  </button>
                ))}
              </div>
            )}

            {/* 视频播放器 */}
            {videoUrl && (
              <div className="relative bg-black">
                <video
                  key={`video-${currentVideoIndex}`}
                  src={videoUrl}
                  controls
                  playsInline
                  className={`w-full mx-auto ${
                    isVideoVertical ? "max-w-[430px]" : "max-w-[800px]"
                  }`}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    setIsVideoVertical(video.videoHeight > video.videoWidth);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>
        )}

        {/* 产品描述 */}
        {product.description && (
          <div className="mt-4">
            <p className="text-sm text-stone-600 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
