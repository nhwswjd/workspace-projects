import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';

// 获取标签选项
export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  const { data, error } = await supabase
    .from('featured_options')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // 按类型分组
  const featured = data?.filter((item: { type: string }) => item.type === 'featured') || [];
  const featuredRightBottom = data?.filter((item: { type: string }) => item.type === 'featured_right_bottom') || [];

  return NextResponse.json({
    success: true,
    featuredOptions: featured,
    featuredRightBottomOptions: featuredRightBottom
  });
}

// 添加标签选项
export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  const body = await request.json();
  const { type, name, sort_order } = body;

  if (!type || !name) {
    return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
  }

  if (!['featured', 'featured_right_bottom'].includes(type)) {
    return NextResponse.json({ success: false, error: '无效的标签类型' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('featured_options')
    .insert({ type, name, sort_order: sort_order || 0 })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

// 更新标签选项
export async function PUT(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
  
  const body = await request.json();
  const { id, name, sort_order } = body;

  if (!id || !name) {
    return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { name };
  if (sort_order !== undefined) {
    updateData.sort_order = sort_order;
  }

  const { data, error } = await supabase
    .from('featured_options')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
