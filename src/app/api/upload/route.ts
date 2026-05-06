import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyAdminSession } from '@/lib/api-auth';

// 允许的文件类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// 文件大小限制
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

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

    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, message: 'Storage not configured' }, { status: 500 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ success: false, message: '未选择文件' }, { status: 400 });
    }

    // 验证文件类型参数
    if (!type || !['images', 'videos'].includes(type)) {
      return NextResponse.json({ success: false, message: '无效的文件类型' }, { status: 400 });
    }

    // 验证文件 MIME 类型
    const fileMimeType = file.type.toLowerCase();
    if (type === 'images' && !ALLOWED_IMAGE_TYPES.includes(fileMimeType)) {
      return NextResponse.json({ 
        success: false, 
        message: '不支持的图片格式，仅支持 JPEG、PNG、GIF、WebP' 
      }, { status: 400 });
    }
    if (type === 'videos' && !ALLOWED_VIDEO_TYPES.includes(fileMimeType)) {
      return NextResponse.json({ 
        success: false, 
        message: '不支持的视频格式，仅支持 MP4、WebM、MOV' 
      }, { status: 400 });
    }

    // 验证文件大小
    const maxSize = type === 'images' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json({ 
        success: false, 
        message: `文件大小不能超过 ${maxSizeMB}MB` 
      }, { status: 400 });
    }

    // 验证文件扩展名与 MIME 类型一致
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const extToMime: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime'
    };
    
    if (extToMime[ext] && extToMime[ext] !== fileMimeType) {
      return NextResponse.json({ 
        success: false, 
        message: '文件扩展名与实际格式不符' 
      }, { status: 400 });
    }

    const bucketId = 'product-images';
    const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = safeFileName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(filePath, buffer, {
        contentType: fileMimeType,
        upsert: true,
      });

    if (error) {
      console.error('[Upload] 上传失败:', error);
      return NextResponse.json({ success: false, message: `上传失败: ${error.message}` }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucketId).getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      fileName: file.name,
      size: file.size,
      type: fileMimeType,
    });
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
  }
}
