import { NextResponse } from 'next/server';
import { validPasswords } from '@/lib/products';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, message: '请输入密码' },
        { status: 400 }
      );
    }

    if (validPasswords.includes(password)) {
      // 所有密码都是全权限
      return NextResponse.json({ 
        success: true,
        categoryPermission: null // 全权限
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
