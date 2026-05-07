import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  // 验证 URL 是否来自允许的域名
  const supabaseUrl = process.env.COZE_SUPABASE_URL 
    || process.env.NEXT_PUBLIC_SUPABASE_URL 
    || process.env.SUPABASE_URL;
  const allowedHost = supabaseUrl?.replace('https://', '').replace('http://', '');
  
  try {
    const urlObj = new URL(url);
    
    // 验证域名
    if (!urlObj.hostname.includes(allowedHost?.split('.')[0] || '')) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 403 });
    }
    
    // 验证路径前缀
    const validPaths = ['storage/v1/object/public/products', 'storage/v1/object/public/videos', 'storage/v1/object/public/thumbnails'];
    const hasValidPath = validPaths.some(p => urlObj.pathname.includes(p));
    
    if (!hasValidPath) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 代理请求
    const response = await fetch(url, {
      headers: {
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: response.status });
    }

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(blob, {
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
