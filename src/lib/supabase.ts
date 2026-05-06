// 统一导出 Supabase 客户端
// getSupabaseAdmin 在 @/lib/db.ts 中定义
export { getSupabaseAdmin } from '@/lib/db';
export { getSupabaseClient, supabaseUrl, supabaseAnonKey } from '@/storage/database/supabase-client';
