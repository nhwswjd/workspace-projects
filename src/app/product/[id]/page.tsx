import { notFound } from 'next/navigation';
import { getProductById, getCategories } from '@/lib/db';
import ProductClient from './ProductClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  
  const product = await getProductById(id);
  
  if (!product) {
    notFound();
  }
  
  const allCategories = await getCategories();
  
  return (
    <ProductClient 
      product={product}
      categories={allCategories}
    />
  );
}
