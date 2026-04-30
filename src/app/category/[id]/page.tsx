import { notFound } from 'next/navigation';
import { products, categories } from '@/lib/db';
import CategoryClient from './CategoryClient';
import { Category, Product } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;
  
  // 查找分类（通过名称匹配，因为URL用的是分类名称）
  const category = categories.find(c => c.name === id);
  
  if (!category) {
    notFound();
  }
  
  // 获取该分类下的产品
  const categoryProducts = products.filter(p => p.category === category.name);
  
  return (
    <CategoryClient 
      category={category}
      products={categoryProducts}
      allCategories={categories}
    />
  );
}
