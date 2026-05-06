import { getSupabaseAdmin } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 获取时间范围参数（默认最近30天）
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. 总访问量
    const { count: totalVisits } = await supabaseAdmin
      .from('access_logs')
      .select('*', { count: 'exact', head: true });

    // 2. 今日访问量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayVisits } = await supabaseAdmin
      .from('access_logs')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', today.toISOString());

    // 3. 昨日访问量
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const { count: yesterdayVisits } = await supabaseAdmin
      .from('access_logs')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', yesterday.toISOString())
      .lt('visited_at', today.toISOString());

    // 4. 最近N天每日访问趋势
    const { data: dailyStats } = await supabaseAdmin
      .from('access_logs')
      .select('visited_at')
      .gte('visited_at', startDate.toISOString())
      .order('visited_at', { ascending: true });

    // 整理每日数据
    const dailyMap = new Map<string, number>();
    dailyStats?.forEach(log => {
      const date = new Date(log.visited_at).toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });
    const dailyTrend = Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    // 5. 热门产品TOP10
    const { data: topProducts } = await supabaseAdmin
      .from('access_logs')
      .select('product_id, product_name')
      .not('product_id', 'is', null)
      .gte('visited_at', startDate.toISOString());

    const productMap = new Map<string, { id: string; name: string; count: number }>();
    topProducts?.forEach(log => {
      if (log.product_id) {
        const existing = productMap.get(log.product_id);
        if (existing) {
          existing.count++;
        } else {
          productMap.set(log.product_id, {
            id: log.product_id,
            name: log.product_name || '未知产品',
            count: 1
          });
        }
      }
    });
    const popularProducts = Array.from(productMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 6. 最近访问记录
    const { data: recentLogs } = await supabaseAdmin
      .from('access_logs')
      .select('*')
      .order('visited_at', { ascending: false })
      .limit(50);

    // 7. 独立访客数（按IP去重）
    const { data: uniqueVisitors } = await supabaseAdmin
      .from('access_logs')
      .select('ip')
      .gte('visited_at', startDate.toISOString());
    
    const uniqueIps = new Set(uniqueVisitors?.map(v => v.ip));
    const uniqueVisitorCount = uniqueIps.size;

    return Response.json({
      success: true,
      stats: {
        totalVisits: totalVisits || 0,
        todayVisits: todayVisits || 0,
        yesterdayVisits: yesterdayVisits || 0,
        uniqueVisitors: uniqueVisitorCount,
        dailyTrend,
        popularProducts,
        recentLogs: recentLogs || []
      }
    });
  } catch (error) {
    console.error('获取统计失败:', error);
    return Response.json({ error: 'Failed to get statistics' }, { status: 500 });
  }
}
