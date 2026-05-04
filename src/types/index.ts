export interface Video {
  id: string;
  url: string;
  poster: string;
  duration?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  tags: string[];
  coverImage: string;
  images: string[];
  videos: Video[];
  featured?: '右上' | '新品' | '热销' | '特惠' | '推荐' | '爆款' | null;
  featuredRightBottom?: '右下' | '新品' | '热销' | '特惠' | '推荐' | '爆款' | null;
  location?: string;
  hidden?: boolean;
  sortOrder?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}
