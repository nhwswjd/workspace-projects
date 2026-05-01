'use client';

import { useState } from 'react';
import { Lock, ArrowUp } from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface UnlockPromptProps {
  className?: string;
  onSuccess?: () => void;
}

export function UnlockPrompt({ className, onSuccess }: UnlockPromptProps) {
  const { checkPassword } = useAuth();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (password: string): Promise<boolean> => {
    setError(undefined);
    setIsLoading(true);

    try {
      const result = await checkPassword(password);
      if (!result.success) {
        setError('密码错误，请重试');
      } else {
        onSuccess?.();
      }
      return result.success;
    } catch {
      setError('验证失败，请稍后重试');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 md:p-8',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-[#1A1A1A]/40" />
      </div>

      <h2 className="font-display text-xl md:text-2xl text-center mb-2">
        输入密码解锁
      </h2>
      <p className="text-muted-foreground text-center text-sm mb-6">
        查看完整产品资料
      </p>

      <PasswordInput
        onSubmit={handleSubmit}
        error={error}
        isLoading={isLoading}
      />

      <div className="mt-6">
        <ArrowUp className="w-4 h-4 text-muted-foreground/50 animate-bounce" />
      </div>
    </div>
  );
}
