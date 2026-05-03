import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'random_sort_rules')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: '获取规则失败' }, { status: 500 });
    }
    
    const rules = data?.value ? JSON.parse(data.value) : [];
    return NextResponse.json({ rules });
  } catch {
    return NextResponse.json({ rules: [] });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { rules } = await request.json();
    
    // 先删除旧规则
    await supabase
      .from('site_settings')
      .delete()
      .eq('key', 'random_sort_rules');
    
    // 添加新规则
    const { error } = await supabase
      .from('site_settings')
      .insert({ key: 'random_sort_rules', value: JSON.stringify(rules) });
    
    if (error) {
      return NextResponse.json({ error: '保存规则失败' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, rules });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
