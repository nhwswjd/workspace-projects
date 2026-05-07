import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';
import { verifyAdminSession } from '@/lib/api-auth';

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
    // 验证管理员会话
    const auth = await verifyAdminSession(request);
    console.log('[PUT /api/products/[id]] auth check:', { 
      valid: auth.valid, 
      isSuperAdmin: auth.isSuperAdmin,
      hasToken: !!request.headers.get('x-admin-session'),
      token: request.headers.get('x-admin-session')?.substring(0, 20) + '...'
    });
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: '未授权访问，请先登录' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 });
    }
    const { id } = await params;
    const body = await request.json();
    const { sku, name, tags, description, category, categoryId, coverImage, images, videos, featured, featuredRightBottom, featured_right_bottom, location, hidden, sortOrder, sort_order, notes } = body;

    // 分离 id 和其他数据
    const productData: Record<string, unknown> = {};
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
    else if (sort_order !== undefined) productData.sort_order = sort_order;
    if (notes !== undefined) productData.notes = notes;

    console.log('Featured field values:', { featured, featuredRightBottom, featured_right_bottom });
    console.log('Product data to update:', productData);

    // 使用 update 操作更新现有记录
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ success: false, message: '更新产品失败: ' + error.message }, { status: 500 });
    }
    
    console.log('Update result:', data, 'Product data:', productData);
    
    // 验证更新是否成功
    if (data) {
      const { data: verifyData } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      console.log('Verify after update:', verifyData);
    }

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
    // 验证管理员会话
    const auth = await verifyAdminSession(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: '未授权访问，请先登录' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 });
    }
    const { id } = await params;
    
    // 先获取产品数据，获取所有图片和视频文件名
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('cover_image, images, videos')
      .eq('id', id)
      .single();
    
    // 收集所有需要删除的文件
    const filesToDelete: { name: string; bucket: string }[] = [];
    
    // 判断URL属于哪个bucket
    const getBucket = (url: string): string => {
      if (url.includes('/product-videos/')) return 'product-videos';
      if (url.includes('/product-images/')) return 'product-images';
      return 'product-images'; // 默认
    };
    
    if (product) {
      // 封面图
      if (product.cover_image) {
        const fileName = product.cover_image.split('/').pop();
        if (fileName) filesToDelete.push({ name: fileName, bucket: getBucket(product.cover_image) });
      }
      // 图片数组
      if (product.images && Array.isArray(product.images)) {
        for (const img of product.images) {
          let url = '';
          if (typeof img === 'string') {
            url = img;
          } else if (img && typeof img === 'object') {
            url = (img as { url?: string }).url || '';
          }
          if (url) {
            const fileName = url.split('/').pop();
            if (fileName) filesToDelete.push({ name: fileName, bucket: getBucket(url) });
          }
        }
      }
      // 视频数组 - 处理多种格式
      if (product.videos && Array.isArray(product.videos)) {
        for (const vid of product.videos) {
          let url = '';
          if (typeof vid === 'string') {
            url = vid;
          } else if (vid && typeof vid === 'object') {
            // 处理 {url: "...", thumbnail: "..."} 格式
            url = (vid as { url?: string }).url || '';
          }
          if (url) {
            const fileName = url.split('/').pop();
            if (fileName) filesToDelete.push({ name: fileName, bucket: getBucket(url) });
          }
        }
      }
    }
    
    console.log('[删除产品] 准备删除文件:', JSON.stringify(filesToDelete));
    
    // 删除存储文件
    for (const file of filesToDelete) {
      try {
        const { error } = await supabaseAdmin.storage.from(file.bucket).remove([file.name]);
        if (error) {
          console.error(`删除文件失败: ${file.bucket}/${file.name}`, error);
        } else {
          console.log(`删除成功: ${file.bucket}/${file.name}`);
        }
      } catch (err) {
        console.error(`删除文件异常: ${file.name}`, err);
      }
    }
    
    // 删除数据库记录
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '产品删除成功', deletedFiles: filesToDelete.length });
  } catch (error) {
    console.error('删除产品失败:', error);
    return NextResponse.json({ success: false, message: '删除产品失败' }, { status: 500 });
  }
}
