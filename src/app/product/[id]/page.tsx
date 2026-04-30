import { notFound } from 'next/navigation';
import { products, categories } from '@/lib/db';
import ProductClient from './ProductClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  
  const product = products.find(p => p.id === id);
  
  if (!product) {
    notFound();
  }
  
  return (
    <ProductClient 
      product={product}
      categories={categories}
    />
  );
}
