import { getSupabaseAdmin } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { 
      page_url, 
      product_id, 
      product_name,
      referer 
    } = body;

    // 获取访客IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
               || request.headers.get('x-real-ip') 
               || 'unknown';

    // 获取User Agent
    const user_agent = request.headers.get('user-agent') || 'unknown';

    // 写入数据库
    const { error } = await supabaseAdmin
      .from('access_logs')
      .insert({
        ip,
        page_url: page_url || '/',
        product_id: product_id || null,
        product_name: product_name || null,
        user_agent,
        referer: referer || null,
        visited_at: new Date().toISOString()
      });

    if (error) {
      console.error('记录访问失败:', error);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('访问记录错误:', error);
    return Response.json({ error: 'Failed to record access' }, { status: 500 });
  }
}
