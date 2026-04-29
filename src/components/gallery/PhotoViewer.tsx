'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoViewerProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoViewer({
  images,
  initialIndex,
  onClose,
}: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsLoaded(false);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsLoaded(false);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(s + 0.5, 4));
      if (e.key === '-') setScale((s) => Math.max(s - 0.5, 1));
    },
    [onClose, goToPrevious, goToNext]
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale((s) => Math.max(1, Math.min(4, s + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[rgba(10,10,10,0.95)] animate-fade-in"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="关闭"
      >
        <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
            aria-label="上一张"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
            aria-label="下一张"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Image container */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className={cn(
            'relative w-full h-full max-w-[90vw] max-h-[85vh] transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <Image
            src={images[currentIndex]}
            alt={`图片 ${currentIndex + 1}`}
            fill
            className="object-contain"
            onLoad={() => setIsLoaded(true)}
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
        <button
          onClick={() => setScale((s) => Math.max(1, s - 0.5))}
          disabled={scale <= 1}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30"
          aria-label="缩小"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </button>
        <span className="text-xs text-white/70 w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.min(4, s + 0.5))}
          disabled={scale >= 4}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30"
          aria-label="放大"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <button
          onClick={handleReset}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="重置"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 right-6 md:right-auto md:left-6 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setScale(1);
                setPosition({ x: 0, y: 0 });
                setIsLoaded(false);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                idx === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60'
              )}
              aria-label={`跳转到图片 ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
