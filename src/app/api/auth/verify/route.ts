import { NextResponse } from 'next/server';
import { validPasswords, adminPassword } from '@/lib/products';

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

    if (validPasswords.includes(password)) {
      // 访客密码 - 全权限
      return NextResponse.json({ 
        success: true,
        isAdmin: false,
        categoryPermission: null
      });
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
