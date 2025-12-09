'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function TwitterCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loadUser } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      // URLからトークンを取得
      const access = searchParams.get('access_token')
      const refresh = searchParams.get('refresh_token')

      if (access && refresh) {
        // トークンを保存
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)

        // ユーザー情報を読み込み
        await loadUser()

        // ホームページにリダイレクト
        router.push('/')
      } else {
        // エラーの場合はホームにリダイレクト
        console.error('No tokens received from Twitter OAuth')
        router.push('/')
      }
    }

    handleCallback()
  }, [searchParams, loadUser, router])

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">ログイン中...</h1>
      <p className="text-muted-foreground">しばらくお待ちください</p>
    </div>
  )
}
