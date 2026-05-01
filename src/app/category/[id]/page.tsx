import { notFound } from 'next/navigation';
import { getCategories, getProductsByCategory } from '@/lib/db';
import CategoryClient from './CategoryClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;
  
  // 获取所有分类
  const allCategories = await getCategories();
  
  // 查找分类（通过ID匹配）
  const category = allCategories.find(c => c.id === id);
  
  if (!category) {
    notFound();
  }
  
  // 获取该分类下的公开产品
  const categoryProducts = await getProductsByCategory(id, false);
  
  return (
    <CategoryClient 
      category={category}
      products={categoryProducts}
      allCategories={allCategories}
    />
  );
}
