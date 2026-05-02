import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getReportBuffer, createWrappedFetch } from 'coze-coding-dev-sdk';

let envLoaded = false;

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function loadEnv(): void {
  if (envLoaded) return;
  
  // 直接从 process.env 读取（Coze 平台会自动注入）
  // 如果没有值，尝试从 dotenv 读取
  if (!process.env.COZE_SUPABASE_URL || !process.env.COZE_SUPABASE_ANON_KEY) {
    try {
      const path = require('path');
      require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
    } catch {
      // dotenv not available, ignore
    }
  }
  
  envLoaded = true;
}

function getSupabaseCredentials(): SupabaseCredentials | null {
  loadEnv();

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Supabase credentials missing:', { url: !!url, anonKey: !!anonKey });
    return null;
  }

  return { url, anonKey };
}

function getSupabaseServiceRoleKey(): string | undefined {
  loadEnv();
  return process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
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
