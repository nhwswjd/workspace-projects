import { Product } from '@/types';

export const products: Product[] = [
  {
    id: 'serene-collection',
    name: 'Serene 静谧系列',
    description: '以东方禅意美学为灵感，甄选天然材质打造的家居精品。每一件作品都承载着对宁静生活的向往，在喧嚣中为您营造一方净土。',
    category: '家居生活',
    coverImage: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      'https://images.unsplash.com/photo-1551298370-9d3d53f7ed34?w=800&q=80',
    ],
    videos: [
      {
        id: 'v1',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        poster: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80',
        duration: '0:45',
      },
    ],
  },
  {
    id: 'nordic-minimal',
    name: 'Nordic 北欧极简系列',
    description: '源自斯堪的纳维亚半岛的设计哲学，以简洁线条和自然色调诠释现代生活美学。功能与美感的完美平衡，为空间注入北欧式的温暖与舒适。',
    category: '现代设计',
    coverImage: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    ],
    videos: [
      {
        id: 'v2',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        poster: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
        duration: '1:12',
      },
    ],
  },
  {
    id: 'artisan-craft',
    name: 'Artisan 手作系列',
    description: '由资深工匠手工打造的限量作品，传承百年工艺精髓。每一道纹理都诉说着匠人的专注与热爱，是可以珍藏的艺术品。',
    category: '手工艺术',
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
