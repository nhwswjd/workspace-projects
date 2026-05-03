import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, message: 'Storage not configured' }, { status: 500 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'images' or 'videos'

    if (!file) {
      return NextResponse.json({ success: false, message: '未选择文件' }, { status: 400 });
    }

    if (!type || !['images', 'videos'].includes(type)) {
      return NextResponse.json({ success: false, message: '无效的文件类型' }, { status: 400 });
    }

    // 统一使用 product-images bucket，视频和图片都存在这里
    const bucketId = 'product-images';
    
    // 生成唯一文件名
    const ext = file.name.split('.').pop() || '';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = `${fileName}`;

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('[Upload] 上传失败:', error);
      return NextResponse.json({ success: false, message: `上传失败: ${error.message}` }, { status: 500 });
    }

    console.log('[Upload] 上传成功:', filePath);

    // 获取公开URL
    const { data: urlData } = supabase.storage.from(bucketId).getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
  }
}
