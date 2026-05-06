import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 合并 Tailwind 类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 解析密码列表
export const parsePasswords = (value: string): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value ? [value] : [];
  }
};

// 格式化文件大小
export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化日期时间
export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 解析设备信息
export const parseDevice = (ua: string): { device: string; browser: string } => {
  if (!ua) return { device: '未知', browser: '未知' };
  
  let device = '电脑';
  let browser = '浏览器';
  
  // 检测移动设备
  const isMobile = /mobile|android|iphone|ipad|ipod|huawei|xiaomi|oppo|vivo|samsung|oneplus|realme|honor/i.test(ua);
  
  if (isMobile) {
    // 尝试提取具体型号
    if (/iphone.*os (\d+)/i.test(ua)) {
      device = 'iPhone';
    } else if (/ipad/i.test(ua)) {
      device = 'iPad';
    } else if (/huawei|p50|p40|mate/i.test(ua)) {
      device = '华为';
      if (/p50/i.test(ua)) device = '华为 P50';
      else if (/p40/i.test(ua)) device = '华为 P40';
      else if (/mate/i.test(ua)) device = '华为 Mate';
    } else if (/xiaomi|mi |redmi|骁龙/i.test(ua)) {
      if (/xiaomi\s*(\d+)/i.test(ua)) {
        device = '小米 ' + (ua.match(/xiaomi\s*(\d+)/i)?.[1] || '');
      } else if (/mi\s*(\d+)/i.test(ua)) {
        device = '小米 ' + (ua.match(/mi\s*(\d+)/i)?.[1] || '');
      } else if (/redmi\s*(\w+)/i.test(ua)) {
        device = '红米 ' + (ua.match(/redmi\s*(\w+)/i)?.[1] || '');
      } else {
        device = '小米';
      }
    } else if (/oppo|reno|find/i.test(ua)) {
      device = 'OPPO';
    } else if (/vivo|x|iQOO/i.test(ua)) {
      device = 'vivo';
    } else if (/samsung|galaxy/i.test(ua)) {
      device = '三星';
    } else if (/oneplus/i.test(ua)) {
      device = '一加';
    } else if (/realme/i.test(ua)) {
      device = 'realme';
    } else if (/honor/i.test(ua)) {
      device = '荣耀';
    } else {
      device = '手机';
    }
  } else if (isMobile) {
    device = '手机';
  } else if (/windows/i.test(ua)) {
    device = 'Windows';
  } else if (/mac/i.test(ua)) {
    device = 'Mac';
  } else if (/linux/i.test(ua)) {
    device = 'Linux';
  } else {
    device = '电脑';
  }
  
  // 检测浏览器
  if (/micromessenger|wechat/i.test(ua)) browser = '微信';
  else if (/qqbrowser/i.test(ua)) browser = 'QQ浏览器';
  else if (/ubrowser|ucbrowser|ucweb/i.test(ua)) browser = 'UC浏览器';
  else if (/猎豹|liebao/i.test(ua)) browser = '猎豹浏览器';
  else if (/夸克|quark/i.test(ua)) browser = '夸克';
  else if (/chrome\/(\d+)/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/baidu/i.test(ua)) browser = '百度';
  
  return { device, browser };
};

// 解析 IP 归属地
export const parseLocation = async (ip: string): Promise<string> => {
  if (!ip || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return '本地网络';
  }
  
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
    const data = await res.json();
    if (data.status === 'success') {
      return `${data.city || ''}${data.regionName ? ' ' + data.regionName : ''}`.trim() || '未知';
    }
    return '未知';
  } catch {
    return '未知';
  }
};

// 格式化统计数字
export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};
