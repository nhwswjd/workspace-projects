import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, getSupabaseAdmin } from '@/lib/db';
import { verifyAdminSession, checkRateLimit, getClientIp } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    // 应用速率限制
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: '请求过于频繁，请稍后再试' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get('includeHidden') === 'true';
    
    const products = await getAllProducts(includeHidden);
    
    return NextResponse.json({
      success: true,
      products
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('获取产品失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '获取产品失败',
      products: [] 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员会话
    const auth = await verifyAdminSession(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: '未授权访问，请先登录' },
        { status: 401 }
      );
    }

    // 应用速率限制
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: '请求过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 });
    }
    const body = await request.json();
    const { 
      id, sku, name, tags, description, category, categoryId, 
      coverImage, images, videos, featured, location, hidden, sortOrder, notes 
    } = body;

    const productData = {
      id: id || `product-${Date.now()}`,
      sku: sku || '',
      name: name || '',
      tags: tags || [],
      description: description || '',
      category: category || '',
      category_id: categoryId || '',
      cover_image: coverImage || '',
      images: images || [],
      videos: videos || [],
      featured: featured || null,
      location: location || '',
      hidden: hidden || false,
      sort_order: sortOrder || 0,
      notes: notes || null,
    };

    const { error } = await supabaseAdmin
      .from('products')
      .insert(productData);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '产品创建成功' });
  } catch (error) {
    console.error('创建产品失败:', error);
    return NextResponse.json({ success: false, message: '创建产品失败' }, { status: 500 });
  }
}
