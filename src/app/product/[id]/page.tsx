'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UnlockPrompt } from '@/components/auth/UnlockPrompt';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { PhotoViewer } from '@/components/gallery/PhotoViewer';
import { VideoPlayer } from '@/components/gallery/VideoPlayer';
import { useAuth } from '@/hooks/useAuth';
import { products } from '@/lib/products';
import { Video } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { isAuthenticated, isLoading } = useAuth();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);

  const product = products.find((p) => p.id === productId);

  useEffect(() => {
    if (selectedImageIndex !== null || selectedVideo !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedImageIndex, selectedVideo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-5 w-full max-w-xl mb-12" />
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="font-display text-2xl mb-4">产品未找到</h1>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 md:pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>返回列表</span>
          </Link>

          {/* Product header */}
          <header className="mb-10 md:mb-14 animate-fade-in-up">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              {product.category}
            </span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mt-2 mb-4">
              {product.name}
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl animate-fade-in-up animation-delay-100">
              {product.description}
            </p>
          </header>

          {/* Gallery */}
          <div className="animate-fade-in-up animation-delay-200">
            <GalleryGrid
              product={product}
              isAuthenticated={isAuthenticated}
              onImageClick={setSelectedImageIndex}
              onVideoClick={setSelectedVideo}
            />
          </div>

          {/* Media count */}
          <div className="mt-6 text-sm text-muted-foreground animate-fade-in-up animation-delay-300">
            <span>{product.images.length} 张图片</span>
            {product.videos.length > 0 && (
              <span className="mx-2">·</span>
            )}
            {product.videos.length > 0 && (
              <span>{product.videos.length} 个视频</span>
            )}
          </div>

          {/* Unlock prompt for unauthenticated */}
          {!isAuthenticated && (
            <div className="mt-16 max-w-md mx-auto animate-fade-in-up animation-delay-300">
              <UnlockPrompt />
            </div>
          )}
        </div>
      </main>

      {/* Photo Viewer Modal */}
      {selectedImageIndex !== null && isAuthenticated && (
        <PhotoViewer
          images={product.images}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}

      {/* Video Player Modal */}
      {selectedVideo !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl">
            <VideoPlayer
              video={selectedVideo}
              isAuthenticated={isAuthenticated}
              isFullscreen={isVideoFullscreen}
              onFullscreenChange={setIsVideoFullscreen}
              onClose={() => setSelectedVideo(null)}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
