import { getSupabaseAdmin } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 获取用户角色（通过header传递）
    const userRole = request.headers.get('x-user-role') || 'visitor';
    const isSuperAdmin = userRole === 'super_admin';
    const isAdmin = userRole === 'admin';
    
    // 普通管理员只能看访客的访问记录
    const canSeeAll = isSuperAdmin;
    const showOnlyVisitor = isAdmin;

    // 获取时间范围参数（默认最近30天）
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. 总访问量（根据权限过滤）
    let totalQuery = supabaseAdmin.from('access_logs').select('*', { count: 'exact', head: true });
    if (showOnlyVisitor) {
      totalQuery = totalQuery.eq('access_type', 'visitor');
    }
    const { count: totalVisits } = await totalQuery;

    // 2. 今日访问量
    let todayQuery = supabaseAdmin.from('access_logs').select('*', { count: 'exact', head: true }).gte('visited_at', new Date().toISOString().split('T')[0]);
    if (showOnlyVisitor) {
      todayQuery = todayQuery.eq('access_type', 'visitor');
    }
    const { count: todayVisits } = await todayQuery;

    // 3. 昨日访问量
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let yesterdayQuery = supabaseAdmin.from('access_logs').select('*', { count: 'exact', head: true })
      .gte('visited_at', yesterday.toISOString())
      .lt('visited_at', today.toISOString());
    if (showOnlyVisitor) {
      yesterdayQuery = yesterdayQuery.eq('access_type', 'visitor');
    }
    const { count: yesterdayVisits } = await yesterdayQuery;

    // 4. 独立访客数（按IP去重）
    let uniqueQuery = supabaseAdmin.from('access_logs').select('ip').gte('visited_at', startDate.toISOString());
    if (showOnlyVisitor) {
      uniqueQuery = uniqueQuery.eq('access_type', 'visitor');
    }
    const { data: uniqueVisitors } = await uniqueQuery;
    const uniqueIps = new Set(uniqueVisitors?.map(v => v.ip));
    const uniqueVisitorCount = uniqueIps.size;

    // 5. 最近访问记录
    let recentQuery = supabaseAdmin.from('access_logs').select('*').order('visited_at', { ascending: false }).limit(100);
    if (showOnlyVisitor) {
      recentQuery = recentQuery.eq('access_type', 'visitor');
    }
    const { data: recentLogs } = await recentQuery;

    // 6. 密码使用统计
    const passwordStats: Record<string, number> = {};
    const deviceStats: Record<string, number> = {};
    const browserStats: Record<string, number> = {};

    let statsQuery = supabaseAdmin.from('access_logs').select('password_used, device, browser').gte('visited_at', startDate.toISOString());
    if (showOnlyVisitor) {
      statsQuery = statsQuery.is('page_url', null);
    }
    const { data: allStats } = await statsQuery;

    allStats?.forEach(log => {
      if (log.password_used) {
        passwordStats[log.password_used] = (passwordStats[log.password_used] || 0) + 1;
      }
      if (log.device) {
        deviceStats[log.device] = (deviceStats[log.device] || 0) + 1;
      }
      if (log.browser) {
        browserStats[log.browser] = (browserStats[log.browser] || 0) + 1;
      }
    });

    return Response.json({
      success: true,
      stats: {
        totalVisits: totalVisits || 0,
        todayVisits: todayVisits || 0,
        yesterdayVisits: yesterdayVisits || 0,
        uniqueVisitors: uniqueVisitorCount,
        recentLogs: recentLogs || [],
        passwordStats,
        deviceStats,
        browserStats
      }
    });
  } catch (error) {
    console.error('获取统计失败:', error);
    return Response.json({ error: 'Failed to get statistics' }, { status: 500 });
  }
}
