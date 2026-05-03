import { NextResponse } from 'next/server';
import { validPasswords } from '@/lib/products';
import { getSupabaseAdmin } from '@/lib/db';

// 超级管理员密码
const SUPER_ADMIN_PASSWORD = 'admin2026';

// 从数据库获取管理员密码列表
async function getAdminPasswords(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return ['admin2024']; // 默认密码
  }
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'admin_password')
    .single();
  
  if (error || !data?.value) {
    return ['admin2024']; // 默认密码
  }
  
  try {
    const value = data.value;
    if (value.startsWith('[')) {
      return JSON.parse(value);
    } else if (value.includes(',')) {
      return value.split(',').filter(Boolean);
    } else if (value) {
      return [value];
    }
    return ['admin2024'];
  } catch {
    return ['admin2024'];
  }
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, message: '请输入密码' },
        { status: 400 }
      );
    }

    // 检查超级管理员密码
    if (password === SUPER_ADMIN_PASSWORD) {
      return NextResponse.json({ 
        success: true,
        isAdmin: true,
        isSuperAdmin: true,
        categoryPermission: null
      });
    }

    // 获取管理员密码列表并验证
    const adminPasswords = await getAdminPasswords();
    if (adminPasswords.includes(password)) {
      return NextResponse.json({ 
        success: true,
        isAdmin: true,
        isSuperAdmin: false,
        categoryPermission: null
      });
    }

    // 检查代码中定义的后备密码
    if (validPasswords.includes(password)) {
      return NextResponse.json({ 
        success: true,
        isAdmin: false,
        isSuperAdmin: false,
        categoryPermission: null
      });
    }

    // 从数据库获取访客密码列表
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { data: visitorData, error } = await supabaseAdmin
        .from('site_settings')
        .select('value')
        .eq('key', 'visitor_password')
        .single();
      
      if (!error && visitorData?.value) {
        let visitorPasswords: string[] = [];
        try {
          const value = visitorData.value;
          if (value.startsWith('[')) {
            visitorPasswords = JSON.parse(value);
          } else if (value) {
            visitorPasswords = [value];
          }
        } catch {}
        
        if (visitorPasswords.length > 0 && visitorPasswords.includes(password)) {
          return NextResponse.json({ 
            success: true,
            isAdmin: false,
            isSuperAdmin: false,
            categoryPermission: null
          });
        }
      }
    }

    return NextResponse.json(
      { success: false, message: '密码错误，请重试' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: '验证失败' },
      { status: 500 }
    );
  }
}
