import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { files } = await request.json();
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return Response.json({ error: 'No files specified' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    
    if (!supabase) {
      return Response.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const results: { success: string[]; failed: string[]; deletedSize: number } = { 
      success: [], 
      failed: [],
      deletedSize: 0 
    };

    for (const file of files) {
      try {
        const bucket = file.bucket || 'product-images';
        const fileName = file.name;
        
        console.log(`[删除文件] bucket: ${bucket}, name: ${fileName}`);
        
        const { error } = await supabase!.storage.from(bucket).remove([fileName]);
        
        if (error) {
          console.error(`删除失败: ${fileName}`, error);
          results.failed.push(`${bucket}/${fileName}`);
        } else {
          console.log(`删除成功: ${fileName}`);
          results.success.push(`${bucket}/${fileName}`);
        }
      } catch (err) {
        console.error('删除异常:', err);
        results.failed.push(file.name);
      }
    }

    return Response.json({
      success: true,
      deleted: results.success.length,
      failed: results.failed.length,
      deletedSize: results.deletedSize,
      details: results
    });
  } catch (error) {
    console.error('Storage delete error:', error);
    return Response.json({ error: 'Failed to delete files' }, { status: 500 });
  }
}
