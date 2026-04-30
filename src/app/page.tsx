'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading, checkPassword } = useAuth();
  const router = useRouter();

  // 如果已认证，直接跳转到画廊页面
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/gallery');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('请输入访问密码');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await checkPassword(password);
      if (success) {
        router.push('/gallery');
      } else {
        setError('密码错误，请重试');
        setPassword('');
      }
    } catch {
      setError('验证失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="w-8 h-8 border-2 border-stone-400/20 border-t-stone-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 内容区域 */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-white mb-2 tracking-wider">
            私密相册
          </h1>
          <p className="text-white/70 text-sm">
            请输入访问密码
          </p>
        </div>

        {/* 密码输入框 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="输入访问密码"
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg text-stone-800 placeholder:text-stone-400 text-center focus:outline-none focus:ring-2 focus:ring-white/50"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-white text-stone-800 font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? '验证中...' : '进入'}
          </button>
        </form>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-8 text-white/50 text-xs">
        © 2024 私密相册
      </div>
    </div>
  );
}
