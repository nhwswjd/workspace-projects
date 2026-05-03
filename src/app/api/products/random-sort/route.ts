import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { from, to } = await request.json();
    
    if (!from || !to || from < 1 || to < from) {
      return NextResponse.json({ error: '无效的范围参数' }, { status: 400 });
    }
    
    // 获取指定范围的产品
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, sort_order')
      .order('sort_order', { ascending: true });
    
    if (fetchError) {
      return NextResponse.json({ error: '获取产品失败' }, { status: 500 });
    }
    
    // 获取随机排序规则
    const { data: ruleData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'random_sort_rules')
      .single();
    
    const rules = ruleData?.value ? JSON.parse(ruleData.value) : [];
    
    // 筛选出在指定范围内的产品索引（从1开始）
    const rangeProducts = products.filter((_: unknown, index: number) => {
      const pos = index + 1; // 转为从1开始的位置
      return pos >= from && pos <= to;
    });
    
    if (rangeProducts.length < 2) {
      return NextResponse.json({ error: '范围内的产品少于2个，无法随机排序' }, { status: 400 });
    }
    
    // Fisher-Yates 洗牌算法
    const shuffled = [...rangeProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // 计算新的sort_order值
    // 保持原产品之间的排序间隙
    const minSortOrder = rangeProducts[0].sort_order ?? 0;
    const maxSortOrder = rangeProducts[rangeProducts.length - 1].sort_order ?? rangeProducts.length;
    const gap = Math.max(1, Math.floor((maxSortOrder - minSortOrder) / rangeProducts.length));
    
    // 更新每个产品的sort_order
    const updates = shuffled.map((product, index) => ({
      id: product.id,
      sort_order: minSortOrder + index * gap
    }));
    
    // 批量更新
    for (const update of updates) {
      await supabase
        .from('products')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);
    }
    
    // 添加新的排序规则
    const newRule = {
      id: Date.now(),
      from,
      to,
      createdAt: new Date().toISOString()
    };
    
    // 更新规则列表
    const updatedRules = [...rules, newRule];
    await supabase
      .from('site_settings')
      .upsert({ key: 'random_sort_rules', value: JSON.stringify(updatedRules) }, { onConflict: 'key' });
    
    return NextResponse.json({ 
      success: true, 
      shuffled: shuffled.length,
      rule: newRule
    });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
