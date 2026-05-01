import { Suspense } from 'react';
import { getAllProducts, getCategories } from '@/lib/db';
import GalleryClient from './GalleryClient';

export default async function GalleryPage() {
  // 获取公开产品（不包括隐藏的）
  const allCategories = await getCategories();
  const allProducts = await getAllProducts(false);

  return (
    <Suspense fallback={<div className="p-8 text-center">加载中...</div>}>
      <GalleryClient 
        initialCategories={allCategories}
        initialProducts={allProducts}
      />
    </Suspense>
  );
}
