import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 });
    }
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
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 });
    }
    const { id } = await params;
    const body = await request.json();
    const { sku, name, tags, description, category, categoryId, coverImage, images, videos, featured, featuredRightBottom, featured_right_bottom, location, hidden, sortOrder, notes } = body;

    const productData: Record<string, unknown> = {
      id, // 确保ID被设置，用于 upsert
    };
    if (sku !== undefined) productData.sku = sku;
    if (name !== undefined) productData.name = name;
    if (tags !== undefined) productData.tags = tags;
    if (description !== undefined) productData.description = description;
    if (category !== undefined) productData.category = category;
    if (categoryId !== undefined) productData.category_id = categoryId;
    if (coverImage !== undefined) productData.cover_image = coverImage;
    if (images !== undefined) productData.images = images;
    if (videos !== undefined) productData.videos = videos;
    if (featured !== undefined) productData.featured = featured;
    if (featuredRightBottom !== undefined) productData.featured_right_bottom = featuredRightBottom;
    else if (featured_right_bottom !== undefined) productData.featured_right_bottom = featured_right_bottom;
    if (location !== undefined) productData.location = location;
    if (hidden !== undefined) productData.hidden = hidden;
    if (sortOrder !== undefined) productData.sort_order = sortOrder;
    if (notes !== undefined) productData.notes = notes;

    // 使用 upsert 确保无论产品是否已存在都能成功更新
    const { error } = await supabaseAdmin
      .from('products')
      .upsert(productData, { onConflict: 'id' });

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
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 });
    }
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
