import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 });
    }
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const { error } = await supabaseAdmin
      .from('categories')
      .update({ name, description })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '分类已更新' });
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json({ success: false, message: '更新分类失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 });
    }
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '分类已删除' });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json({ success: false, message: '删除分类失败' }, { status: 500 });
  }
}
