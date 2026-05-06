import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.COZE_SUPABASE_URL;
  const key = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const isSuperAdmin = searchParams.get('super_admin') === 'true';

    // 并行获取所有数据
    const [
      productsResult,
      brandResult,
      visitorPwdResult,
      rulesResult,
      tagsResult,
      categoriesResult,
      featuredResult,
      adminPwdResult
    ] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'brand_name')
        .single(),
      supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'visitor_password')
        .single(),
      supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'random-sort-rules')
        .single(),
      supabase.from('tags').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('created_at', { ascending: false }),
      supabase.from('featured_options').select('*').order('created_at', { ascending: false }),
      isSuperAdmin
        ? supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'admin_password')
            .single()
        : Promise.resolve({ data: null, error: null })
    ]);

    return NextResponse.json({
      products: productsResult.data || [],
      brandName: brandResult.data?.value || '江南风景好',
      visitorPassword: visitorPwdResult.data?.value || '',
      randomSortRules: rulesResult.data?.value ? JSON.parse(rulesResult.data.value) : [],
      tags: tagsResult.data || [],
      categories: categoriesResult.data || [],
      featuredOptions: featuredResult.data?.filter((f: any) => f.type === 'featured') || [],
      featuredRightBottomOptions: featuredResult.data?.filter((f: any) => f.type === 'featured_right_bottom') || [],
      adminPassword: adminPwdResult.data?.value || ''
    });
  } catch (error) {
    console.error('加载数据失败', error);
    return NextResponse.json({ error: '加载数据失败' }, { status: 500 });
  }
}
