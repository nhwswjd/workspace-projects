import { NextResponse } from 'next/server';
import { validPasswords, getCategoryForPassword } from '@/lib/products';

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
      // 获取该密码对应的分类权限
      const categoryPermission = getCategoryForPassword(password);
      return NextResponse.json({ 
        success: true,
        categoryPermission 
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
