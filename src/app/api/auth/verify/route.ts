import { NextResponse } from 'next/server';
import { validPasswords } from '@/lib/products';
import { getSupabaseAdmin } from '@/lib/db';

// 超级管理员密码
const SUPER_ADMIN_PASSWORD = 'admin2026';

// 从数据库获取管理员密码列表
async function getAdminPasswords(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return ['admin2024']; // 默认密码
  }
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'admin_password')
    .single();
  
  if (error || !data?.value) {
    return ['admin2024']; // 默认密码
  }
  
  try {
    const value = data.value;
    if (value.startsWith('[')) {
      return JSON.parse(value);
    } else if (value.includes(',')) {
      return value.split(',').filter(Boolean);
    } else if (value) {
      return [value];
    }
    return ['admin2024'];
  } catch {
    return ['admin2024'];
  }
}

// 记录访问日志
async function recordAccess(
  req: Request,
  password: string,
  accessType: 'super_admin' | 'admin' | 'visitor'
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    // 获取请求信息
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // 解析设备信息
    const ua = userAgent.toLowerCase();
    let device = '未知';
    let browser = '未知';

    if (ua.includes('iphone')) {
      device = 'iPhone';
    } else if (ua.includes('ipad')) {
      device = 'iPad';
    } else if (ua.includes('android')) {
      if (ua.includes('huawei')) device = '华为';
      else if (ua.includes('xiaomi') || ua.includes('redmi')) device = '小米';
      else if (ua.includes('oppo')) device = 'OPPO';
      else if (ua.includes('vivo')) device = 'vivo';
      else if (ua.includes('samsung')) device = '三星';
      else if (ua.includes('oneplus')) device = '一加';
      else device = 'Android';
    } else if (ua.includes('windows')) {
      device = '电脑';
    } else if (ua.includes('macintosh') || ua.includes('mac os')) {
      device = 'Mac';
    } else if (ua.includes('linux')) {
      device = 'Linux';
    }

    if (ua.includes('micromessenger') || ua.includes('wechat')) {
      browser = '微信';
    } else if (ua.includes('qqbrowser')) {
      browser = 'QQ浏览器';
    } else if (ua.includes('ucbrowser') || ua.includes('ucweb')) {
      browser = 'UC浏览器';
    } else if (ua.includes('quark')) {
      browser = '夸克';
    } else if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = 'Chrome';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'Safari';
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('edg')) {
      browser = 'Edge';
    }

    // 获取IP归属地
    let location = '';
    if (ip && ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168') && !ip.startsWith('10.')) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
        const geoData = await geoResponse.json();
        if (geoData.status === 'success') {
          location = `${geoData.country || ''} ${geoData.regionName || ''} ${geoData.city || ''}`.trim();
        }
      } catch {
        location = '';
      }
    } else if (ip === '127.0.0.1' || ip === '::1') {
      location = '本地网络';
    }

    // 插入记录
    const { error } = await supabase.from('access_logs').insert({
      ip,
      password_used: password,
      access_type: accessType,
      device,
      browser,
      location,
      page_url: '/verify',
      visited_at: new Date().toISOString()
    });
    
    if (error) {
      console.error('[访问记录] 插入失败:', error);
    }
  } catch (error) {
    console.error('[访问记录] 记录失败:', error);
  }
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, message: '请输入密码' },
        { status: 400 }
      );
    }

    // 检查超级管理员密码
    if (password === SUPER_ADMIN_PASSWORD) {
      await recordAccess(request, password, 'super_admin');
      return NextResponse.json({ 
        success: true,
        isAdmin: true,
        isSuperAdmin: true,
        categoryPermission: null
      });
    }

    // 获取管理员密码列表并验证
    const adminPasswords = await getAdminPasswords();
    if (adminPasswords.includes(password)) {
      await recordAccess(request, password, 'admin');
      return NextResponse.json({ 
        success: true,
        isAdmin: true,
        isSuperAdmin: false,
        categoryPermission: null
      });
    }

    // 检查代码中定义的后备密码
    if (validPasswords.includes(password)) {
      await recordAccess(request, password, 'visitor');
      return NextResponse.json({ 
        success: true,
        isAdmin: false,
        isSuperAdmin: false,
        categoryPermission: null
      });
    }

    // 从数据库获取访客密码列表
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { data: visitorData, error } = await supabaseAdmin
        .from('site_settings')
        .select('value')
        .eq('key', 'visitor_password')
        .single();
      
      if (!error && visitorData?.value) {
        let visitorPasswords: string[] = [];
        try {
          const value = visitorData.value;
          if (value.startsWith('[')) {
            visitorPasswords = JSON.parse(value);
          } else if (value) {
            visitorPasswords = [value];
          }
        } catch {}
        
        if (visitorPasswords.length > 0 && visitorPasswords.includes(password)) {
          await recordAccess(request, password, 'visitor');
          return NextResponse.json({ 
            success: true,
            isAdmin: false,
            isSuperAdmin: false,
            categoryPermission: null
          });
        }
      }
    }

    return NextResponse.json(
      { success: false, message: '密码错误，请重试' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: '验证失败' },
      { status: 500 }
    );
  }
}
