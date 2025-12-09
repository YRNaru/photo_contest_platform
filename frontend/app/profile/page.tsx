'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userApi } from '@/lib/api'
import { User, SocialAccount } from '@/lib/types'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { AvatarSection } from '@/components/profile/AvatarSection'
import { BasicInfoSection } from '@/components/profile/BasicInfoSection'
import { StatsSection } from '@/components/profile/StatsSection'
import { SocialAccountsSection } from '@/components/profile/SocialAccountsSection'
import { ProfileActions } from '@/components/profile/ProfileActions'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // URLパラメータからトークンを取得（ログイン直後の場合）
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // トークンをlocalStorageに保存
          localStorage.setItem('access_token', accessToken)
          localStorage.setItem('refresh_token', refreshToken)

          // URLからパラメータを削除（クリーンなURLに）
          window.history.replaceState({}, '', '/profile')
        }

        // トークンがあるか確認
        const storedToken = localStorage.getItem('access_token')
        if (!storedToken) {
          console.error('トークンがありません。ログインページにリダイレクトします。')
          router.push('/')
          return
        }

        // ユーザー情報を取得
        const response = await userApi.me()
        setUser(response.data)
      } catch (err: any) {
        console.error('プロフィール取得エラー:', err)

        // ネットワークエラーの場合
        if (err.message === 'Network Error') {
          setError('バックエンドに接続できません。サーバーが起動しているか確認してください。')
        } else if (err.response?.status === 401) {
          // 未認証の場合はトークンを削除してホームにリダイレクト
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          router.push('/')
        } else {
          setError('プロフィール情報の取得に失敗しました')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [router])

  const handleLogout = async () => {
    try {
      // トークンを削除
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      // バックエンドのログアウトエンドポイントを呼ぶ
      window.location.href = 'http://localhost:18000/accounts/logout/'
    } catch (err) {
      console.error('ログアウトエラー:', err)
    }
  }

  const getTwitterAccount = (): SocialAccount | undefined => {
    return user?.social_accounts?.find(acc => acc.provider === 'twitter_oauth2')
  }

  const getGoogleAccount = (): SocialAccount | undefined => {
    return user?.social_accounts?.find(acc => acc.provider === 'google')
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // プレビュー表示
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // アップロード
      uploadAvatar(file)
    }
  }

  const uploadAvatar = async (file: File) => {
    setUploading(true)
    setUploadSuccess(false)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await userApi.updateProfile(formData)
      setUser(response.data)
      setUploadSuccess(true)

      // 成功メッセージを3秒後に消す
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err: any) {
      console.error('アバターアップロードエラー:', err)
      alert('アイコンのアップロードに失敗しました')
      setAvatarPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSetTwitterIcon = async () => {
    if (!twitterAccount?.profile_image_url) {
      alert('Twitterアイコンが見つかりません')
      return
    }

    setUploading(true)
    setUploadSuccess(false)
    try {
      const response = await userApi.setTwitterIcon()
      setUser(response.data)
      setAvatarPreview(null)
      setUploadSuccess(true)

      // 成功メッセージを3秒後に消す
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err: any) {
      console.error('Twitterアイコン設定エラー:', err)
      alert('Twitterアイコンの設定に失敗しました')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-bounce">⏳</div>
          <div className="text-gray-900 dark:text-gray-100 text-xl font-bold">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md border-2 border-gray-200 dark:border-gray-800 animate-fadeInUp">
          <div className="text-7xl mb-6 text-center">⚠️</div>
          <div className="text-red-600 dark:text-red-400 text-center font-semibold text-lg mb-6">
            {error || 'ユーザー情報が見つかりません'}
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            🏠 ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  const twitterAccount = getTwitterAccount()
  const googleAccount = getGoogleAccount()

  return (
    <div className="min-h-screen bg-white dark:bg-black py-6 sm:py-8 lg:py-12 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <ProfileHeader />

        <div className="bg-white dark:bg-gray-900 rounded-b-2xl sm:rounded-b-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
          <AvatarSection
            user={user}
            avatarPreview={avatarPreview}
            uploading={uploading}
            uploadSuccess={uploadSuccess}
            onFileSelect={handleAvatarSelect}
            onSetTwitterIcon={handleSetTwitterIcon}
            twitterAccount={twitterAccount}
          />
          <BasicInfoSection user={user} />
          <StatsSection user={user} />
          <SocialAccountsSection twitterAccount={twitterAccount} googleAccount={googleAccount} />
          <ProfileActions
            user={user}
            twitterAccount={twitterAccount}
            googleAccount={googleAccount}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </div>
  )
}
