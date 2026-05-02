import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getReportBuffer, createWrappedFetch } from 'coze-coding-dev-sdk';

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
    
    // 优先加载 .env 文件（服务端配置）
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

// 硬编码默认值（部署平台没有设置环境变量时的后备）
const DEFAULT_SUPABASE_URL = 'https://br-bonny-deer-52ec6415.supabase2.aidap-global.cn-beijing.volces.com';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTgwNTI0MTIsInJvbGUiOiJhbm9uIn0.0FNIFZWNcQgZ0tL9cLNFtcrVjBFxH_npbv2TBvAQkOw';

function getSupabaseCredentials(): SupabaseCredentials | null {
  loadEnv();

  // 尝试多个可能的环境变量名
  const url = process.env.COZE_SUPABASE_URL 
    || process.env.NEXT_PUBLIC_SUPABASE_URL 
    || process.env.SUPABASE_URL
    || DEFAULT_SUPABASE_URL;  // 硬编码默认值
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY 
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    || process.env.SUPABASE_ANON_KEY
    || DEFAULT_SUPABASE_ANON_KEY;  // 硬编码默认值

  if (!url || !anonKey) {
    console.error('[Supabase] Credentials missing!');
    console.error('[Supabase] Available vars:', {
      'COZE_SUPABASE_URL': !!process.env.COZE_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      'SUPABASE_URL': !!process.env.SUPABASE_URL,
      'COZE_SUPABASE_ANON_KEY': !!process.env.COZE_SUPABASE_ANON_KEY,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'SUPABASE_ANON_KEY': !!process.env.SUPABASE_ANON_KEY,
    });
    return null;
  }

  console.log('[Supabase] URL loaded:', url.substring(0, 50) + '...');
  return { url, anonKey };
}

// 硬编码默认值
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTgwNTI0MTIsInJvbGUiOiJzZXJ2aWNlX3JvbGUifQ.EL0gkoY6JMRegDI3jSy_WXKb8SYscHcuLi6qPA17aBc';

function getSupabaseServiceRoleKey(): string | undefined {
  loadEnv();
  return process.env.COZE_SUPABASE_SERVICE_ROLE_KEY 
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;  // 硬编码默认值
}

function getSupabaseClient(token?: string): SupabaseClient | null {
  const credentials = getSupabaseCredentials();
  if (!credentials) {
    console.error('Failed to get Supabase credentials');
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

  const globalOptions: Record<string, any> = {};
  if (token) {
    globalOptions.headers = { Authorization: `Bearer ${token}` };
  }
  try {
    const buffer = getReportBuffer();
    if (buffer) {
      globalOptions.fetch = createWrappedFetch(buffer, 'supabase');
    }
  } catch {
    // Silent — reporting setup failure should not block client creation
  }

  try {
    return createClient(url, key, {
      global: globalOptions,
      db: {
        timeout: 60000,
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
}

export { loadEnv, getSupabaseCredentials, getSupabaseServiceRoleKey, getSupabaseClient };
