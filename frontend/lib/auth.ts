import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, userApi } from './api'

export interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
  is_judge: boolean
  is_moderator: boolean
  is_staff?: boolean
  is_superuser?: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credential: string) => Promise<void>
  loginWithTwitter: () => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credential: string) => {
        try {
          set({ isLoading: true })
          const response = await authApi.googleLogin(credential)
          const { access, refresh, user } = response.data

          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          console.error('Login failed:', error)
          set({ isLoading: false })
          throw error
        }
      },

      loginWithTwitter: async () => {
        // Twitter OAuth2フローはバックエンドでリダイレクトされるため、
        // ここでは何もしない。コールバック後にloadUserを呼ぶ
        return
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      loadUser: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false })
          return
        }

        try {
          set({ isLoading: true })
          const response = await userApi.me()
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          console.error('Failed to load user:', error.message || error)

          // ネットワークエラーやトークンエラーの場合はトークンを削除
          if (error.message === 'Network Error' || error.response?.status === 401) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
            }
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
