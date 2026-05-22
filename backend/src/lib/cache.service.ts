interface CacheItem<T> {
  data: T
  expiresAt: number
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutos

  set<T>(key: string, data: T, ttlMs: number = this.defaultTTL): void {
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return item.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
  invalidateUsuario(usuarioId: number): void {
    for (const key of this.cache.keys()) {
      if (key.includes(`usuario_${usuarioId}`)) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new CacheService()
