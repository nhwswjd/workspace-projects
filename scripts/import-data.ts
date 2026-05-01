import { getSupabaseClient } from '@/storage/database/supabase-client';

// 从 products.ts 导入的示例数据
const categories = [
  { name: '家居生活', description: '以东方禅意美学为灵感，甄选天然材质打造的家居精品', icon: '🏠' },
  { name: '现代设计', description: '源自斯堪的纳维亚半岛的设计哲学，功能与美感的完美平衡', icon: '🪑' },
  { name: '手工艺术', description: '由资深工匠手工打造的限量作品，传承百年工艺精髓', icon: '🎨' },
  { name: '时尚配饰', description: '融合传统工艺与现代审美的精致配饰系列', icon: '👜' },
  { name: '户外休闲', description: '探索自然，享受户外生活的品质装备', icon: '⛺' },
  { name: '数码科技', description: '科技与美学的融合，为生活注入智能体验', icon: '📱' },
];

const products = [
  // 家居生活
  {
    name: 'Zen 禅意沙发',
    sku: 'LIVING-001',
    description: '以东方禅意美学为灵感，甄选天然材质打造的家居精品。',
    categoryName: '家居生活',
    coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    tags: ['沙发', '客厅', '布艺', '简约', '舒适'],
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    ],
    video: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  },
  // 现代设计
  {
    name: 'Nordic 北欧餐桌',
    sku: 'DESIGN-001',
    description: '源自斯堪的纳维亚半岛的设计哲学，功能与美感的完美平衡。',
    categoryName: '现代设计',
    coverImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    tags: ['餐桌', '北欧', '实木', '简约'],
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80',
    ],
    video: '',
  },
  // 手工艺术
  {
    name: 'Artisan 手作台灯',
    sku: 'CRAFT-001',
    description: '由资深工匠手工打造的限量作品，传承百年工艺精髓。',
    categoryName: '手工艺术',
    coverImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    tags: ['台灯', '手工', '陶瓷', '艺术'],
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80',
    ],
    video: '',
  },
  // 时尚配饰
  {
    name: 'Elegant 手袋系列',
    sku: 'FASHION-001',
    description: '融合传统工艺与现代审美的精致配饰系列。',
    categoryName: '时尚配饰',
    coverImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    tags: ['手袋', '皮革', '时尚', '精致'],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    ],
    video: '',
  },
  // 户外休闲
  {
    name: 'Explorer 户外背包',
    sku: 'OUTDOOR-001',
    description: '探索自然，享受户外生活的品质装备。',
    categoryName: '户外休闲',
    coverImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    tags: ['背包', '户外', '旅行', '防水'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
    ],
    video: '',
  },
  // 数码科技
  {
    name: 'Wireless 无线耳机',
    sku: 'DIGITAL-001',
    description: '科技与美学的融合，为生活注入智能体验。',
    categoryName: '数码科技',
    coverImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    tags: ['耳机', '无线', '蓝牙', '降噪'],
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
    ],
    video: '',
  },
];

async function importData() {
  const client = getSupabaseClient();
  
  if (!client) {
    console.error('Supabase client not available. Please ensure environment variables are set.');
    process.exit(1);
  }

  console.log('Starting data import...');

  // 导入分类
  console.log('Importing categories...');
  for (const cat of categories) {
    const { data, error } = await client.from('categories').insert({
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
    }).select('id').single();
    
    if (error) {
      console.error(`Failed to insert category ${cat.name}:`, error);
    } else {
      console.log(`Inserted category: ${cat.name} (ID: ${data.id})`);
    }
  }

  // 获取分类映射
  const { data: dbCategories } = await client.from('categories').select('id, name');
  const categoryMap = new Map(dbCategories?.map(c => [c.name, c.id]) || []);

  // 导入产品
  console.log('Importing products...');
  for (const product of products) {
    const categoryId = categoryMap.get(product.categoryName);
    if (!categoryId) {
      console.error(`Category not found: ${product.categoryName}`);
      continue;
    }

    // 插入产品
    const { data: productData, error: productError } = await client.from('products').insert({
      name: product.name,
      sku: product.sku,
      description: product.description,
      category_id: categoryId,
      cover_image: product.coverImage,
      tags: product.tags,
    }).select('id').single();

    if (productError) {
      console.error(`Failed to insert product ${product.name}:`, productError);
      continue;
    }

    console.log(`Inserted product: ${product.name} (ID: ${productData.id})`);

    // 插入图片
    for (let i = 0; i < product.images.length; i++) {
      await client.from('product_images').insert({
        product_id: productData.id,
        image_url: product.images[i],
        sort_order: i,
      });
    }
    console.log(`  - Inserted ${product.images.length} images`);

    // 插入视频
    if (product.video) {
      await client.from('product_videos').insert({
        product_id: productData.id,
        video_url: product.video,
        sort_order: 0,
      });
      console.log(`  - Inserted 1 video`);
    }
  }

  console.log('Data import completed!');
}

// 运行导入
importData().catch(console.error);
