import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(url, key);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  
  if (!path || path.length === 0) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  // 重建完整路径
  const filePath = path.join('/');
  
  // 验证路径格式（只允许访问 storage/v1/object/public/ 下的文件）
  const allowedPrefixes = ['products/', 'videos/', 'thumbnails/'];
  const isAllowed = allowedPrefixes.some(prefix => filePath.startsWith(prefix));
  
  if (!isAllowed) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    // 使用 service role key 创建服务端客户端
    const supabase = getSupabaseAdmin();
    
    // 从 Storage 下载文件
    const { data, error } = await supabase.storage
      .from('products')
      .download(filePath);

    if (error || !data) {
      // 尝试其他 bucket
      const buckets = ['products', 'videos', 'thumbnails'];
      for (const bucket of buckets) {
        const { data: altData, error: altError } = await supabase.storage
          .from(bucket)
          .download(filePath);
        
        if (!altError && altData) {
          const contentType = getContentType(filePath);
          return new NextResponse(altData, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      }
      
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // 获取文件类型
    const contentType = getContentType(filePath);

    // 返回文件
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('File proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'pdf': 'application/pdf',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
