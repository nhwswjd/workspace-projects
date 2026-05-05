import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
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
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(item.name);
          
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

    // 计算总大小
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const imageCount = files.filter(f => f.type === 'image').length;
    const videoCount = files.filter(f => f.type === 'video').length;

    return Response.json({
      files,
      stats: {
        totalSize,
        imageCount,
        videoCount
      }
    });
  } catch (error) {
    console.error('Storage list error:', error);
    return Response.json({ error: 'Failed to list storage' }, { status: 500 });
  }
}
