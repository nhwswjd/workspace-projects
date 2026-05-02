import { NextResponse } from 'next/server';
import { getSiteSetting, updateSiteSetting } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
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
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin2024';
    
    if (authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key } = await params;
    const { value } = await request.json();
    
    await updateSiteSetting(key, value);
    
    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error('Error updating site setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
