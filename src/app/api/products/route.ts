import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, getSupabaseAdmin } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get('includeHidden') === 'true';
    
    const products = await getAllProducts(includeHidden);
    
    return NextResponse.json({
      success: true,
      products
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
