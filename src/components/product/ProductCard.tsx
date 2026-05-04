'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
}

export default function ProductCard({ product, showCategory = true }: ProductCardProps) {
  // 使用产品自带的 featured 字段，没有则不显示标签
  const getTagStyle = () => {
    if (product.featured === '右上') {
      return { text: '右上', color: 'bg-emerald-500' };
    } else if (product.featured === '新品') {
      return { text: '新品', color: 'bg-blue-500' };
    } else if (product.featured === '热销') {
      return { text: '热销', color: 'bg-red-500' };
    } else if (product.featured === '特惠') {
      return { text: '特惠', color: 'bg-orange-500' };
    } else if (product.featured === '推荐') {
      return { text: '推荐', color: 'bg-purple-500' };
    } else if (product.featured === '爆款') {
      return { text: '爆款', color: 'bg-pink-500' };
    }
    return null;
  };

  const tagInfo = getTagStyle();

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        {/* 图片容器 */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          
          {/* Featured标签 - 右上角 */}
          {tagInfo && (
            <div className="absolute top-2 right-2 z-10">
              <span className={`${tagInfo.color} text-white text-xs px-2 py-1 rounded-full shadow-sm`}>
                {tagInfo.text}
              </span>
            </div>
          )}
          
          {/* SKU编号 - 左上角 */}
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              {product.sku}
            </span>
          </div>
          
          {/* 视频标识 */}
          {product.videos && product.videos.length > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              {product.videos.length}
            </div>
          )}
        </div>
        
        {/* 产品信息 */}
        <div className="p-3">
          {showCategory && (
            <p className="text-xs text-gray-500 mb-1">{product.category}</p>
          )}
          <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
          
          {/* 地址信息 */}
          {product.location && (
            <p className="text-xs text-gray-400 mt-1 truncate">{product.location}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
