'use client';

import { useState, useEffect } from 'react';
import { MoreVertical, Menu } from 'lucide-react';

interface SiteSetting {
  name: string;
}

export default function Header() {
  const [brandName, setBrandName] = useState('ATELIER');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetch('/api/site-settings/brand_name')
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          setBrandName(data.value);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      {/* 顶部 Header - 极简风格 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="h-12 flex items-center justify-between px-4">
          {/* 左侧菜单图标 */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-900" />
          </button>
          
          {/* 中间标题 */}
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">
            {brandName}
          </h1>
          
          {/* 右侧占位 */}
          <div className="w-9"></div>
        </div>
      </header>

      {/* 移动端菜单 */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{brandName}</h2>
            </div>
            <nav className="p-2">
              <a href="/gallery" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-50 text-teal-600">
                <span>产品广场</span>
              </a>
              <a href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                <span>管理后台</span>
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
