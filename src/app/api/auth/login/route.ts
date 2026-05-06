import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';

// 解析User Agent获取设备信息
function parseUserAgent(ua: string): { device: string; browser: string } {
  let device = '未知';
  let browser = '未知';

  if (ua.includes('Xiaomi') || ua.includes('Redmi') || ua.includes('POCO')) {
    device = '小米';
  } else if (ua.includes('HUAWEI') || ua.includes('Huawei')) {
    device = '华为';
  } else if (ua.includes('OPPO')) {
    device = 'OPPO';
  } else if (ua.includes('vivo')) {
    device = 'vivo';
  } else if (ua.includes('Samsung') || ua.includes('Galaxy')) {
    device = '三星';
  } else if (ua.includes('iPhone')) {
    device = 'iPhone';
  } else if (ua.includes('iPad')) {
    device = 'iPad';
  } else if (ua.includes('Windows')) {
    device = 'Windows';
  } else if (ua.includes('Macintosh')) {
    device = 'Mac';
  } else if (ua.includes('Mobile')) {
    device = '手机';
  }

  if (ua.includes('MicroMessenger') || ua.includes('WeChat')) {
    browser = '微信';
  } else if (ua.includes('Quark')) {
    browser = '夸克';
  } else if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
  } else if (ua.includes('QQBrowser')) {
    browser = 'QQ浏览器';
  } else if (ua.includes('UCBrowser') || ua.includes('UCWEB')) {
    browser = 'UC浏览器';
  }

  return { device, browser };
}

// 获取IP归属地
async function getIpLocation(ip: string): Promise<string> {
  // 跳过本地IP和无效IP
  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return '本地网络';
  }
  
  try {
    // 使用 ip-api.com 免费API
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
    const data = await response.json();
    
    if (data.status === 'success') {
      const parts = [];
      if (data.country) parts.push(data.country);
      if (data.regionName && data.regionName !== data.country) parts.push(data.regionName);
      if (data.city) parts.push(data.city);
      return parts.join(' ') || '未知';
    }
  } catch (error) {
    console.error('获取IP归属地失败:', error);
  }
  
  return '未知';
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json({ success: false, message: '请输入密码' }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
    }
    
    // 获取访客IP和设备信息
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
               || request.headers.get('x-real-ip') 
               || 'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';
    const { device, browser } = parseUserAgent(user_agent);
    
    // 获取管理员密码
    const { data: adminData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_password')
      .single();
    
    // 获取访客密码
    const { data: visitorData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'visitor_password')
      .single();
    
    // 解析管理员密码
    let adminPasswords: string[] = [];
    if (adminData?.value) {
      const pwdValue = adminData.value;
      if (pwdValue.startsWith('[')) {
        try {
          const parsed = JSON.parse(pwdValue);
          adminPasswords = Array.isArray(parsed) ? parsed : [pwdValue];
        } catch {
          adminPasswords = [pwdValue];
        }
      } else if (pwdValue.includes(',')) {
        adminPasswords = pwdValue.split(',').filter(Boolean);
      } else {
        adminPasswords = [pwdValue];
      }
    }
    
    // 解析访客密码
    let visitorPasswords: string[] = [];
    if (visitorData?.value) {
      const pwdValue = visitorData.value;
      if (pwdValue.startsWith('[')) {
        try {
          const parsed = JSON.parse(pwdValue);
          visitorPasswords = Array.isArray(parsed) ? parsed : [pwdValue];
        } catch {
          visitorPasswords = [pwdValue];
        }
      } else if (pwdValue.includes(',')) {
        visitorPasswords = pwdValue.split(',').filter(Boolean);
      } else {
        visitorPasswords = [pwdValue];
      }
    }
    
    // 如果没有配置任何密码，默认管理员密码
    if (adminPasswords.length === 0 && visitorPasswords.length === 0) {
      adminPasswords = ['admin2024'];
    }
    
    // 获取IP归属地
    const location = await getIpLocation(ip);
    
    // 超级管理员密码（可以看全部记录）
    const SUPER_ADMIN_PASSWORD = 'admin2026';
    
    // 检查密码 - 超级管理员
    if (password === SUPER_ADMIN_PASSWORD) {
      await supabase.from('access_logs').insert({
        ip,
        location,
        page_url: '/login',
        password_used: password,
        device,
        browser,
        access_type: 'super_admin',
        visited_at: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        success: true, 
        role: 'super_admin',
        message: '超级管理员登录成功' 
      });
    }
    
    // 检查密码 - 普通管理员
    if (adminPasswords.includes(password)) {
      await supabase.from('access_logs').insert({
        ip,
        location,
        page_url: '/login',
        password_used: password,
        device,
        browser,
        access_type: 'admin',
        visited_at: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        success: true, 
        role: 'admin',
        message: '管理员登录成功' 
      });
    }
    
    // 检查密码 - 访客
    if (visitorPasswords.includes(password)) {
      try {
        const { error: insertError } = await supabase.from('access_logs').insert({
          ip,
          location,
          page_url: '/login',
          password_used: password,
          device,
          browser,
          access_type: 'visitor',
          visited_at: new Date().toISOString()
        });
        if (insertError) {
          console.error('记录访客访问失败:', insertError);
        }
      } catch (err) {
        console.error('记录访客访问异常:', err);
      }
      
      return NextResponse.json({ 
        success: true, 
        role: 'visitor',
        message: '访客登录成功' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: '密码错误，请重试' 
    }, { status: 401 });
    
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({ 
      success: false, 
      message: '登录失败，请重试' 
    }, { status: 500 });
  }
}
