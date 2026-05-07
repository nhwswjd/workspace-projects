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

// 硬编码的备选值（仅用于环境变量无法注入的情况）
const FALLBACK_SUPABASE_URL = 'https://br-bonny-deer-52ec6415.supabase2.aidap-global.cn-beijing.volces.com';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyLWJvbm55LWRlZXItNTJlYzY0MTUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0OTY0NTI0MCwiZXhwIjoxOTY1MjIxMjQwfQ.VyJh6F6Orm3F7rGVb0kR6V1cW6_1C0m6Z6K5Q7YZQqM';
const FALLBACK_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTgwNTI0MTIsInJvbGUiOiJzZXJ2aWNlX3JvbGUifQ.EL0gkoY6JMRegDI3jSy_WXKb8SYscHcuLi6qPA17aBc';

// 导出配置变量供外部使用
export const supabaseUrl = (() => {
  loadEnv();
  return process.env.COZE_SUPABASE_URL 
    || process.env.NEXT_PUBLIC_SUPABASE_URL 
    || process.env.SUPABASE_URL
    || FALLBACK_SUPABASE_URL;  // 使用硬编码备选值
})();

export const supabaseAnonKey = (() => {
  loadEnv();
  return process.env.COZE_SUPABASE_ANON_KEY 
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    || process.env.SUPABASE_ANON_KEY
    || FALLBACK_SUPABASE_ANON_KEY;  // 使用硬编码备选值
})();

function getSupabaseCredentials(): SupabaseCredentials | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Credentials missing:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
    return null;
  }
  console.log('[Supabase] Using credentials:', { url: supabaseUrl.substring(0, 30) + '...', hasAnonKey: !!supabaseAnonKey });
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

function getSupabaseServiceRoleKey(): string | undefined {
  loadEnv();
  return process.env.COZE_SUPABASE_SERVICE_ROLE_KEY 
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || FALLBACK_SUPABASE_SERVICE_ROLE_KEY;  // 使用硬编码备选值
}

function getSupabaseClient(token?: string): SupabaseClient | null {
  const credentials = getSupabaseCredentials();
  if (!credentials) {
    console.error('[Supabase] getSupabaseClient: credentials is null');
    return null;
  }

  const { url, anonKey } = credentials;

  let key: string;
  if (token) {
    key = anonKey;
  } else {
    const serviceRoleKey = getSupabaseServiceRoleKey();
    key = serviceRoleKey ?? anonKey;
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
