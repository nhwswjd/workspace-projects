import { NextResponse } from 'next/server';
import { validPasswords } from '@/lib/products';
import { getSupabaseAdmin } from '@/lib/db';

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

    // 获取管理员密码列表并验证
    const adminPasswords = await getAdminPasswords();
    if (adminPasswords.includes(password)) {
      return NextResponse.json({ 
        success: true,
        isAdmin: true,
        categoryPermission: null
      });
    }

    // 检查代码中定义的后备密码
    if (validPasswords.includes(password)) {
      return NextResponse.json({ 
        success: true,
        isAdmin: false,
        categoryPermission: null
      });
    }

    // 从数据库获取访客密码列表
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { data: visitorPasswords, error } = await supabaseAdmin
        .from('visitor_passwords')
        .select('password');
      
      if (!error && visitorPasswords && visitorPasswords.length > 0) {
        const validVisitorPasswords = visitorPasswords.map(p => p.password);
        if (validVisitorPasswords.includes(password)) {
          return NextResponse.json({ 
            success: true,
            isAdmin: false,
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
