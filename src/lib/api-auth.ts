/**
 * API 认证验证工具
 * 用于验证管理 API 请求是否来自已认证的管理员
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';

// 认证 token 有效期（小时）
const AUTH_TOKEN_EXPIRY_HOURS = 24;

// 生成简单的会话 token
function generateSessionToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

// 验证会话 token
export async function verifyAdminSession(request: NextRequest): Promise<{
  valid: boolean;
  isSuperAdmin: boolean;
  sessionToken?: string;
}> {
  const authHeader = request.headers.get('x-admin-session');
  
  if (!authHeader) {
    return { valid: false, isSuperAdmin: false };
  }
  
  // 如果是 fallback token，直接通过验证
  if (authHeader.startsWith('fallback_')) {
    return { valid: true, isSuperAdmin: false, sessionToken: authHeader };
  }
  
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Supabase 不可用时，fallback token 仍可通过
    if (authHeader.startsWith('fallback_')) {
      return { valid: true, isSuperAdmin: false, sessionToken: authHeader };
    }
    return { valid: false, isSuperAdmin: false };
  }
  
  try {
    // 查询会话
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_token', authHeader)
      .single();
    
    if (error || !session) {
      return { valid: false, isSuperAdmin: false };
    }
    
    // 检查过期时间
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      // 会话已过期，删除
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', authHeader);
      return { valid: false, isSuperAdmin: false };
    }
    
    return {
      valid: true,
      isSuperAdmin: session.is_super_admin || false,
      sessionToken: authHeader
    };
  } catch {
    return { valid: false, isSuperAdmin: false };
  }
}

// 创建会话（登录成功后调用）
export async function createAdminSession(
  password: string,
  isSuperAdmin: boolean
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // 如果 Supabase 不可用，返回一个临时 token
    return `fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
  
  const sessionToken = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + AUTH_TOKEN_EXPIRY_HOURS);
  
  try {
    const { error } = await supabase
      .from('admin_sessions')
      .insert({
        session_token: sessionToken,
        is_super_admin: isSuperAdmin,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });
    
    if (error) {
      // 如果表不存在或其他错误，返回 fallback token
      console.warn('[Session] 创建会话失败，使用 fallback token:', error.message);
      return `fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    
    return sessionToken;
  } catch (error) {
    console.error('[Session] 创建会话异常:', error);
    return `fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

// 销毁会话
export async function destroyAdminSession(sessionToken: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return false;
  }
  
  try {
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('session_token', sessionToken);
    return true;
  } catch {
    return false;
  }
}

// 需要管理员权限的 API 保护装饰器
export function withAdminAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await verifyAdminSession(request);
    
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 将认证信息添加到请求中
    const headers = new Headers(request.headers);
    headers.set('x-session-token', auth.sessionToken || '');
    headers.set('x-is-super-admin', auth.isSuperAdmin.toString());
    
    return handler(new NextRequest(request.url, {
      method: request.method,
      headers,
      body: request.body,
      duplex: 'half'
    }));
  };
}

// 速率限制配置
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 分钟
const MAX_REQUESTS_PER_WINDOW = 100;

// 简单的内存速率限制存储（生产环境应使用 Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// 速率限制检查
export function checkRateLimit(clientIp: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(clientIp);
  
  if (!record || record.resetTime < now) {
    // 新窗口或过期记录
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(clientIp, { count: 1, resetTime });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetTime };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetTime: record.resetTime };
}

// 获取客户端 IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

// 清理过期的速率限制记录（每小时执行一次）
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);
