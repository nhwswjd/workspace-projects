'use client';

import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'atelier_authenticated';
const CATEGORY_KEY = 'atelier_category_permission';
const ADMIN_KEY = 'atelier_is_admin';
const SUPER_ADMIN_KEY = 'atelier_is_super_admin';
const SESSION_TOKEN_KEY = 'atelier_session_token';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [categoryPermission, setCategoryPermission] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    const storedCategory = localStorage.getItem(CATEGORY_KEY);
    const storedAdmin = localStorage.getItem(ADMIN_KEY);
    const storedSuperAdmin = localStorage.getItem(SUPER_ADMIN_KEY);
    const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
      setCategoryPermission(storedCategory);
      setIsAdmin(storedAdmin === 'true');
      setIsSuperAdmin(storedSuperAdmin === 'true');
      setSessionToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const checkPassword = useCallback(async (password: string): Promise<{ success: boolean; isAdmin?: boolean; isSuperAdmin?: boolean }> => {
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
        // 存储超级管理员标识
        if (data.isSuperAdmin) {
          localStorage.setItem(SUPER_ADMIN_KEY, 'true');
          setIsSuperAdmin(true);
        } else {
          localStorage.removeItem(SUPER_ADMIN_KEY);
          setIsSuperAdmin(false);
        }
        // 存储分类权限
        if (data.categoryPermission) {
          localStorage.setItem(CATEGORY_KEY, data.categoryPermission);
          setCategoryPermission(data.categoryPermission);
        } else {
          localStorage.removeItem(CATEGORY_KEY);
          setCategoryPermission(null);
        }
        // 存储会话 Token
        if (data.sessionToken) {
          localStorage.setItem(SESSION_TOKEN_KEY, data.sessionToken);
          setSessionToken(data.sessionToken);
        }
        setIsAuthenticated(true);
        return { success: true, isAdmin: data.isAdmin, isSuperAdmin: data.isSuperAdmin };
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
    localStorage.removeItem(SUPER_ADMIN_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setCategoryPermission(null);
    setSessionToken(null);
    
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

  const getSessionToken = useCallback((): string | null => {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  }, []);

  return { isAuthenticated, isLoading, isAdmin, isSuperAdmin, checkPassword, logout, categoryPermission, hasCategoryAccess, sessionToken, getSessionToken };
}
