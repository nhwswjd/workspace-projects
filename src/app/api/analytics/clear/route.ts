import { getSupabaseAdmin } from '@/lib/db';

export async function POST() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return Response.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }
    
    const { count, error } = await supabaseAdmin
      .from('access_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录
    
    if (error) {
      console.error('清除访问记录失败:', error);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, deleted: count || 0 });
  } catch (err) {
    console.error('清除访问记录异常:', err);
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
