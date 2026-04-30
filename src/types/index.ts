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
  featured?: '优选产品' | '精选产品' | null;
  location?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}
