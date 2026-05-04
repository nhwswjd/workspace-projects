import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// 配置最大文件大小限制（100MB）
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // 检查 Content-Length 头
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE * 10) {
      return NextResponse.json({ 
        error: '文件太大，请压缩后上传',
        code: 'FILE_TOO_LARGE'
      }, { status: 413 });
    }

    let files: File[] = [];
    let sessionId = 'default';

    try {
      const formData = await request.formData();
      files = formData.getAll('files') as File[];
      sessionId = formData.get('sessionId') as string || 'default';
    } catch (formDataError: any) {
      console.error('FormData parsing error:', formDataError);
      return NextResponse.json({ 
        error: '请求体解析失败，请检查文件大小',
        code: 'PARSE_ERROR',
        details: formDataError.message 
      }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    const urls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 检查单个文件大小
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`文件 ${file.name} 太大（${(file.size / 1024 / 1024).toFixed(2)}MB），超过 ${MAX_FILE_SIZE / 1024 / 1024}MB 限制`);
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${sessionId}/${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true
          });

        if (error) {
          console.error('Upload error:', error);
          errors.push(`文件 ${file.name} 上传失败: ${error.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        urls.push(urlData.publicUrl);
      } catch (uploadError: any) {
        console.error('Upload error:', uploadError);
        errors.push(`文件 ${file.name} 上传失败: ${uploadError.message}`);
      }
    }

    // 即使有部分文件失败，也返回成功的结果
    return NextResponse.json({ 
      urls,
      errors: errors.length > 0 ? errors : undefined,
      total: files.length,
      success: urls.length
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: '上传失败',
      code: 'UNKNOWN_ERROR',
      details: error?.message || '未知错误'
    }, { status: 500 });
  }
}

// 配置响应类型
export const runtime = 'nodejs';
export const maxDuration = 300; // 5分钟超时
