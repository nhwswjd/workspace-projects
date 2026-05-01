import { Product, Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'living',
    name: '家居生活',
    description: '以东方禅意美学为灵感，甄选天然材质打造的家居精品',
    icon: '',
  },
  {
    id: 'modern',
    name: '现代设计',
    description: '源自斯堪的纳维亚半岛的设计哲学，功能与美感的完美平衡',
    icon: '',
  },
  {
    id: 'outdoor',
    name: '户外用品',
    description: '探索自然，享受户外生活的品质装备',
    icon: '',
  },
  {
    id: 'kitchen',
    name: '厨房用具',
    description: '精选优质厨具，让烹饪成为一种享受',
    icon: '',
  },
  {
    id: 'tech',
    name: '科技数码',
    description: '科技与美学的融合，为生活注入智能体验',
    icon: '',
  },
  {
    id: 'decor',
    name: '装饰摆件',
    description: '装饰品和摆件，点亮生活空间',
    icon: '',
  },
];

export const products: Product[] = [];

// 访客密码
export const validPasswords = ['atelier2024'];

// 管理员密码
export const adminPassword = 'admin2024';

// 品牌信息
export const brandInfo = {
  name: 'ATELIER',
  tagline: 'Crafting Moments, Curating Life',
  description: 'ATELIER 是一个致力于发现与呈现美好生活方式的品牌。',
  contact: {
    email: 'contact@atelier.com',
    address: '上海市静安区某某路123号',
  },
};

// 获取所有分类的函数
export function getAllCategories(): Category[] {
  return categories;
}
