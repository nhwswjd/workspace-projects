import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';
import { verifyAdminSession } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 });
    }
    const { id } = await params;

    // 先获取分类名称
    const { data: category, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('name')
      .eq('id', id)
      .single();

    if (categoryError || !category) {
      return NextResponse.json({ success: false, message: '分类不存在' }, { status: 404 });
    }

    // 再获取该分类下的产品
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category', category.name)
      .order('sort_order', { ascending: true });

    if (productsError) throw productsError;

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('获取分类产品失败:', error);
    return NextResponse.json({ success: false, message: '获取分类产品失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员会话
    const auth = await verifyAdminSession(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: '未授权访问，请先登录' },
        { status: 401 }
      );
    }

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
    // 验证管理员会话
    const auth = await verifyAdminSession(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: '未授权访问，请先登录' },
        { status: 401 }
      );
    }

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
