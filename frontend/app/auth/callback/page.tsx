'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processCallback = () => {
      try {
        // URLパラメータからトークンを取得
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // トークンをlocalStorageに保存
          localStorage.setItem('access_token', accessToken)
          localStorage.setItem('refresh_token', refreshToken)

          console.log('ログイン成功: トークンを保存しました')

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
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">読み込み中...</h1>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
