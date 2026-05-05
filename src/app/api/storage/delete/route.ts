import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE(request: Request) {
  try {
    const { paths } = await request.json();
    
    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return Response.json({ error: 'No files specified' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const results: { success: string[]; failed: string[] } = { success: [], failed: [] };

    for (const path of paths) {
      try {
        // 确定文件类型
        const bucket = path.includes('/videos/') ? 'product-videos' : 'product-images';
        const fileName = path.split('/').pop() || path;
        
        const { error } = await supabase.storage.from(bucket).remove([fileName]);
        
        if (error) {
          results.failed.push(path);
        } else {
          results.success.push(path);
        }
      } catch {
        results.failed.push(path);
      }
    }

    return Response.json({
      deleted: results.success.length,
      failed: results.failed.length,
      details: results
    });
  } catch (error) {
    console.error('Storage delete error:', error);
    return Response.json({ error: 'Failed to delete files' }, { status: 500 });
  }
}
