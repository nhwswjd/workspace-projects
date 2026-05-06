import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';
import { verifyAdminSession } from '@/lib/api-auth';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 });
    }
    const { data: passwords, error } = await supabaseAdmin
      .from('visitor_passwords')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 不返回实际密码，只返回配置状态
    const result = (passwords || []).map(p => ({
      id: p.id,
      description: p.description,
      hasPassword: true,
      created_at: p.created_at
    }));

    return NextResponse.json({ success: true, passwords: result });
  } catch (error) {
    console.error('获取密码失败:', error);
    return NextResponse.json({ success: false, message: '获取密码失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { password, description } = body;
	
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return NextResponse.json({ success: false, message: '密码不能为空' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ success: false, message: '密码长度不能少于4位' }, { status: 400 });
    }

    const id = `pwd-${Date.now()}`;
    const { error } = await supabaseAdmin
      .from('visitor_passwords')
      .insert({ id, password: password.trim(), description: description || '' });

    if (error) throw error;

    return NextResponse.json({ success: true, message: '密码添加成功' });
  } catch (error) {
    console.error('添加密码失败:', error);
    return NextResponse.json({ success: false, message: '添加密码失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
