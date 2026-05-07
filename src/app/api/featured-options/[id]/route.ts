import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';
import { verifyAdminSession } from '@/lib/api-auth';

// 更新标签选项
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 验证管理员会话
  const auth = await verifyAdminSession(request);
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, message: '未授权访问，请先登录' },
      { status: 401 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
  }

  const body = await request.json();
  const { name, sort_order } = body;

  const updateData: { name?: string; sort_order?: number } = {};
  if (name !== undefined) updateData.name = name;
  if (sort_order !== undefined) updateData.sort_order = sort_order;

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

// 删除标签选项
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 验证管理员会话
  const auth = await verifyAdminSession(request);
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, message: '未授权访问，请先登录' },
      { status: 401 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
  }

  const { error } = await supabase
    .from('featured_options')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
