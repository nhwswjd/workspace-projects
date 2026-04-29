'use client';

import { useState } from 'react';
import { Lock, ArrowUp } from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface UnlockPromptProps {
  className?: string;
}

export function UnlockPrompt({ className }: UnlockPromptProps) {
  const { checkPassword } = useAuth();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (password: string): Promise<boolean> => {
    setError(undefined);
    setIsLoading(true);

    try {
      const success = await checkPassword(password);
      if (!success) {
        setError('密码错误，请重试');
      }
      return success;
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
        'flex flex-col items-center justify-center p-8 md:p-12',
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center mb-8 animate-fade-in">
        <Lock className="w-10 h-10 text-[#1A1A1A]/40" />
      </div>

      <h2 className="font-display text-2xl md:text-3xl text-center mb-3 animate-fade-in-up">
        受保护内容
      </h2>
      <p className="text-muted-foreground text-center mb-8 max-w-sm animate-fade-in-up animation-delay-100">
        此页面包含专属产品资料，请输入授权密码以继续浏览
      </p>

      <div className="animate-fade-in-up animation-delay-200">
        <PasswordInput
          onSubmit={handleSubmit}
          error={error}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-8 animate-fade-in animation-delay-300">
        <ArrowUp className="w-4 h-4 text-muted-foreground/50 animate-bounce" />
      </div>
    </div>
  );
}
