"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Product = any;

interface ProductClientProps {
  product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态 - 未登录则跳转到首页
    const authData = localStorage.getItem('atelier_authenticated');
    if (authData !== 'true') {
      router.replace('/');
      return;
    }
    // 检查管理员权限
    const adminData = localStorage.getItem('atelier_is_admin');
    setIsAdmin(adminData === 'true');

    // 记录访问统计
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_url: window.location.pathname,
        product_id: product.id,
        product_name: product.name
      })
    }).catch(err => console.error('访问统计失败:', err));
  }, [router, product.id, product.name]);

  // 获取视频URL - 简化逻辑
  const getVideoUrl = (data: unknown): string => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if (obj.url && typeof obj.url === 'string') return obj.url;
    }
    return '';
  };

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

  const allImages = [
    product.coverImage,
    ...(product.images as string[] || []),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white pb-8 relative">
      {/* 顶部操作栏 */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-100 px-3 py-2 flex items-center justify-between">
        <Link href="/gallery" className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </Link>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Link href={`/admin/edit/${product.id}`} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
              <span className="text-sm text-stone-600">编辑</span>
            </Link>
          )}
        </div>
      </div>

      {/* Top按钮 - 始终在页面上方 */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-700 transition-all z-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}


      {/* 产品信息 */}
      <div className="px-1.5 py-4">
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
            {(product.videos as unknown[]).map((video, index) => {
              const vUrl = getVideoUrl(video);
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
