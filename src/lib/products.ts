import { Product, Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'living',
    name: '家居生活',
    description: '以东方禅意美学为灵感，甄选天然材质打造的家居精品',
    icon: '🏠',
  },
  {
    id: 'design',
    name: '现代设计',
    description: '源自斯堪的纳维亚半岛的设计哲学，功能与美感的完美平衡',
    icon: '🪑',
  },
  {
    id: 'craft',
    name: '手工艺术',
    description: '由资深工匠手工打造的限量作品，传承百年工艺精髓',
    icon: '🎨',
  },
  {
    id: 'fashion',
    name: '时尚配饰',
    description: '融合传统工艺与现代审美的精致配饰系列',
    icon: '👜',
  },
  {
    id: 'outdoor',
    name: '户外休闲',
    description: '探索自然，享受户外生活的品质装备',
    icon: '⛺',
  },
  {
    id: 'digital',
    name: '数码科技',
    description: '科技与美学的融合，为生活注入智能体验',
    icon: '📱',
  },
];

export const products: Product[] = [
  // 家居生活
  {
    id: 'serene-sofa',
    name: 'Zen 禅意沙发',
    description: '以东方禅意美学为灵感，甄选天然材质打造的家居精品。',
    category: '家居生活',
    categoryId: 'living',
    coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      'https://images.unsplash.com/photo-1551298370-9d3d53f7ed34?w=800&q=80',
    ],
    videos: [
      {
        id: 'v1',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        poster: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
        duration: '0:45',
      },
    ],
  },
  {
    id: 'wooden-table',
    name: '实木餐桌系列',
    description: '选用北美黑胡桃木，保留天然纹理与温润触感。',
    category: '家居生活',
    categoryId: 'living',
    coverImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
      'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=800&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
    ],
    videos: [],
  },
  {
    id: 'lamp-series',
    name: '光影落地灯',
    description: '手工黄铜灯罩，柔和光线营造温馨氛围。',
    category: '家居生活',
    categoryId: 'living',
    coverImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    videos: [],
  },

  // 现代设计
  {
    id: 'nordic-chair',
    name: 'Nordic 北欧椅',
    description: '源自斯堪的纳维亚半岛的设计哲学，简洁线条与自然色调。',
    category: '现代设计',
    categoryId: 'design',
    coverImage: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
    ],
    videos: [
      {
        id: 'v2',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        poster: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
        duration: '1:12',
      },
    ],
  },
  {
    id: 'minimal-shelf',
    name: '极简书架',
    description: '模块化设计，灵活组合，诠释少即是多的美学。',
    category: '现代设计',
    categoryId: 'design',
    coverImage: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
    ],
    videos: [],
  },
  {
    id: 'modern-clock',
    name: '艺术挂钟',
    description: '极简表盘设计，时间即艺术。',
    category: '现代设计',
    categoryId: 'design',
    coverImage: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
    ],
    videos: [],
  },

  // 手工艺术
  {
    id: 'artisan-pottery',
    name: '手作陶艺系列',
    description: '由资深工匠手工打造的限量作品，传承百年工艺精髓。',
    category: '手工艺术',
    categoryId: 'craft',
    coverImage: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80',
    ],
    videos: [
      {
        id: 'v3',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        poster: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
        duration: '2:30',
      },
    ],
  },
  {
    id: 'leather-goods',
    name: '手工皮具',
    description: '意大利头层牛皮，老工匠精心缝制。',
    category: '手工艺术',
    categoryId: 'craft',
    coverImage: 'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=800&q=80',
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    videos: [],
  },
  {
    id: 'woven-basket',
    name: '编织收纳篮',
    description: '天然藤条手工编织，环保与艺术的结合。',
    category: '手工艺术',
    categoryId: 'craft',
    coverImage: 'https://images.unsplash.com/photo-1591197172062-c3f976c7c9b5?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1591197172062-c3f976c7c9b5?w=800&q=80',
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
      'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=800&q=80',
    ],
    videos: [],
  },

  // 时尚配饰
  {
    id: 'designer-bag',
    name: '设计师手袋',
    description: '融合传统工艺与现代审美的精致配饰系列。',
    category: '时尚配饰',
    categoryId: 'fashion',
    coverImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80',
      'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=800&q=80',
    ],
    videos: [],
  },
  {
    id: 'silk-scarf',
    name: '真丝丝巾',
    description: '100%桑蚕丝，手工卷边，Art Deco风格图案。',
    category: '时尚配饰',
    categoryId: 'fashion',
    coverImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80',
    ],
    videos: [],
  },
  {
    id: 'gold-jewelry',
    name: '极简金饰',
    description: '18K黄金打造，简约而不简单的永恒之美。',
    category: '时尚配饰',
    categoryId: 'fashion',
    coverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    ],
    videos: [],
  },

  // 户外休闲
  {
    id: 'camping-gear',
    name: '露营装备套装',
    description: '探索自然，享受户外生活的品质装备。',
    category: '户外休闲',
    categoryId: 'outdoor',
    coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=800&q=80',
      'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800&q=80',
      'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    ],
    videos: [],
  },
  {
    id: 'hiking-backpack',
    name: '徒步背包',
    description: '人体工学设计，轻量化材质，长途跋涉的最佳伴侣。',
    category: '户外休闲',
    categoryId: 'outdoor',
    coverImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=800&q=80',
      'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800&q=80',
    ],
    videos: [],
  },
  {
    id: 'outdoor-lamp',
    name: '户外便携灯',
    description: 'IP67防水，USB充电，温暖光芒伴随每一个夜晚。',
    category: '户外休闲',
    categoryId: 'outdoor',
    coverImage: 'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=800&q=80',
    ],
    videos: [],
  },

  // 数码科技
  {
    id: 'wireless-earphones',
    name: '无线蓝牙耳机',
    description: '科技与美学的融合，为生活注入智能体验。',
    category: '数码科技',
    categoryId: 'digital',
    coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    ],
    videos: [],
  },
  {
    id: 'smart-speaker',
    name: '智能音响',
    description: '360度环绕音效，语音控制的智能家居中枢。',
    category: '数码科技',
    categoryId: 'digital',
    coverImage: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    ],
    videos: [],
  },
  {
    id: 'tablet-stand',
    name: '平板支架',
    description: '航空级铝合金，多角度调节，桌面美学新选择。',
    category: '数码科技',
    categoryId: 'digital',
    coverImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    ],
    videos: [],
  },
];

export const brandInfo = {
  name: 'ATELIER',
  tagline: 'Crafting Moments, Curating Life',
  description: 'ATELIER 是一个致力于发现与呈现美好生活方式的品牌。我们相信，真正的品质不在于奢华，而在于对细节的极致追求与对生活的深刻理解。每一件产品都是我们与全球优秀设计师、工匠合作的结晶，旨在为您的生活空间带来独特的美学体验与情感共鸣。',
  contact: {
    email: 'hello@atelier-design.com',
    address: '上海市静安区余姚路 123 号',
  },
};

// 密码映射表（支持多密码）
export const validPasswords = [
  'atelier2024',    // 通用密码
  'living2024',      // 家居生活分类密码
  'design2024',      // 现代设计分类密码
  'craft2024',       // 手工艺术分类密码
  'fashion2024',     // 时尚配饰分类密码
  'outdoor2024',     // 户外休闲分类密码
  'digital2024',     // 数码科技分类密码
];

// 获取密码对应的分类权限
export function getCategoryForPassword(password: string): string | null {
  const passwordMap: Record<string, string> = {
    'living2024': 'living',
    'design2024': 'design',
    'craft2024': 'craft',
    'fashion2024': 'fashion',
    'outdoor2024': 'outdoor',
    'digital2024': 'digital',
  };
  return passwordMap[password] || null;
}
