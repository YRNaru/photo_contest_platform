'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'

const callbackContainerClass = cn(
  "min-h-screen p-4 flex items-center justify-center",
  "bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800"
)

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loadUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processCallback = async () => {
      try {
        // URLパラメータからトークンを取得
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // トークンをlocalStorageに保存
          localStorage.setItem('access_token', accessToken)
          localStorage.setItem('refresh_token', refreshToken)

          console.log('ログイン成功: トークンを保存しました')

          // ユーザー情報を読み込み（認証状態を更新）
          await loadUser()

          // プロフィールページにリダイレクト
          router.push('/profile')
        } else {
          console.error('URLパラメータにトークンが見つかりません')
          setError('認証情報が取得できませんでした')

          // 5秒後にホームにリダイレクト
          setTimeout(() => {
            router.push('/')
          }, 5000)
        }
      } catch (err: unknown) {
        console.error('認証エラー:', err)
        setError('認証処理中にエラーが発生しました')

        // 5秒後にホームにリダイレクト
        setTimeout(() => {
          router.push('/')
        }, 5000)
      }
    }

    processCallback()
  }, [router, searchParams, loadUser])

  if (error) {
    return (
      <div className={callbackContainerClass}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">認証エラー</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <div className="text-sm text-gray-500">5秒後にホームページにリダイレクトします...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={callbackContainerClass}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center flex flex-col items-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ログイン中...</h1>
          <p className="text-gray-600">認証情報を取得しています</p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className={callbackContainerClass}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center flex flex-col items-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">読み込み中...</h1>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
