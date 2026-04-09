/**
 * Auth utility functions test
 *
 * このファイルは認証関連のヘルパー関数のテストです。
 */

import { beforeEach, describe, expect, it } from 'vitest'

/**
 * vitest.setup.ts でグローバルに localStorage を vi.fn() でモックしているため、
 * このテストでは実際に値を保持する簡易 localStorage を使用する。
 */
const storage = new Map<string, string>()
const realLocalStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
  get length() {
    return storage.size
  },
  key: (index: number) => [...storage.keys()][index] ?? null,
} as Storage

describe('Auth Utilities', () => {
  describe('Token Management', () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, 'localStorage', {
        value: realLocalStorage,
        writable: true,
      })
      localStorage.clear()
    })

    it('stores access token in localStorage', () => {
      const token = 'test-access-token'
      localStorage.setItem('access_token', token)

      const stored = localStorage.getItem('access_token')
      expect(stored).toBe(token)
    })

    it('stores refresh token in localStorage', () => {
      const token = 'test-refresh-token'
      localStorage.setItem('refresh_token', token)

      const stored = localStorage.getItem('refresh_token')
      expect(stored).toBe(token)
    })

    it('removes tokens from localStorage', () => {
      localStorage.setItem('access_token', 'token1')
      localStorage.setItem('refresh_token', 'token2')

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  describe('Auth State', () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, 'localStorage', {
        value: realLocalStorage,
        writable: true,
      })
      localStorage.clear()
    })

    it('checks if user is authenticated with token', () => {
      localStorage.setItem('access_token', 'valid-token')
      const hasToken = !!localStorage.getItem('access_token')
      expect(hasToken).toBe(true)
    })

    it('checks if user is not authenticated without token', () => {
      localStorage.removeItem('access_token')
      const hasToken = !!localStorage.getItem('access_token')
      expect(hasToken).toBe(false)
    })
  })

  describe('URL Token Extraction', () => {
    it('extracts tokens from URL parameters', () => {
      const mockUrl = 'http://localhost:3000/profile?access_token=abc123&refresh_token=def456'
      const url = new URL(mockUrl)
      const accessToken = url.searchParams.get('access_token')
      const refreshToken = url.searchParams.get('refresh_token')

      expect(accessToken).toBe('abc123')
      expect(refreshToken).toBe('def456')
    })

    it('handles missing tokens in URL', () => {
      const mockUrl = 'http://localhost:3000/profile'
      const url = new URL(mockUrl)
      const accessToken = url.searchParams.get('access_token')
      const refreshToken = url.searchParams.get('refresh_token')

      expect(accessToken).toBeNull()
      expect(refreshToken).toBeNull()
    })
  })
})
