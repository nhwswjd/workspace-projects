import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ffmpeg.wasm 需要 SharedArrayBuffer 支持，需要添加 COOP/COEP headers
// 但这些 headers 会影响跨域资源加载，所以只在管理后台页面添加
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 只在管理后台页面添加 headers
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
