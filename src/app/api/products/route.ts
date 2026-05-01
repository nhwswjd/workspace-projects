import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, supabaseAdmin } from '@/lib/db';
import { products as fallbackProducts } from '@/lib/products';

export async function GET() {
  try {
    const products = await getAllProducts();
    
    return NextResponse.json({
      success: true,
      products: products || fallbackProducts
    });
  } catch (error) {
    console.error('获取产品失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '获取产品失败',
      products: fallbackProducts 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, sku, name, tags, description, category, categoryId, coverImage, images, featured, location } = body;

    const productData = {
      id,
      sku,
      name,
      tags,
      description,
      category,
      category_id: categoryId,
      cover_image: coverImage,
      images,
      featured,
      location
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
