'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryClientProps {
  category: Category;
  products: Product[];
  allCategories: Category[];
}

export default function CategoryClient({ category, products, allCategories }: CategoryClientProps) {
  const router = useRouter();

  // 检查登录状态 - 未登录则跳转到首页
  useEffect(() => {
    const authData = localStorage.getItem('atelier_authenticated');
    if (authData !== 'true') {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* 返回和标题 */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← 返回
        </button>
        <h1 className="flex-1 text-center font-medium text-gray-900 pr-12">
          {category.name}
        </h1>
      </div>

      {/* 分类导航 */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-gray-100">
        <Link
          href="/gallery"
          className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          全部
        </Link>
        {allCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              cat.id === category.id
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* 分类描述 */}
      {category.description && (
        <div className="px-4 py-4">
          <p className="text-gray-600 text-sm">{category.description}</p>
        </div>
      )}

      {/* 产品列表 */}
      {products.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500">
          暂无产品
        </div>
      ) : (
        <div className="max-w-[90%] mx-auto px-2">
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group"
              >
                <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-2">
                  <Image
                    src={product.coverImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  {/* 精选标签 - 右上角 */}
                  {product.featured && (
                    <span className="absolute top-0 right-0 bg-amber-500/90 text-white text-xs px-2 py-0.5 rounded-bl-lg shadow-sm">
                      {product.featured}
                    </span>
                  )}
                  {/* 右下标签 */}
                  {product.featuredRightBottom && (
                    <span className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-bl-sm">
                      {product.featuredRightBottom}
                    </span>
                  )}
                </div>
                {/* 编号和名称 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                    {product.sku}
                  </span>
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {product.name}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
