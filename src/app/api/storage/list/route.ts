import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    // 获取 Storage 中的所有文件
    const [imagesResult, videosResult] = await Promise.all([
      supabase.storage.from('product-images').list('', { limit: 1000 }),
      supabase.storage.from('product-videos').list('', { limit: 1000 })
    ]);

    const files: Array<{
      id: string;
      name: string;
      type: 'image' | 'video';
      size: number;
      created_at: string;
    }> = [];

    // 处理图片
    if (imagesResult.data) {
      for (const item of imagesResult.data) {
        if (item.id && item.name) {
          files.push({
            id: item.id,
            name: item.name,
            type: 'image',
            size: (item.metadata as { size?: number })?.size || 0,
            created_at: item.created_at || ''
          });
        }
      }
    }

    // 处理视频
    if (videosResult.data) {
      for (const item of videosResult.data) {
        if (item.id && item.name) {
          files.push({
            id: item.id,
            name: item.name,
            type: 'video',
            size: (item.metadata as { size?: number })?.size || 0,
            created_at: item.created_at || ''
          });
        }
      }
    }

    // 获取数据库中所有产品的图片和视频引用
    const { data: products } = await supabase
      .from('products')
      .select('id, name, cover_image, images, videos');

    // 提取所有被引用的文件名
    const usedFiles = new Set<string>();
    
    if (products) {
      for (const p of products) {
        // 封面图
        if (p.cover_image) {
          const fileName = p.cover_image.split('/').pop() || '';
          if (fileName) usedFiles.add(fileName);
        }
        
        // 图片数组
        if (p.images && Array.isArray(p.images)) {
          for (const img of p.images) {
            if (typeof img === 'string') {
              const fileName = img.split('/').pop() || '';
              if (fileName) usedFiles.add(fileName);
            } else if (img && typeof img === 'object' && 'url' in img) {
              const fileName = (img as { url: string }).url.split('/').pop() || '';
              if (fileName) usedFiles.add(fileName);
            }
          }
        }
        
        // 视频数组
        if (p.videos && Array.isArray(p.videos)) {
          for (const vid of p.videos) {
            if (typeof vid === 'string') {
              const fileName = vid.split('/').pop() || '';
              if (fileName) usedFiles.add(fileName);
            } else if (vid && typeof vid === 'object' && 'url' in vid) {
              const fileName = (vid as { url: string }).url.split('/').pop() || '';
              if (fileName) usedFiles.add(fileName);
            }
          }
        }
      }
    }

    // 计算总大小
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const imageCount = files.filter(f => f.type === 'image').length;
    const videoCount = files.filter(f => f.type === 'video').length;
    const imageSize = files.filter(f => f.type === 'image').reduce((sum, f) => sum + f.size, 0);
    const videoSize = files.filter(f => f.type === 'video').reduce((sum, f) => sum + f.size, 0);

    // 找出孤立文件（没有被任何产品引用）
    const orphanedFiles = files.filter(f => !usedFiles.has(f.name));
    const orphanedDetails = orphanedFiles.map(f => ({
      name: f.name,
      bucket: f.type === 'video' ? 'product-videos' : 'product-images',
      size: f.size
    }));

    return Response.json({
      files,
      orphaned: orphanedDetails,
      stats: {
        totalSize,
        imageCount,
        videoCount,
        imageSize,
        videoSize,
        orphanedCount: orphanedFiles.length,
        orphanedSize: orphanedFiles.reduce((sum, f) => sum + f.size, 0)
      }
    });
  } catch (error) {
    console.error('Storage list error:', error);
    return Response.json({ error: 'Failed to list storage' }, { status: 500 });
  }
}
