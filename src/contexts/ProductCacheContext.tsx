'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

interface Product {
  id: string
  name: string
  sku: string
  description: string
  price: number
  category_id: string
  tags: string[]
  images: { url: string }[]
  videos: { url: string; thumbnail?: string }[]
  thumbnail: string | null
  view_count: number
  sort_order: number
  created_at: string
  updated_at: string
}

interface ProductListCache {
  products: Product[]
  categories: { id: string; name: string; sort_order: number }[]
  selectedCategory: string | null
  lastFetched: number
  totalCount: number
}

interface ProductCacheContextType {
  cache: ProductListCache | null
  setCache: (data: ProductListCache) => void
  clearCache: () => void
  isCacheValid: (maxAge?: number) => boolean
}

const CACHE_MAX_AGE = 5 * 60 * 1000 // 5分钟缓存

const ProductCacheContext = createContext<ProductCacheContextType | undefined>(undefined)

export function ProductCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCacheState] = useState<ProductListCache | null>(null)

  // 从 sessionStorage 恢复缓存
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('productListCache')
      if (stored) {
        const parsed = JSON.parse(stored) as ProductListCache
        setCacheState(parsed)
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [])

  const setCache = useCallback((data: ProductListCache) => {
    setCacheState(data)
    try {
      sessionStorage.setItem('productListCache', JSON.stringify(data))
    } catch (e) {
      // ignore storage errors
    }
  }, [])

  const clearCache = useCallback(() => {
    setCacheState(null)
    try {
      sessionStorage.removeItem('productListCache')
    } catch (e) {
      // ignore storage errors
    }
  }, [])

  const isCacheValid = useCallback((maxAge = CACHE_MAX_AGE) => {
    if (!cache) return false
    return Date.now() - cache.lastFetched < maxAge
  }, [cache])

  return (
    <ProductCacheContext.Provider value={{ cache, setCache, clearCache, isCacheValid }}>
      {children}
    </ProductCacheContext.Provider>
  )
}

export function useProductCache() {
  const context = useContext(ProductCacheContext)
  if (!context) {
    throw new Error('useProductCache must be used within ProductCacheProvider')
  }
  return context
}

// 便捷函数：获取缓存的产品列表
export function getCachedProducts() {
  try {
    const stored = sessionStorage.getItem('productListCache')
    if (stored) {
      const parsed = JSON.parse(stored) as ProductListCache
      if (Date.now() - parsed.lastFetched < CACHE_MAX_AGE) {
        return parsed
      }
    }
  } catch (e) {
    // ignore
  }
  return null
}
