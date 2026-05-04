import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const sessionId = formData.get('sessionId') as string || 'default';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${sessionId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      urls.push(urlData.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
