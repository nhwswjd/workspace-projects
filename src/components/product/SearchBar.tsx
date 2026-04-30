'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    const newUrl = params.toString() ? `/gallery?${params.toString()}` : '/gallery';
    router.replace(newUrl, { scroll: false });
  }, [query, router, searchParams]);

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <Input
        type="text"
        placeholder="搜索产品名称或标签..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-white/90 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      />
    </div>
  );
}
