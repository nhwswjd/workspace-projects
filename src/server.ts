import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import multer from 'multer';
import path from 'path';
import { getSupabaseClient } from './storage/database/supabase-client';

const dev = process.env.COZE_PROJECT_ENV !== 'PROD';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '5000', 10);

// Create Next.js app
const app = next({ 
  dev, 
  hostname, 
  port,
  conf: {
    api: {
      bodyParser: {
        sizeLimit: '50mb',
      },
    },
  } as any,
});
const handle = app.getRequestHandler();

// 配置multer用于大文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
});

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    // ffmpeg.wasm 需要这些 headers 支持 SharedArrayBuffer
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    
    try {
      const parsedUrl = parse(req.url!, true);
    
      // 大文件上传端点 - 直接处理，绕过Next.js限制
      if (parsedUrl.pathname === '/api/upload-large' && req.method === 'POST') {
        upload.single('file')(req as any, res as any, async (err) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '上传失败: ' + err.message }));
            return;
          }
          
          const file = (req as any).file;
          if (!file) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '没有文件' }));
            return;
          }
          
          try {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
            const supabase = getSupabaseClient();
            
            if (!supabase) {
              throw new Error('无法创建Supabase客户端');
            }
            
            const { data, error } = await supabase.storage
              .from('product-images')
              .upload(fileName, file.buffer, { contentType: file.mimetype });
            
            if (error) throw error;
            
            const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              url: urlData.publicUrl,
              path: fileName,
              fileName: file.originalname,
              size: file.size
            }));
          } catch (error: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '上传失败: ' + (error.message || '未知错误') }));
          }
        });
        return;
      }
    
      // 其他请求由Next.js处理
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });
  
  server.once('error', err => {
    console.error(err);
    process.exit(1);
  });
  
  server.listen(port, () => {
    console.log(
      `> Server listening at http://${hostname}:${port} as ${
        dev ? 'development' : process.env.COZE_PROJECT_ENV
      }`,
    );
  });
});
