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
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}
