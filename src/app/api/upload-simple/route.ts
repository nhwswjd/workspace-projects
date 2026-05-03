import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 获取Supabase凭证
function getSupabaseCredentials() {
  const COZE_SUPABASE_URL = process.env.COZE_SUPABASE_URL || '';
  const COZE_SUPABASE_SERVICE_KEY = process.env.COZE_SUPABASE_SERVICE_KEY || '';
  
  const url = COZE_SUPABASE_URL.startsWith('http') 
    ? COZE_SUPABASE_URL 
    : `https://${COZE_SUPABASE_URL}`;
  const key = COZE_SUPABASE_SERVICE_KEY;
  
  return { url, key };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, message: '没有文件' }, { status: 400 });
    }

    const { url: supabaseUrl, key: supabaseKey } = getSupabaseCredentials();
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${timestamp}-${randomStr}.${ext}`;
    
    // 确定bucket
    const isVideo = file.type.startsWith('video/');
    const bucket = isVideo ? 'product-images' : 'product-images';
    
    // 直接上传到Supabase Storage
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('[视频上传] Supabase错误:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // 获取公开URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: fileName,
      fileName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error: any) {
    console.error('[视频上传] 错误:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
