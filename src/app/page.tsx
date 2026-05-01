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
      const result = await checkPassword(password);
      if (result.success) {
        setTimeout(() => {
          router.push('/gallery');
        }, 100);
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
      <div className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80)',
        }}
      >
        <div className="w-8 h-8 border-4 border-white/50 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80)',
      }}
    >
      {/* 深色遮罩 */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* 居中内容 */}
      <div className="relative z-10 w-full max-w-sm px-6">
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入访问密码"
            disabled={isLoading}
            className="w-full px-5 py-6 bg-white/20 border border-white/30 rounded-xl text-white text-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all mb-4"
          />
          
          {error && (
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            {isLoading ? '验证中...' : '进入相册'}
          </button>
        </form>
      </div>
    </div>
  );
}
