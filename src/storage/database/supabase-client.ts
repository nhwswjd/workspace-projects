import { createClient, SupabaseClient } from '@supabase/supabase-js';

let envLoaded = false;

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function loadEnv(): void {
  if (envLoaded) return;
  
  try {
    const path = require('path');
    const cwd = process.cwd();
    
    // 优先加载 .env 文件
    try {
      require('dotenv').config({ path: path.resolve(cwd, '.env') });
    } catch {
      // ignore
    }
    
    // 其次尝试 .env.local
    try {
      require('dotenv').config({ path: path.resolve(cwd, '.env.local') });
    } catch {
      // ignore
    }
  } catch {
    // dotenv not available, ignore
  }
  
  envLoaded = true;
}

// 导出配置变量供外部使用
export const supabaseUrl = (() => {
  loadEnv();
  return process.env.COZE_SUPABASE_URL 
    || process.env.NEXT_PUBLIC_SUPABASE_URL 
    || process.env.SUPABASE_URL
    || '';
})();

export const supabaseAnonKey = (() => {
  loadEnv();
  return process.env.COZE_SUPABASE_ANON_KEY 
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    || process.env.SUPABASE_ANON_KEY
    || '';
})();

function getSupabaseCredentials(): SupabaseCredentials | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

function getSupabaseServiceRoleKey(): string | undefined {
  loadEnv();
  return process.env.COZE_SUPABASE_SERVICE_ROLE_KEY 
    || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function getSupabaseClient(token?: string): SupabaseClient | null {
  loadEnv();
  
  const url = process.env.COZE_SUPABASE_URL 
    || process.env.NEXT_PUBLIC_SUPABASE_URL 
    || process.env.SUPABASE_URL
    || '';
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY 
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    || process.env.SUPABASE_ANON_KEY
    || '';
  const serviceRoleKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY 
    || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // 诊断日志（所有环境）
  console.log('[Supabase] ENV Check:', {
    hasUrl: !!url,
    hasAnonKey: !!anonKey,
    hasServiceRoleKey: !!serviceRoleKey,
    nodeEnv: process.env.NODE_ENV,
    urlPrefix: url ? url.substring(0, 30) + '...' : 'EMPTY'
  });
  
  if (!url || !anonKey) {
    console.error('[Supabase] Missing credentials:', { url: !!url, anonKey: !!anonKey });
    return null;
  }

  let key: string;
  if (token) {
    key = anonKey;
  } else {
    key = serviceRoleKey ?? anonKey;
    if (!serviceRoleKey) {
      console.warn('[Supabase] Using anon key for service operations');
    }
  }

  const globalOptions: Record<string, unknown> = {};
  if (token) {
    globalOptions.headers = { Authorization: `Bearer ${token}` };
  }
  
  try {
    const client = createClient(url, key, {
      global: globalOptions as Record<string, string>,
      db: {
        timeout: 60000,
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return client;
  } catch (error) {
    console.error('[Supabase] Failed to create client:', error);
    return null;
  }
}

export { loadEnv, getSupabaseCredentials, getSupabaseServiceRoleKey, getSupabaseClient };
