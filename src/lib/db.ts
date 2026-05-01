import { getSupabaseClient } from '@/storage/database/supabase-client';
import { products as staticProducts, categories as staticCategories } from './products';
import type { Product, Category } from '@/types';

// 导出 supabaseAdmin 供 API 路由使用
export const supabaseAdmin = getSupabaseClient();

// 静态数据导出（作为后备）
export const products = staticProducts as Product[];
export const categories = staticCategories as Category[];

// 数据库查询函数
export async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((p: Record<string, unknown>) => ({
      id: p.id as string,
      sku: p.sku as string,
      name: p.name as string,
      tags: (p.tags as string[]) || [],
      description: (p.description as string) || '',
      category: p.category as string,
      categoryId: p.category_id as string,
      coverImage: p.cover_image as string,
      images: (p.images as string[]) || [],
      videos: (p.videos as { url: string; thumbnail: string }[]) || [],
      featured: (p.featured as '精选产品' | '优选产品' | null) || null,
      location: (p.location as string) || '',
    })) as unknown as Product[];
  } catch {
    // 如果数据库查询失败，返回静态数据
    return staticProducts as Product[];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    return data.map((c: Record<string, unknown>) => ({
      id: c.id as string,
      name: c.name as string,
      description: (c.description as string) || '',
    })) as Category[];
  } catch {
    return staticCategories as Category[];
  }
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((p: Record<string, unknown>) => ({
      id: p.id as string,
      sku: p.sku as string,
      name: p.name as string,
      tags: (p.tags as string[]) || [],
      description: (p.description as string) || '',
      category: p.category as string,
      categoryId: p.category_id as string,
      coverImage: p.cover_image as string,
      images: (p.images as string[]) || [],
      videos: (p.videos as { url: string; thumbnail: string }[]) || [],
      featured: (p.featured as '精选产品' | '优选产品' | null) || null,
      location: (p.location as string) || '',
    })) as unknown as Product[];
  } catch {
    return (staticProducts.filter(p => p.categoryId === categoryId)) as Product[];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id as string,
      sku: data.sku as string,
      name: data.name as string,
      tags: (data.tags as string[]) || [],
      description: (data.description as string) || '',
      category: data.category as string,
      categoryId: data.category_id as string,
      coverImage: data.cover_image as string,
      images: (data.images as string[]) || [],
      videos: (data.videos as { url: string; thumbnail: string }[]) || [],
      featured: (data.featured as '精选产品' | '优选产品' | null) || null,
      location: (data.location as string) || '',
    } as unknown as Product;
  } catch {
    return (staticProducts.find(p => p.id === id) as Product) || null;
  }
}

export { getAllCategories } from './products';
