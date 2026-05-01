import { NextResponse } from 'next/server';
import { adminPassword } from '@/lib/products';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, message: '请输入密码' },
        { status: 400 }
      );
    }

    if (password === adminPassword) {
      // 管理员密码 - 全权限 + 管理员标识
      return NextResponse.json({ 
        success: true,
        isAdmin: true,
        categoryPermission: null
      });
    }

    // 从数据库获取访客密码列表
    const { data: visitorPasswords, error } = await supabase
      .from('visitor_passwords')
      .select('password')
      .eq('id', 'default');
    
    if (!error && visitorPasswords && visitorPasswords.length > 0) {
      const validPasswords = visitorPasswords.map(p => p.password);
      if (validPasswords.includes(password)) {
        return NextResponse.json({ 
          success: true,
          isAdmin: false,
          categoryPermission: null
        });
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
