import { NextResponse } from 'next/server';
import { adminPassword, validPasswords } from '@/lib/products';
import { createClient } from '@supabase/supabase-js';

// 硬编码默认值
const DEFAULT_SUPABASE_URL = 'https://br-bonny-deer-52ec6415.supabase2.aidap-global.cn-beijing.volces.com';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTgwNTI0MTIsInJvbGUiOiJhbm9uIn0.0FNIFZWNcQgZ0tL9cLNFtcrVjBFxH_npbv2TBvAQkOw';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key);
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

    if (password === adminPassword) {
      return NextResponse.json({ 
        success: true,
        isAdmin: true,
        categoryPermission: null
      });
    }

    // 首先检查代码中定义的后备密码
    if (validPasswords.includes(password)) {
      return NextResponse.json({ 
        success: true,
        isAdmin: false,
        categoryPermission: null
      });
    }

    // 从数据库获取访客密码列表
    const supabase = getSupabase();
    const { data: visitorPasswords, error } = await supabase
      .from('visitor_passwords')
      .select('password');
    
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
