import { getSupabaseClient } from '@/storage/database/supabase-client';

const getSupabase = () => getSupabaseClient();

export async function GET() {
  try {
    const supabase = getSupabase();

    // 备份所有表的数据
    const [products, categories, tags, featuredOptions] = await Promise.all([
      supabase?.from('products').select('*'),
      supabase?.from('categories').select('*'),
      supabase?.from('tags').select('*'),
      supabase?.from('featured_options').select('*'),
    ]);

    const backup = {
      version: '1.0',
      created_at: new Date().toISOString(),
      tables: {
        products: products?.data || [],
        categories: categories?.data || [],
        tags: tags?.data || [],
        featured_options: featuredOptions?.data || [],
      },
    };

    return Response.json(backup);
  } catch (error) {
    console.error('Backup error:', error);
    return Response.json({ error: '备份失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: '请上传备份文件' }, { status: 400 });
    }

    const content = await file.text();
    const backup = JSON.parse(content);

    if (!backup.version || !backup.tables) {
      return Response.json({ error: '无效的备份文件格式' }, { status: 400 });
    }

    // 清空现有数据并恢复
    // 清空表（按依赖关系顺序）
    await supabase?.from('featured_options').delete().neq('id', '');
    await supabase?.from('tags').delete().neq('id', '');
    await supabase?.from('products').delete().neq('id', '');
    await supabase?.from('categories').delete().neq('id', '');

    // 恢复分类
    if (backup.tables.categories?.length > 0) {
      for (const cat of backup.tables.categories) {
        await supabase?.from('categories').insert(cat);
      }
    }

    // 恢复标签
    if (backup.tables.tags?.length > 0) {
      for (const tag of backup.tables.tags) {
        await supabase?.from('tags').insert(tag);
      }
    }

    // 恢复精选标签选项
    if (backup.tables.featured_options?.length > 0) {
      for (const opt of backup.tables.featured_options) {
        await supabase?.from('featured_options').insert(opt);
      }
    }

    // 恢复产品
    if (backup.tables.products?.length > 0) {
      for (const product of backup.tables.products) {
        await supabase?.from('products').insert(product);
      }
    }

    return Response.json({ success: true, message: '数据恢复成功' });
  } catch (error) {
    console.error('Restore error:', error);
    return Response.json({ error: '恢复失败' }, { status: 500 });
  }
}
