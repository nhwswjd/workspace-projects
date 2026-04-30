import { Suspense } from 'react';
import { products, categories } from '@/lib/db';
import GalleryClient from './GalleryClient';
import { Product, Category } from '@/types';

export default async function GalleryPage() {
  // 使用静态数据
  const allCategories: Category[] = categories;
  const allProducts: Product[] = products;

  return (
    <Suspense fallback={<div className="p-8 text-center">加载中...</div>}>
      <GalleryClient 
        initialCategories={allCategories}
        initialProducts={allProducts}
      />
    </Suspense>
  );
}
