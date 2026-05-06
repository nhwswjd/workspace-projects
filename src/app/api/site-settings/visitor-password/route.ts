import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';
import { verifyAdminSession } from '@/lib/api-auth';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ configured: false });
    }
    
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'visitor_password')
      .single();
    
    // 只返回是否配置了密码，不返回实际密码
    const configured = !!(data?.value);
    
    return NextResponse.json({ configured });
  } catch (error) {
    console.error('获取访客密码配置失败:', error);
    return NextResponse.json({ configured: false });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 验证管理员会话
    const auth = await verifyAdminSession(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: '未授权访问，请先登录' },
        { status: 401 }
      );
    }

    const { passwords } = await request.json();
    
    // 验证密码格式
    if (!Array.isArray(passwords)) {
      return NextResponse.json({ success: false, message: '密码格式错误' }, { status: 400 });
    }
    
    // 验证每个密码都是非空字符串
    for (const pwd of passwords) {
      if (typeof pwd !== 'string' || pwd.trim().length === 0) {
        return NextResponse.json({ success: false, message: '密码不能为空' }, { status: 400 });
      }
      // 密码最小长度检查（可选）
      if (pwd.length < 4) {
        return NextResponse.json({ success: false, message: '密码长度不能少于4位' }, { status: 400 });
      }
    }
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
    }
    
    const value = JSON.stringify(passwords);
    
    const { error } = await supabase
      .from('site_settings')
      .upsert({ 
        key: 'visitor_password', 
        value 
      }, { 
        onConflict: 'key' 
      });
    
    if (error) {
      console.error('保存访客密码失败:', error);
      return NextResponse.json({ success: false, message: '保存失败' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存访客密码失败:', error);
    return NextResponse.json({ success: false, message: '保存失败' }, { status: 500 });
  }
}
