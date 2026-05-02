import { getSupabaseClient } from '@/storage/database/supabase-client';
import { products as staticProducts, categories as staticCategories } from './products';
import type { Product, Category } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// 延迟初始化 supabaseAdmin，避免构建时错误
let _supabaseAdmin: SupabaseClient | null = null;
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!_supabaseAdmin) {
    _supabaseAdmin = getSupabaseClient();
  }
  return _supabaseAdmin;
}

// 为了向后兼容，导出 supabaseAdmin（可能是 null）
export const supabaseAdmin = null as SupabaseClient | null;

// 静态数据导出（作为后备）
export const products = staticProducts as Product[];
export const categories = staticCategories as Category[];

// 数据库查询函数
export async function getAllProducts(includeHidden = false): Promise<Product[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return staticProducts as Product[];
    }
    
    let query = supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    
    // 如果不是管理员请求，只返回未隐藏的产品
    if (!includeHidden) {
      query = query.eq('hidden', false);
    }
    
    const { data, error } = await query;
    
    // 如果查询出错或数据库为空，返回静态数据
    if (error || !data || data.length === 0) {
      return staticProducts as Product[];
    }
    
    // 转换为Product格式
    const dbProducts = data.map((p: Record<string, unknown>) => ({
      id: p.id as string,
      sku: p.sku as string,
      name: p.name as string,
      tags: (p.tags as string[]) || [],
      description: (p.description as string) || '',
      category: p.category as string,
      categoryId: p.category_id as string,
      coverImage: p.cover_image as string,
      images: (p.images as string[]) || [],
      videos: ((p.videos as string[]) || []).map((url: string) => ({ url, thumbnail: '' })),
      featured: (p.featured as '精选产品' | '精选产品' | null) || null,
      location: (p.location as string) || '',
      hidden: (p.hidden as boolean) || false,
      sortOrder: (p.sort_order as number) || 0,
    })) as unknown as Product[];
    
    // 合并静态数据和数据库数据
    const dbProductIds = new Set(dbProducts.map(p => p.id));
    const staticProductsToAdd = staticProducts.filter(p => !dbProductIds.has(p.id));
    let mergedProducts = [...dbProducts, ...staticProductsToAdd];
    
    // 访客请求时过滤掉隐藏的产品
    if (!includeHidden) {
      mergedProducts = mergedProducts.filter(p => !p.hidden);
    }
    
    mergedProducts.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    return mergedProducts;
  } catch {
    return staticProducts as Product[];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return staticCategories as Category[];
    }
    
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

export async function getProductsByCategory(categoryId: string, includeHidden = false): Promise<Product[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const filtered = (staticProducts.filter(p => p.categoryId === categoryId) as Product[]);
      filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return filtered;
    }
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    
    if (!includeHidden) {
      query = query.eq('hidden', false).or('hidden.is.null');
    }
    
    let { data, error } = await query;
    
    if (error) throw error;
    
    const dbProducts = (data || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      sku: p.sku as string,
      name: p.name as string,
      tags: (p.tags as string[]) || [],
      description: (p.description as string) || '',
      category: p.category as string,
      categoryId: p.category_id as string,
      coverImage: p.cover_image as string,
      images: (p.images as string[]) || [],
      videos: ((p.videos as string[]) || []).map((url: string) => ({ url, thumbnail: '' })),
      featured: (p.featured as '精选产品' | '精选产品' | null) || null,
      location: (p.location as string) || '',
      hidden: (p.hidden as boolean) || false,
      sortOrder: (p.sort_order as number) || 0,
    })) as unknown as Product[];
    
    const staticFiltered = staticProducts.filter(p => p.categoryId === categoryId);
    const dbProductIds = new Set(dbProducts.map(p => p.id));
    const staticToAdd = staticFiltered.filter(p => !dbProductIds.has(p.id));
    let mergedProducts = [...dbProducts, ...staticToAdd];
    
    if (!includeHidden) {
      mergedProducts = mergedProducts.filter(p => !p.hidden);
    }
    
    mergedProducts.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    return mergedProducts;
  } catch {
    const filtered = (staticProducts.filter(p => p.categoryId === categoryId) as Product[]);
    filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return filtered;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return (staticProducts.find(p => p.id === id) as Product) || null;
    }
    
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
      videos: (() => {
        const rawVideos = data.videos as unknown[];
        if (!rawVideos || !Array.isArray(rawVideos)) return [];
        return rawVideos.map((v): { url: string; thumbnail: string } => {
          if (typeof v === 'string') return { url: v, thumbnail: '' };
          if (typeof v === 'object' && v !== null) {
            const obj = v as Record<string, unknown>;
            if (typeof obj.url === 'string') return { url: obj.url, thumbnail: (obj.thumbnail as string) || '' };
          }
          return { url: '', thumbnail: '' };
        }).filter(v => v.url);
      })(),
      featured: (data.featured as '精选产品' | '优选产品' | null) || null,
      location: (data.location as string) || '',
      hidden: (data.hidden as boolean) || false,
    } as unknown as Product;
  } catch {
    return (staticProducts.find(p => p.id === id) as Product) || null;
  }
}

// 产品 CRUD 操作
export async function createProduct(product: Partial<Product>): Promise<Product> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Database not available');
  }
  
  const productData = {
    id: product.id || `product-${Date.now()}`,
    sku: product.sku || '',
    name: product.name || '',
    tags: product.tags || [],
    description: product.description || '',
    category: product.category || '',
    category_id: product.categoryId || '',
    cover_image: product.coverImage || '',
    images: product.images || [],
    videos: product.videos || [],
    featured: product.featured || null,
    location: product.location || '',
    hidden: product.hidden || false,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Database not available');
  }
  
  const updateData: Record<string, unknown> = {};
  if (updates.sku !== undefined) updateData.sku = updates.sku;
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
  if (updates.coverImage !== undefined) updateData.cover_image = updates.coverImage;
  if (updates.images !== undefined) updateData.images = updates.images;
  if (updates.videos !== undefined) updateData.videos = updates.videos;
  if (updates.featured !== undefined) updateData.featured = updates.featured;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.hidden !== undefined) updateData.hidden = updates.hidden;
  if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

  let { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    const staticProduct = products.find(p => p.id === id);
    const baseProduct = data || staticProduct;
    
    if (!baseProduct) {
      throw new Error(`Product ${id} not found`);
    }

    const insertData = {
      id: baseProduct.id,
      sku: updateData.sku ?? baseProduct.sku,
      name: updateData.name ?? baseProduct.name,
      tags: updateData.tags ?? baseProduct.tags,
      description: updateData.description ?? baseProduct.description,
      category: updateData.category ?? baseProduct.category,
      category_id: updateData.category_id ?? baseProduct.categoryId,
      cover_image: updateData.cover_image ?? baseProduct.coverImage,
      images: updateData.images ?? baseProduct.images,
      videos: updateData.videos ?? baseProduct.videos,
      featured: updateData.featured ?? baseProduct.featured,
      location: updateData.location ?? baseProduct.location,
      hidden: updateData.hidden ?? baseProduct.hidden,
      sort_order: updateData.sort_order ?? baseProduct.sortOrder ?? 0,
    };

    const { data: insertDataResult, error: insertError } = await supabase
      .from('products')
      .upsert(insertData, { onConflict: 'id' })
      .select()
      .single();

    if (insertError) throw insertError;
    return insertDataResult as unknown as Product;
  }

  return data as unknown as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Database not available');
  }
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export { getAllCategories } from './products';
