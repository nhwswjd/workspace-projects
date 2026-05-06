import { getSupabaseClient } from '@/storage/database/supabase-client';
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

// 导出 supabaseAdmin（向后兼容）
export const supabaseAdmin = null as SupabaseClient | null;

// 导出空数组（向后兼容）
export const products: Product[] = [];
export const categories: Category[] = [];

// ============ 私有：数据库行转产品对象 ============
interface ProductRow {
  id: string;
  sku: string;
  name: string;
  tags: string[];
  description: string;
  category: string;
  category_id: string;
  cover_image: string;
  images: unknown[];
  videos: unknown[];
  featured: '右上' | '新品' | '热销' | '特惠' | '推荐' | '爆款' | null;
  featured_right_bottom: '右下' | '新品' | '热销' | '特惠' | '推荐' | '爆款' | null;
  location: string;
  hidden: boolean;
  sort_order: number;
  notes?: string;
  [key: string]: unknown;
}

function transformProductRow(p: ProductRow): Product {
  // 处理 images 数组：兼容字符串和对象格式
  const images = Array.isArray(p.images)
    ? p.images.map((img: unknown) => {
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && img !== null && 'url' in img) {
          return (img as { url: string }).url;
        }
        return null;
      }).filter((url): url is string => url !== null)
    : [];

  // 处理 videos 数组：兼容字符串和对象格式
  const videos: Product['videos'] = Array.isArray(p.videos)
    ? p.videos.map((v: unknown, idx: number) => {
        if (typeof v === 'string') {
          return { id: `video-${idx}`, url: v, poster: '' };
        }
        if (typeof v === 'object' && v !== null && 'url' in v) {
          const videoObj = v as { url: string; thumbnail?: string };
          return { 
            id: `video-${idx}`, 
            url: videoObj.url, 
            poster: videoObj.thumbnail || '' 
          };
        }
        return null;
      }).filter((v): v is NonNullable<typeof v> => v !== null)
    : [];

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    tags: p.tags || [],
    description: p.description || '',
    category: p.category,
    categoryId: p.category_id,
    coverImage: p.cover_image,
    images,
    videos,
    featured: p.featured || null,
    featuredRightBottom: p.featured_right_bottom || null,
    location: p.location || '',
    hidden: p.hidden || false,
    sortOrder: p.sort_order || 0,
    notes: p.notes || '',
  };
}

// ============ 产品查询 ============
export async function getAllProducts(includeHidden = false): Promise<Product[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Database not available. Check environment variables.');
  }
  
  let query = supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false });
  
  if (!includeHidden) {
    query = query.or('hidden.eq.false,hidden.is.null');
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  if (!data) return [];
  
  return data.map(transformProductRow);
}

export async function getProductsByCategory(categoryId: string, includeHidden = false): Promise<Product[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Database not available. Check environment variables.');
  }
  
  let query = supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: true, nullsFirst: false });
  
  if (!includeHidden) {
    query = query.eq('hidden', false).or('hidden.is.null');
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  if (!data) return [];
  
  return data.map(transformProductRow);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Database not available. Check environment variables.');
  }
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  if (!data) return null;
  
  return transformProductRow(data as ProductRow);
}

// ============ 分类查询 ============
export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Database not available. Check environment variables.');
  }
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false });
  
  if (error) throw error;
  if (!data) return [];
  
  return data.map((c): Category => ({
    id: c.id as string,
    name: c.name as string,
    description: (c.description as string | null) || '',
    icon: (c.icon as string | null) || '',
  }));
}

// ============ 产品 CRUD ============
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
    featured_right_bottom: product.featuredRightBottom || null,
    location: product.location || '',
    hidden: product.hidden || false,
    sort_order: product.sortOrder || 0,
    notes: product.notes || '',
  };

  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) throw error;
  return transformProductRow(data as ProductRow);
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
  if (updates.featuredRightBottom !== undefined) updateData.featured_right_bottom = updates.featuredRightBottom;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.hidden !== undefined) updateData.hidden = updates.hidden;
  if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return transformProductRow(data as ProductRow);
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

// ============ 站点设置 ============
export async function getSiteSetting(key: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) return null;
  return data.value;
}

export async function updateSiteSetting(key: string, value: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) throw error;
}
