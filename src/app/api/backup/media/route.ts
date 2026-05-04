import { getSupabaseClient } from '@/storage/database/supabase-client';
import JSZip from 'jszip';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return Response.json({ error: '数据库连接不可用' }, { status: 500 });
    }

    // 获取所有存储桶
    const buckets = ['products', 'covers'];

    const allFiles: { name: string; data: ArrayBuffer }[] = [];

    for (const bucket of buckets) {
      try {
        // 列出 bucket 中的所有文件
        const { data: files, error } = await supabase.storage.from(bucket).list('', {
          limit: 1000,
        });

        if (error) {
          console.error(`Error listing ${bucket}:`, error);
          continue;
        }

        if (files && files.length > 0) {
          for (const file of files) {
            if (file.name && !file.name.endsWith('/')) {
              // 下载文件
              const { data, error: downloadError } = await supabase.storage
                .from(bucket)
                .download(file.name);

              if (downloadError) {
                console.error(`Error downloading ${bucket}/${file.name}:`, downloadError);
                continue;
              }

              if (data) {
                const buffer = await data.arrayBuffer();
                allFiles.push({
                  name: `${bucket}/${file.name}`,
                  data: buffer,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error processing bucket ${bucket}:`, err);
      }
    }

    // 创建 zip 文件
    const zip = new JSZip();
    
    for (const file of allFiles) {
      zip.file(file.name, file.data);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // 返回 zip 文件
    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="media-backup-${new Date().toISOString().split('T')[0]}.zip"`,
      },
    });
  } catch (error) {
    console.error('Media backup error:', error);
    return Response.json({ error: '媒体文件备份失败' }, { status: 500 });
  }
}
