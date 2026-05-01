'use client';

import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'atelier_authenticated';
const CATEGORY_KEY = 'atelier_category_permission';
const ADMIN_KEY = 'atelier_is_admin';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categoryPermission, setCategoryPermission] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    const storedCategory = localStorage.getItem(CATEGORY_KEY);
    const storedAdmin = localStorage.getItem(ADMIN_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
      setCategoryPermission(storedCategory);
      setIsAdmin(storedAdmin === 'true');
    }
    setIsLoading(false);
  }, []);

  const checkPassword = useCallback(async (password: string): Promise<{ success: boolean; isAdmin?: boolean }> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem(AUTH_KEY, 'true');
        // 存储管理员标识
        if (data.isAdmin) {
          localStorage.setItem(ADMIN_KEY, 'true');
          setIsAdmin(true);
        } else {
          localStorage.removeItem(ADMIN_KEY);
          setIsAdmin(false);
        }
        // 存储分类权限
        if (data.categoryPermission) {
          localStorage.setItem(CATEGORY_KEY, data.categoryPermission);
          setCategoryPermission(data.categoryPermission);
        } else {
          localStorage.removeItem(CATEGORY_KEY);
          setCategoryPermission(null);
        }
        setIsAuthenticated(true);
        return { success: true, isAdmin: data.isAdmin };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  }, []);

  const logout = useCallback((navigateToHome = true) => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(CATEGORY_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCategoryPermission(null);
    
    // 如果需要，导航到首页
    if (navigateToHome && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  const hasCategoryAccess = useCallback((categoryId: string): boolean => {
    if (!isAuthenticated) return false;
    // 如果有全权限或对应的分类权限
    if (!categoryPermission || categoryPermission === categoryId) return true;
    return false;
  }, [isAuthenticated, categoryPermission]);

  return { isAuthenticated, isLoading, isAdmin, checkPassword, logout, categoryPermission, hasCategoryAccess };
}
