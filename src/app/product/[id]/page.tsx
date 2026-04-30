'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GalleryVertical } from '@/components/gallery/GalleryVertical';
import { PhotoViewer } from '@/components/gallery/PhotoViewer';
import { VideoPlayer } from '@/components/gallery/VideoPlayer';
import { useAuth } from '@/hooks/useAuth';
import { products } from '@/lib/products';
import { Video } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { isLoading } = useAuth();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

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
          <div className="max-w-lg mx-auto">
            <Skeleton className="h-6 w-20 mb-6" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-full mb-10" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-full aspect-[3/4] rounded-lg" />
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
        <button
          onClick={() => router.push('/')}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 md:pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>返回</span>
          </button>

          {/* Product header */}
          <header className="mb-6">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="font-display text-2xl md:text-3xl mt-1 mb-2">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </header>

          {/* Gallery - Vertical single column, centered */}
          <div className="animate-fade-in-up flex justify-center">
            <div className="w-full max-w-md">
              <GalleryVertical
                product={product}
                isAuthenticated={true}
                onImageClick={setSelectedImageIndex}
                onVideoClick={setSelectedVideo}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Photo Viewer Modal */}
      {selectedImageIndex !== null && (
        <PhotoViewer
          images={product.images}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}

      {/* Video Player Modal */}
      {selectedVideo !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-lg">
            <VideoPlayer
              video={selectedVideo}
              isAuthenticated={true}
              onClose={() => setSelectedVideo(null)}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
