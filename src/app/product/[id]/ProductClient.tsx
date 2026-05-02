"use client";

type Product = any;

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, MoreVertical, Home, Upload, LogOut, ArrowUp } from "lucide-react";


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
  const videoData = (product.videos as unknown[])?.[currentVideoIndex] as Record<string, unknown> | undefined;
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
          <ArrowUp className="w-6 h-6" />
        </button>
      )}


      {/* 产品信息 */}
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold text-stone-900">{product.name}</h1>

        {/* 图片区域 - 竖向排列 */}
        {allImages.length > 0 && (
          <div className="mb-4">
            {allImages.map((img, index) => (
              <div
                key={`img-${index}`}
                className="relative bg-stone-100"
              >
                <img
                  src={img}
                  alt={`${product.name} - 图片 ${index + 1}`}
                  className="w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* 视频区域 - 竖向排列 */}
        {product.videos && product.videos.length > 0 && (
          <div>
            {product.videos.map((_: unknown, index: number) => {
              const vd = (product.videos as unknown[])?.[index];
              const vUrl = getVideoUrl(vd);
              if (!vUrl) return null;
              return (
                <div key={`video-${index}`} className="relative bg-black mb-4">
                  <video
                    src={vUrl}
                    controls
                    playsInline
                    className="w-full max-w-[430px] mx-auto"
                  />
                </div>
              );
            })}
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
