import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      categories: categories || []
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ success: false, message: '获取分类失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    const { error } = await supabaseAdmin
      .from('categories')
      .insert({ id, name, description });

    if (error) throw error;

    return NextResponse.json({ success: true, message: '分类创建成功' });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json({ success: false, message: '创建分类失败' }, { status: 500 });
  }
}
