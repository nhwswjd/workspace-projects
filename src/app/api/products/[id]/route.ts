import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('获取产品失败:', error);
    return NextResponse.json({ success: false, message: '获取产品失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sku, name, tags, description, category, categoryId, coverImage, images, featured, location } = body;

    const productData = {
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
      .update(productData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '产品更新成功' });
  } catch (error) {
    console.error('更新产品失败:', error);
    return NextResponse.json({ success: false, message: '更新产品失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '产品删除成功' });
  } catch (error) {
    console.error('删除产品失败:', error);
    return NextResponse.json({ success: false, message: '删除产品失败' }, { status: 500 });
  }
}
