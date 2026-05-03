import { NextResponse } from 'next/server';
import { getSiteSetting, updateSiteSetting } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const value = await getSiteSetting(key);
    return NextResponse.json({ key, value: value || '' });
  } catch (error) {
    console.error('Error fetching site setting:', error);
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // 管理后台本身已有密码保护，此处不再单独验证
    const { key } = await params;
    const { value } = await request.json();
    
    await updateSiteSetting(key, value);
    
    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error('Error updating site setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
