'use client';

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordInputProps {
  onSubmit: (password: string) => Promise<boolean>;
  error?: string;
  isLoading?: boolean;
}

export function PasswordInput({
  onSubmit,
  error,
  isLoading,
}: PasswordInputProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!password.trim() || isLoading) return;
    await onSubmit(password);
  };

  const handleButtonClick = async () => {
    if (!password.trim() || isLoading) return;
    await onSubmit(password);
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative ${isShaking ? 'animate-shake' : ''}`}
        >
          <Input
            ref={inputRef}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入访问密码"
            disabled={isLoading}
            className="pr-12 h-12 text-base touch-manipulation"
            autoComplete="current-password"
            style={{ WebkitAppearance: 'none' }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPassword(!showPassword);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-manipulation z-10"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive animate-fade-in">
            {error}
          </p>
        )}
      </form>

      <Button
        type="button"
        onClick={handleButtonClick}
        disabled={!password.trim() || isLoading}
        className="w-full mt-4 h-12 text-base font-medium touch-manipulation"
        style={{ cursor: 'pointer' }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            验证中...
          </>
        ) : (
          '解锁浏览'
        )}
      </Button>
    </div>
  );
}
