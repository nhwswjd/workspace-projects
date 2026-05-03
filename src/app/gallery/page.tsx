import { Suspense } from 'react';
import { getAllProducts, getCategories } from '@/lib/db';
import GalleryClient from './GalleryClient';

// 确保每次请求都重新渲染，不会被静态缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GalleryPage() {
  // 获取公开产品（不包括隐藏的）
  const allCategories = await getCategories();
  const allProducts = await getAllProducts(false);

  return (
    <Suspense fallback={<div className="p-8 text-center">加载中...</div>}>
      <GalleryClient 
        initialCategories={allCategories}
        initialProducts={allProducts}
        brandInfo={null}
      />
    </Suspense>
  );
}
