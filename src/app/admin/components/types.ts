// 产品类型
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  category_id?: string;
  category_name?: string;
  coverImage?: string;
  cover_image?: string;
  images?: string[];
  videos?: string[];
  tags?: string[];
  featured?: string | null;
  featuredRightBottom?: string | null;
  location?: string;
  hidden?: boolean;
  sortOrder?: number;
  sort_order?: number;
  updated_at?: string;
  notes?: string;
}

// 标签类型
export interface Tag {
  id: string;
  name: string;
  sort_order: number;
  type?: string;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
}

// 精选标签类型
export interface FeaturedOption {
  id: string;
  name: string;
  type?: string;
}

// 随机排序规则类型
export interface RandomSortRule {
  id: number;
  from: number;
  to: number;
  createdAt: string;
}

// 站点设置类型
export interface SiteSetting {
  id?: string;
  key: string;
  value: string;
}

// 存储文件类型
export interface StorageFile {
  name: string;
  bucket: string;
  size: number;
  url: string;
}

// 存储统计类型
export interface StorageStats {
  images: number;
  imageSize: number;
  videos: number;
  videoSize: number;
  totalSize: number;
  orphanedCount: number;
  orphanedSize: number;
}

// 孤立文件类型
export interface OrphanedFile {
  name: string;
  bucket: string;
  size: number;
}

// 访问记录类型
export interface AccessLog {
  id: string;
  password_used: string;
  ip: string;
  location: string;
  device: string;
  browser: string;
  visited_at: string;
}

// 访问统计类型
export interface AnalyticsStats {
  todayVisits: number;
  yesterdayVisits: number;
  totalVisits: number;
  uniqueVisitors: number;
  recentLogs: AccessLog[];
  passwordStats: Record<string, number>;
  deviceStats: Record<string, number>;
  browserStats: Record<string, number>;
}

// 组件 Props 类型
export interface ProductsProps {
  products: Product[];
  categories: Category[];
  tags: Tag[];
  siteSettings: SiteSetting[];
  onRefresh: () => void;
}

export interface TagsProps {
  tags: Tag[];
  categories: Category[];
  siteSettings: SiteSetting[];
  onRefresh: () => void;
}

export interface SettingsProps {
  siteSettings: SiteSetting[];
  visitorPasswords: string[];
  adminPasswords: string[];
  onRefresh: () => void;
}

export interface BackupProps {
  onBackup: () => void;
  onRestore: (data: any) => void;
}
