import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json({ success: false, message: '请输入密码' }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
    }
    
    // 获取管理员密码
    const { data: adminData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_password')
      .single();
    
    // 获取访客密码
    const { data: visitorData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'visitor_password')
      .single();
    
    // 解析管理员密码
    let adminPasswords: string[] = [];
    if (adminData?.value) {
      const pwdValue = adminData.value;
      if (pwdValue.startsWith('[')) {
        try {
          const parsed = JSON.parse(pwdValue);
          adminPasswords = Array.isArray(parsed) ? parsed : [pwdValue];
        } catch {
          adminPasswords = [pwdValue];
        }
      } else if (pwdValue.includes(',')) {
        adminPasswords = pwdValue.split(',').filter(Boolean);
      } else {
        adminPasswords = [pwdValue];
      }
    }
    
    // 解析访客密码
    let visitorPasswords: string[] = [];
    if (visitorData?.value) {
      const pwdValue = visitorData.value;
      if (pwdValue.startsWith('[')) {
        try {
          const parsed = JSON.parse(pwdValue);
          visitorPasswords = Array.isArray(parsed) ? parsed : [pwdValue];
        } catch {
          visitorPasswords = [pwdValue];
        }
      } else if (pwdValue.includes(',')) {
        visitorPasswords = pwdValue.split(',').filter(Boolean);
      } else {
        visitorPasswords = [pwdValue];
      }
    }
    
    // 如果没有配置任何密码，默认管理员密码
    if (adminPasswords.length === 0 && visitorPasswords.length === 0) {
      adminPasswords = ['admin2024'];
    }
    
    // 检查密码
    if (adminPasswords.includes(password)) {
      return NextResponse.json({ 
        success: true, 
        role: 'admin',
        message: '管理员登录成功' 
      });
    }
    
    if (visitorPasswords.includes(password)) {
      return NextResponse.json({ 
        success: true, 
        role: 'visitor',
        message: '访客登录成功' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: '密码错误，请重试' 
    }, { status: 401 });
    
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({ 
      success: false, 
      message: '登录失败，请重试' 
    }, { status: 500 });
  }
}
