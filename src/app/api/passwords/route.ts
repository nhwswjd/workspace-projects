import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET() {
  try {
    const { data: passwords, error } = await supabaseAdmin
      .from('visitor_passwords')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, passwords: passwords || [] });
  } catch (error) {
    console.error('获取密码失败:', error);
    return NextResponse.json({ success: false, message: '获取密码失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, description } = body;

    if (!password) {
      return NextResponse.json({ success: false, message: '密码不能为空' }, { status: 400 });
    }

    const id = `pwd-${Date.now()}`;
    const { error } = await supabaseAdmin
      .from('visitor_passwords')
      .insert({ id, password, description: description || '' });

    if (error) throw error;

    return NextResponse.json({ success: true, message: '密码添加成功' });
  } catch (error) {
    console.error('添加密码失败:', error);
    return NextResponse.json({ success: false, message: '添加密码失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: '缺少密码ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('visitor_passwords')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '密码删除成功' });
  } catch (error) {
    console.error('删除密码失败:', error);
    return NextResponse.json({ success: false, message: '删除密码失败' }, { status: 500 });
  }
}
