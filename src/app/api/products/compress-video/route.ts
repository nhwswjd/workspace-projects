import { createClient, getSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { productId, videoUrl } = await request.json()
    
    if (!productId) {
      return NextResponse.json({ error: '缺少产品ID' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    // 如果没有传videoUrl，自动获取产品的第一个视频
    let targetVideoUrl = videoUrl
    if (!targetVideoUrl) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('videos')
        .eq('id', productId)
        .single()
      
      if (productError || !product) {
        return NextResponse.json({ error: '产品不存在' }, { status: 404 })
      }
      
      const videos = product.videos || []
      if (videos.length === 0) {
        return NextResponse.json({ error: '该产品没有视频' }, { status: 400 })
      }
      
      // 获取第一个视频的URL
      const firstVideo = videos[0]
      targetVideoUrl = typeof firstVideo === 'string' ? firstVideo : firstVideo.url
      if (!targetVideoUrl) {
        return NextResponse.json({ error: '无法获取视频URL' }, { status: 400 })
      }
    }
    
    // 1. 获取原始视频
    const videoResponse = await fetch(targetVideoUrl)
    if (!videoResponse.ok) {
      return NextResponse.json({ error: '无法获取视频文件' }, { status: 400 })
    }
    const videoBlob = await videoResponse.blob()
    
    // 2. 使用 ffmpeg.wasm 压缩视频并提取封面
    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util')
    
    const ffmpeg = new FFmpeg()
    
    // 加载 ffmpeg
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    
    // 写入原始视频
    const videoFileName = 'input.mp4'
    await ffmpeg.writeFile(videoFileName, await fetchFile(videoBlob))
    
    // 3. 压缩视频 (降低分辨率和比特率)
    await ffmpeg.exec([
      '-i', videoFileName,
      '-c:v', 'libx264',
      '-crf', '28',           // 质量控制，值越大文件越小
      '-preset', 'fast',      // 编码速度
      '-c:a', 'aac',
      '-b:a', '128k',
      '-vf', 'scale=-2:720', // 限制高度为720p
      '-movflags', '+faststart',
      'output.mp4'
    ])
    
    // 4. 提取第一帧作为封面
    await ffmpeg.exec([
      '-i', videoFileName,
      '-ss', '00:00:01',      // 第1秒
      '-frames:v', '1',
      '-q:v', '2',
      'thumbnail.jpg'
    ])
    
    // 5. 读取压缩后的视频和封面
    const compressedVideoData = await ffmpeg.readFile('output.mp4')
    const thumbnailData = await ffmpeg.readFile('thumbnail.jpg')
    
    // 6. 上传到 Storage
    const timestamp = Date.now()
    const videoFileNameStorage = `${timestamp}-compressed.mp4`
    const thumbnailFileName = `${timestamp}-thumbnail.jpg`
    
    // 上传压缩后的视频
    const { data: videoData, error: videoError } = await supabase.storage
      .from('product-videos')
      .upload(videoFileNameStorage, compressedVideoData, {
        contentType: 'video/mp4',
        upsert: true
      })
    
    if (videoError) {
      return NextResponse.json({ error: '上传压缩视频失败' }, { status: 500 })
    }
    
    // 上传封面图
    const { data: thumbnailDataResult, error: thumbnailError } = await supabase.storage
      .from('product-images')
      .upload(thumbnailFileName, thumbnailData, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (thumbnailError) {
      // 即使封面上传失败，视频还是要保留
      console.error('封面上传失败:', thumbnailError)
    }
    
    // 7. 获取新文件的公开URL
    const { data: videoPublicUrl } = supabase.storage
      .from('product-videos')
      .getPublicUrl(videoFileNameStorage)
    
    let thumbnailPublicUrl = ''
    if (!thumbnailError) {
      const { data: thumbPublicUrl } = supabase.storage
        .from('product-images')
        .getPublicUrl(thumbnailFileName)
      thumbnailPublicUrl = thumbPublicUrl?.publicUrl || ''
    }
    
    // 8. 从 Storage 删除原视频
    const oldFileName = targetVideoUrl.split('/').pop()
    if (oldFileName) {
      await supabase.storage
        .from('product-videos')
        .remove([oldFileName])
    }
    
    // 9. 获取当前产品数据
    const { data: product } = await supabase
      .from('products')
      .select('videos')
      .eq('id', productId)
      .single()
    
    if (!product) {
      return NextResponse.json({ error: '产品不存在' }, { status: 404 })
    }
    
    // 10. 更新产品的视频数组
    const videos = product.videos || []
    const videoIndex = videos.findIndex((v: any) => 
      (typeof v === 'string' ? v : v.url) === targetVideoUrl
    )
    
    if (videoIndex !== -1) {
      videos[videoIndex] = {
        url: videoPublicUrl.publicUrl,
        thumbnail: thumbnailPublicUrl
      }
    }
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ videos })
      .eq('id', productId)
    
    if (updateError) {
      return NextResponse.json({ error: '更新产品失败' }, { status: 500 })
    }
    
    // 清理 ffmpeg 内存
    await ffmpeg.deleteFile('input.mp4')
    await ffmpeg.deleteFile('output.mp4')
    await ffmpeg.deleteFile('thumbnail.jpg')
    
    return NextResponse.json({
      success: true,
      compressedUrl: videoPublicUrl.publicUrl,
      thumbnailUrl: thumbnailPublicUrl,
      message: thumbnailPublicUrl ? '视频压缩成功并已生成封面' : '视频压缩成功（封面生成失败）'
    })
    
  } catch (error) {
    console.error('压缩视频失败:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : '压缩失败'
    }, { status: 500 })
  }
}
