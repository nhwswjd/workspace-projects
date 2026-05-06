import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';

// 超级管理员密码（硬编码，用于紧急访问）
const SUPER_ADMIN_PASSWORD = 'admin2026';

// 默认访客密码（当数据库无配置时使用）
const DEFAULT_VISITOR_PASSWORD = 'atelier2024';

// 默认管理员密码（当数据库无配置时使用）
const DEFAULT_ADMIN_PASSWORD = 'admin2024';

// 从数据库获取密码配置
async function getPasswords() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      visitor: [DEFAULT_VISITOR_PASSWORD],
      admin: [DEFAULT_ADMIN_PASSWORD]
    };
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['visitor_password', 'admin_password']);

    if (error) {
      return {
        visitor: [DEFAULT_VISITOR_PASSWORD],
        admin: [DEFAULT_ADMIN_PASSWORD]
      };
    }

    const visitorSetting = data?.find(d => d.key === 'visitor_password');
    const adminSetting = data?.find(d => d.key === 'admin_password');

    // 解析访客密码
    let visitorPasswords = [DEFAULT_VISITOR_PASSWORD];
    if (visitorSetting?.value) {
      try {
        const value = visitorSetting.value;
        if (value.startsWith('[')) {
          visitorPasswords = JSON.parse(value);
        } else if (value) {
          visitorPasswords = [value];
        }
      } catch {}
    }

    // 解析管理员密码
    let adminPasswords = [DEFAULT_ADMIN_PASSWORD];
    if (adminSetting?.value) {
      try {
        const value = adminSetting.value;
        if (value.startsWith('[')) {
          adminPasswords = JSON.parse(value);
        } else if (value.includes(',')) {
          adminPasswords = value.split(',').filter(Boolean);
        } else if (value) {
          adminPasswords = [value];
        }
      } catch {}
    }

    return {
      visitor: visitorPasswords,
      admin: adminPasswords
    };
  } catch {
    return {
      visitor: [DEFAULT_VISITOR_PASSWORD],
      admin: [DEFAULT_ADMIN_PASSWORD]
    };
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
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const originalUA = userAgent;
    const androidMatch = originalUA.match(/Android[^;]*;\s*([^)]+)\)/);
    const androidDevice = androidMatch ? androidMatch[1].trim() : '';
    const ua = originalUA.toLowerCase();
    let device = '未知';
    let browser = '未知';

    // iPhone检测
    if (ua.includes('iphone')) {
      const versionMatch = originalUA.match(/iPhone\s+OS\s+(\d+)[_\d]*/);
      const version = versionMatch ? ` ${versionMatch[1]}` : '';
      device = `iPhone${version}`;
    } else if (ua.includes('ipad')) {
      device = 'iPad';
    } else if (ua.includes('ipod')) {
      device = 'iPod';
    } else if (androidDevice) {
      const deviceLower = androidDevice.toLowerCase();
      if (deviceLower.includes('xiaomi') || deviceLower.includes('redmi') || deviceLower.includes('poco')) {
        device = androidDevice.replace(/xiaomi/i, '小米').replace(/redmi/i, 'Redmi').replace(/poco/i, 'POCO');
      } else if (deviceLower.includes('huawei')) {
        device = androidDevice;
      } else if (deviceLower.includes('oppo')) {
        device = androidDevice.includes('OPPO') ? androidDevice : `OPPO ${androidDevice}`;
      } else if (deviceLower.includes('vivo')) {
        device = androidDevice;
      } else if (deviceLower.includes('samsung') || deviceLower.includes('galaxy')) {
        device = androidDevice.includes('Samsung') ? androidDevice : `Samsung ${androidDevice}`;
      } else if (deviceLower.includes('oneplus')) {
        device = androidDevice.includes('OnePlus') ? androidDevice : `OnePlus ${androidDevice}`;
      } else if (deviceLower.includes('realme')) {
        device = androidDevice.includes('Realme') ? androidDevice : `Realme ${androidDevice}`;
      } else if (deviceLower.includes('honor')) {
        device = androidDevice.includes('Honor') ? androidDevice : `Honor ${androidDevice}`;
      } else {
        device = androidDevice;
      }
    } else if (ua.includes('windows')) {
      device = 'Windows PC';
    } else if (ua.includes('macintosh') || ua.includes('mac os')) {
      device = 'Mac';
    } else if (ua.includes('linux')) {
      device = 'Linux';
    } else if (ua.includes('mobile')) {
      device = '手机';
    }

    if (ua.includes('micromessenger') || ua.includes('wechat')) {
      browser = '微信';
    } else if (ua.includes('quark')) {
      browser = '夸克';
    } else if (ua.includes('baidu') && ua.includes('mbrowser')) {
      browser = '百度';
    } else if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = 'Chrome';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'Safari';
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('edg')) {
      browser = 'Edge';
    } else if (ua.includes('qqbrowser')) {
      browser = 'QQ浏览器';
    } else if (ua.includes('ucbrowser') || ua.includes('ucweb')) {
      browser = 'UC浏览器';
    } else if (ua.includes('opera') || ua.includes('opr')) {
      browser = 'Opera';
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

    if (!error) {
      // 自动清理超过1000条的旧记录
      await supabase.rpc('delete_old_access_logs', { keep_count: 1000 });
    }
  } catch {
    // 静默失败，不影响验证流程
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

    // 获取所有密码配置
    const { visitor: visitorPasswords, admin: adminPasswords } = await getPasswords();

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

    // 检查管理员密码（优先于访客密码）
    if (adminPasswords.includes(password)) {
      await recordAccess(request, password, 'admin');
      return NextResponse.json({
        success: true,
        isAdmin: true,
        isSuperAdmin: false,
        categoryPermission: null
      });
    }

    // 检查访客密码
    if (visitorPasswords.includes(password)) {
      await recordAccess(request, password, 'visitor');
      return NextResponse.json({
        success: true,
        isAdmin: false,
        isSuperAdmin: false,
        categoryPermission: null
      });
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
