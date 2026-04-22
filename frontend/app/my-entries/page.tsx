'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { entryApi } from '@/lib/api'
import { Entry } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { CustomIcon } from '@/components/ui/custom-icon'


export default function MyEntriesPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMyEntries = async () => {
      try {
        // トークンがあるか確認
        const storedToken = localStorage.getItem('access_token')
        if (!storedToken) {
          console.error('トークンがありません。ログインページにリダイレクトします。')
          router.push('/')
          return
        }

        // 現在のユーザー情報を取得してからエントリーを取得
        const { getBackendBaseUrl } = await import('@/lib/backend-url')
        const backendUrl = getBackendBaseUrl()
        const userResponse = await fetch(`${backendUrl}/api/users/me/`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        if (!userResponse.ok) {
          throw new Error('ユーザー情報の取得に失敗しました')
        }

        const userData = await userResponse.json()

        // ユーザーIDでエントリーをフィルタリング
        const response = await entryApi.getEntries({ author: userData.id })
        setEntries(response.data.results || response.data)
      } catch (err: unknown) {
        const error = err as { message?: string; response?: { status?: number } }
        console.error('投稿取得エラー:', err)

        if (error.message === 'Network Error') {
          setError('バックエンドに接続できません。サーバーが起動しているか確認してください。')
        } else if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          router.push('/')
        } else {
          setError('投稿の取得に失敗しました')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMyEntries()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <CustomIcon name="wait" size={72} className="mx-auto mb-6 text-purple-600 animate-bounce" />
          <div className="text-gray-900 dark:text-gray-100 text-xl font-bold">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md border-2 border-gray-200 dark:border-gray-800 animate-fadeInUp">
          <CustomIcon name="warning" size={72} className="mx-auto mb-6 text-red-600 dark:text-red-400" />
          <div className="text-red-600 dark:text-red-400 text-center font-semibold text-lg mb-6">
            {error}
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <CustomIcon name="home" size={20} className="brightness-0 invert" />
              ホームに戻る
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-6 sm:py-8 lg:py-12 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-t-2xl sm:rounded-t-3xl p-6 sm:p-8 lg:p-10 text-center shadow-xl animate-fadeInUp">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 flex items-center justify-center gap-3">
            <CustomIcon name="camera" size={48} className="brightness-0 invert" />
            マイ投稿
          </h1>
          <p className="text-purple-100 text-base sm:text-lg">あなたが投稿した作品一覧</p>
        </div>

        {/* コンテンツ */}
        <div className="bg-white dark:bg-gray-900 rounded-b-2xl sm:rounded-b-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
          {entries.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 animate-fadeInUp">
              <CustomIcon name="entries" size={72} className="mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 dark:text-gray-400 italic text-lg mb-4">
                まだ投稿がありません
              </p>
              <Link
                href="/submit"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <CustomIcon name="camera" size={20} className="brightness-0 invert" />
                  新しい投稿を作成
                </span>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {entries.length}
                  </span>
                  <span className="ml-2">件の投稿</span>
                </div>
                <Link
                  href="/submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base flex items-center gap-2"
                >
                  <CustomIcon name="plus" size={18} className="brightness-0 invert" />
                  新しい投稿
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
                {entries.map((entry, index) => (
                  <Link
                    key={entry.id}
                    href={`/entries/${entry.id}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 animate-fadeInUp"
                  >
                    {/* サムネイル */}
                    <div className="relative w-full aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 overflow-hidden">
                      {entry.thumbnail ? (
                        <div className="relative w-full h-48">
                          <Image
                            src={entry.thumbnail}
                            fill
                            alt={entry.title}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CustomIcon name="entries" size={60} className="text-gray-400 dark:text-gray-600" />
                        </div>
                      )}
                      {/* 承認ステータス */}
                      {!entry.approved && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <CustomIcon name="wait" size={14} className="brightness-0 invert" />
                          承認待ち
                        </div>
                      )}
                      {entry.approved && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <CustomIcon name="check" size={14} className="brightness-0 invert" />
                          承認済み
                        </div>
                      )}
                    </div>

                    {/* 情報 */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {entry.title}
                      </h3>

                      {entry.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {entry.description}
                        </p>
                      )}

                      {/* 統計 */}
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <CustomIcon name="star" size={14} className="text-red-500" />
                            {entry.vote_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <CustomIcon name="stats" size={14} className="text-blue-500" />
                            {entry.view_count}
                          </span>
                        </div>
                      </div>

                      {/* 日付 */}
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
