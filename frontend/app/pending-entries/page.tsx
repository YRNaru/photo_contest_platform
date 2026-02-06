'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { entryApi } from '@/lib/api'
import { Entry } from '@/lib/types'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function PendingEntriesPage() {
  const { user, isLoading: loading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 未認証またはモデレーター権限がない場合はリダイレクト
  useEffect(() => {
    if (!loading && (!user || (!user.is_moderator && !user.is_staff))) {
      router.push('/')
    }
  }, [user, loading, router])

  const { data: entries, isLoading } = useQuery({
    queryKey: ['pending-entries'],
    queryFn: async () => {
      const response = await entryApi.getPending()
      return response.data.results as Entry[]
    },
    enabled: !!user && (user.is_moderator || user.is_staff),
    staleTime: 30 * 1000, // 30秒
    refetchInterval: 60 * 1000, // 1分ごとに自動更新
  })

  // 承認
  const approveMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return await entryApi.approve(entryId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-entries'] })
      setSuccessMessage('エントリーを承認しました')
      setErrorMessage(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      const message = error.response?.data?.detail || '承認に失敗しました'
      setErrorMessage(message)
      setSuccessMessage(null)
      setTimeout(() => setErrorMessage(null), 5000)
    },
  })

  // 非承認
  const rejectMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return await entryApi.reject(entryId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-entries'] })
      setSuccessMessage('エントリーを非承認にしました')
      setErrorMessage(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      const message = error.response?.data?.detail || '非承認に失敗しました'
      setErrorMessage(message)
      setSuccessMessage(null)
      setTimeout(() => setErrorMessage(null), 5000)
    },
  })

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user || (!user.is_moderator && !user.is_staff)) {
    return null
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8 animate-fadeInUp">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          📋 承認待ちエントリー
        </h1>
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
          ユーザーから投稿されたエントリーの承認・非承認を行います
        </p>
      </div>

      {/* メッセージ */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg animate-fadeInUp">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg animate-fadeInUp">
          {errorMessage}
        </div>
      )}

      {/* エントリー一覧 */}
      <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        {entries && entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-purple-500/10 overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                {/* サムネイル */}
                {entry.thumbnail && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={entry.thumbnail}
                      alt={entry.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}

                {/* 内容 */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {entry.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {entry.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span>👤 {entry.author ? entry.author.username : entry.twitter_username ? `@${entry.twitter_username}` : '不明'}</span>
                    <span>•</span>
                    <span>🏆 {entry.contest_title}</span>
                  </div>

                  {entry.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {entry.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 rounded"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/entries/${entry.id}`}
                      className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-lg text-center transition-colors"
                    >
                      詳細
                    </Link>
                    <button
                      onClick={() => approveMutation.mutate(entry.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      {approveMutation.isPending ? '承認中...' : '✓ 承認'}
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(entry.id)}
                      disabled={rejectMutation.isPending}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      {rejectMutation.isPending ? '拒否中...' : '✕ 拒否'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-800">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              承認待ちのエントリーはありません
            </h3>
            <p className="text-gray-600 dark:text-gray-400">すべてのエントリーが承認済みです</p>
          </div>
        )}
      </div>
    </div>
  )
}
