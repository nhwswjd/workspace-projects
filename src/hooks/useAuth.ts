'use client';

import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'atelier_authenticated';
const CATEGORY_KEY = 'atelier_category_permission';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryPermission, setCategoryPermission] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    const storedCategory = localStorage.getItem(CATEGORY_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
      setCategoryPermission(storedCategory);
    }
    setIsLoading(false);
  }, []);

  const checkPassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem(AUTH_KEY, 'true');
        // 存储分类权限
        if (data.categoryPermission) {
          localStorage.setItem(CATEGORY_KEY, data.categoryPermission);
          setCategoryPermission(data.categoryPermission);
        } else {
          localStorage.removeItem(CATEGORY_KEY);
          setCategoryPermission(null);
        }
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(CATEGORY_KEY);
    setIsAuthenticated(false);
    setCategoryPermission(null);
  }, []);

  const hasCategoryAccess = useCallback((categoryId: string): boolean => {
    if (!isAuthenticated) return false;
    // 如果有全权限或对应的分类权限
    if (!categoryPermission || categoryPermission === categoryId) return true;
    return false;
  }, [isAuthenticated, categoryPermission]);

  return { isAuthenticated, isLoading, checkPassword, logout, categoryPermission, hasCategoryAccess };
}
