// 共享类型定义

export interface Product {
  id: string;
  sku: string;
  name: string;
  tags: string[];
  description: string;
  category: string;
  categoryId: string;
  coverImage: string;
  images: string[];
  videos: { url: string; thumbnail: string }[];
  featured: string | null;
  location: string;
  hidden?: boolean;
  sortOrder?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface VisitorPassword {
  id: string;
  password: string;
  description: string;
  created_at: string;
}
