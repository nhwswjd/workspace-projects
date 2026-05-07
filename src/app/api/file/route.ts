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
    || process.env.SUPABASE_URL
    || 'br-bonny-deer-52ec6415'; // 硬编码备选
  
  // 提取允许的域名关键字（第一个子域名部分）
  const allowedDomainPart = supabaseUrl.replace('https://', '').replace('http://', '').split('.')[0];
  
  // 允许的图片域名白名单
  const allowedDomains = [
    'picsum.photos',      // Lorem Picsum
    'images.unsplash.com', // Unsplash
    allowedDomainPart,     // Supabase Storage
  ];
  
  try {
    const urlObj = new URL(url);
    
    // 验证域名是否在白名单中
    const isAllowedDomain = allowedDomains.some(domain => 
      urlObj.hostname.includes(domain)
    );
    
    if (!isAllowedDomain) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
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
