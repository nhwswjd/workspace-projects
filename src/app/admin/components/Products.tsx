'use client';

import { Product } from './types';
import { useAuth } from '@/hooks/useAuth';

interface ProductsProps {
  products: Product[];
  categories: { id: string; name: string }[];
  tags: { id: string; name: string; type: string }[];
  showToast: (message: string, type?: 'success' | 'error') => void;
  onProductAdded: () => void;
}

export default function Products({
  products,
  categories,
  tags,
  showToast,
  onProductAdded
}: ProductsProps) {
  const { getSessionToken } = useAuth();
  
  // 辅助函数
  const getAuthHeaders = (extraHeaders?: Record<string, string>): Record<string, string> => {
    const token = getSessionToken();
    const headers: Record<string, string> = { ...extraHeaders };
    if (token) headers['x-admin-session'] = token;
    return headers;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">产品管理</h2>
        <button
          onClick={() => {
            const modal = document.getElementById('product-modal') as HTMLDialogElement;
            if (modal) modal.showModal();
          }}
          className="btn btn-primary"
        >
          添加产品
        </button>
      </div>

      {/* 产品列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-16">序号</th>
                <th>产品名称</th>
                <th>分类</th>
                <th>标签</th>
                <th>图片</th>
                <th>视频</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    暂无产品，点击上方按钮添加
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td>{index + 1}</td>
                    <td className="font-medium">{product.name}</td>
                    <td>{product.category_name || '-'}</td>
                    <td>
                      {product.tags && product.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag: string) => (
                            <span key={tag} className="badge badge-sm">{tag}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td>{product.images?.length || 0}</td>
                    <td>{product.videos?.length || 0}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const modal = document.getElementById('product-modal') as HTMLDialogElement;
                            if (modal) {
                              (window as any).editProduct = product;
                              modal.showModal();
                            }
                          }}
                          className="btn btn-sm btn-ghost"
                        >
                          编辑
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('确定要删除这个产品吗？')) return;
                            try {
                              const res = await fetch(`/api/products/${product.id}`, {
                                method: 'DELETE',
                                headers: getAuthHeaders()
                              });
                              if (res.ok) {
                                onProductAdded();
                                showToast('产品已删除');
                              } else {
                                showToast('删除失败', 'error');
                              }
                            } catch {
                              showToast('删除失败', 'error');
                            }
                          }}
                          className="btn btn-sm btn-ghost text-red-500"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
