'use client';

import { useState, useCallback, useRef } from 'react';

interface FFmpegHook {
  isLoading: boolean;
  isReady: boolean;
  progress: number;
  error: string | null;
  load: () => Promise<boolean>;
  compressVideo: (
    videoUrl: string,
    onProgress?: (progress: number) => void
  ) => Promise<{ compressedBlob: Blob; thumbnailBlob: Blob } | null>;
}

export function useFFmpeg(): FFmpegHook {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ffmpegRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchFileRef = useRef<any>(null);

  const load = useCallback(async (): Promise<boolean> => {
    if (ffmpegRef.current && isReady) {
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useFFmpeg] 开始加载...');
      
      // 动态导入 FFmpeg
      const ffmpegModule = await import('@ffmpeg/ffmpeg');
      const utilModule = await import('@ffmpeg/util');
      
      const FFmpegClass = ffmpegModule.FFmpeg;
      const fetchFile = utilModule.fetchFile;
      
      const ffmpeg = new FFmpegClass();
      ffmpegRef.current = ffmpeg;
      fetchFileRef.current = fetchFile;

      ffmpeg.on('progress', (data: unknown) => {
        const p = (data as { progress: number }).progress;
        setProgress(Math.round(p * 100));
      });

      ffmpeg.on('log', (data: unknown) => {
        console.log('[FFmpeg]', (data as { message: string }).message);
      });

      // 加载 WASM 文件
      const baseURL = '/ffmpeg/umd';
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      });

      setIsReady(true);
      setIsLoading(false);
      console.log('[useFFmpeg] FFmpeg 加载完成');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'FFmpeg加载失败';
      console.error('[useFFmpeg] 加载失败:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, [isReady]);

  const compressVideo = useCallback(async (
    videoUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<{ compressedBlob: Blob; thumbnailBlob: Blob } | null> => {
    if (!ffmpegRef.current) {
      const loaded = await load();
      if (!loaded) return null;
    }

    const ffmpeg = ffmpegRef.current;
    const fetchFile = fetchFileRef.current;

    try {
      setProgress(0);
      setError(null);

      // 下载视频
      console.log('[useFFmpeg] 下载视频:', videoUrl);
      const videoResponse = await fetch(videoUrl);
      const videoBlob = await videoResponse.blob();
      
      // 写入视频文件
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoBlob));
      
      onProgress?.(10);

      // 压缩视频
      console.log('[useFFmpeg] 开始压缩...');
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        'output.mp4'
      ]);
      
      onProgress?.(50);

      // 提取缩略图（第一帧）
      console.log('[useFFmpeg] 提取缩略图...');
      await ffmpeg.exec([
        '-i', 'output.mp4',
        '-ss', '00:00:00.000',
        '-vframes', '1',
        '-f', 'image2',
        'thumbnail.jpg'
      ]);
      
      onProgress?.(90);

      // 读取压缩后的视频
      const compressedData = await ffmpeg.readFile('output.mp4');
      const compressedBlob = new Blob([new Uint8Array(compressedData as ArrayBuffer)], { type: 'video/mp4' });

      // 读取缩略图
      const thumbnailData = await ffmpeg.readFile('thumbnail.jpg');
      const thumbnailBlob = new Blob([new Uint8Array(thumbnailData as ArrayBuffer)], { type: 'image/jpeg' });

      // 清理文件
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
      await ffmpeg.deleteFile('thumbnail.jpg');
      
      onProgress?.(100);
      console.log('[useFFmpeg] 完成!');
      
      return { compressedBlob, thumbnailBlob };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '压缩失败';
      console.error('[useFFmpeg] 压缩失败:', errorMessage);
      setError(errorMessage);
      return null;
    }
  }, [load]);

  return {
    isLoading,
    isReady,
    progress,
    error,
    load,
    compressVideo,
  };
}
