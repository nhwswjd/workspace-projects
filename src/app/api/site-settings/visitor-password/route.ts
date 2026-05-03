import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ passwords: [] });
    }
    
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'visitor_password')
      .single();
    
    let passwords: string[] = [];
    if (data?.value) {
      const value = data.value;
      if (value.startsWith('[')) {
        try {
          const parsed = JSON.parse(value);
          passwords = Array.isArray(parsed) ? parsed : [value];
        } catch {
          passwords = [value];
        }
      } else {
        passwords = [value];
      }
    }
    
    return NextResponse.json({ passwords });
  } catch (error) {
    console.error('获取访客密码失败:', error);
    return NextResponse.json({ passwords: [] });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { passwords } = await request.json();
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
    }
    
    const value = JSON.stringify(passwords);
    
    const { error } = await supabase
      .from('site_settings')
      .upsert({ 
        key: 'visitor_password', 
        value 
      }, { 
        onConflict: 'key' 
      });
    
    if (error) {
      console.error('保存访客密码失败:', error);
      return NextResponse.json({ success: false, message: '保存失败' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存访客密码失败:', error);
    return NextResponse.json({ success: false, message: '保存失败' }, { status: 500 });
  }
}
