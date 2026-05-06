import GalleryClient from './GalleryClient';

// 移除服务端数据获取，改为客户端渲染
// 原因：避免未验证用户时预取泄露产品数据

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function GalleryPage() {
  return <GalleryClient />;
}
