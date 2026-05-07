import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员会话
    const auth = await verifyAdminSession(request);
    if (!auth.valid) {
      return Response.json(
        { success: false, message: '未授权访问，请先登录' },
        { status: 401 }
      );
    }

    const { files } = await request.json();
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return Response.json({ error: 'No files specified' }, { status: 400 });
    }

    // 限制每次删除的文件数量
    if (files.length > 50) {
      return Response.json({ error: '一次最多删除50个文件' }, { status: 400 });
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
        // 验证 bucket 和 fileName
        const bucket = file.bucket || 'product-images';
        const fileName = file.name;
        
        // 只允许删除特定 bucket 的文件
        const allowedBuckets = ['product-images', 'product-videos', 'thumbnails'];
        if (!allowedBuckets.includes(bucket)) {
          results.failed.push(`${bucket}/${fileName} - 不允许删除此目录`);
          continue;
        }
        
        // 验证文件名格式，防止路径遍历
        if (!fileName || typeof fileName !== 'string' || fileName.includes('..') || fileName.includes('/')) {
          results.failed.push(`${bucket}/${fileName} - 无效的文件名`);
          continue;
        }

        const { error } = await supabase!.storage.from(bucket).remove([fileName]);
        
        if (error) {
          results.failed.push(`${bucket}/${fileName}`);
        } else {
          results.success.push(`${bucket}/${fileName}`);
        }
      } catch (err) {
        console.error('删除异常:', err);
        results.failed.push(file.name || 'unknown');
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
