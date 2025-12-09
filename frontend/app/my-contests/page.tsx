'use client'

import { useQuery } from '@tanstack/react-query'
import { contestApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { ContestCard } from '@/components/ContestCard'
import { Contest } from '@/lib/types'
import Link from 'next/link'

export default function MyContestsPage() {
  const { isAuthenticated } = useAuth()

  const {
    data: contests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['my-contests'],
    queryFn: async () => {
      const response = await contestApi.getMyContests()
      return response.data.results || response.data
    },
    enabled: isAuthenticated,
  })

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700">
          <span className="text-7xl mb-6 block">🔒</span>
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            ログインが必要です
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            自分のコンテストを表示するにはログインしてください
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 lg:mb-10 gap-3 sm:gap-4 animate-fadeInUp">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          📋 マイコンテスト
        </h1>
        <Link
          href="/contests/create"
          className="group w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 sm:hover:scale-110 transform-gpu flex items-center justify-center gap-2"
        >
          <span className="text-lg sm:text-xl group-hover:rotate-90 transition-transform duration-300">
            ➕
          </span>
          新しいコンテストを作成
        </Link>
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl border border-gray-300 dark:border-gray-700"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <span className="text-7xl mb-4 block">⚠️</span>
          <p className="text-xl font-semibold text-red-500 dark:text-red-400">
            コンテストの読み込みに失敗しました
          </p>
        </div>
      )}

      {!isLoading && !error && (!contests || contests.length === 0) && (
        <div
          className="text-center py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 animate-fadeInUp"
          style={{ animationDelay: '100ms' }}
        >
          <span className="text-8xl mb-6 block opacity-70">🏆</span>
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-8">
            まだコンテストを作成していません
          </p>
          <Link
            href="/contests/create"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 transform-gpu"
          >
            <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">
              ➕
            </span>
            最初のコンテストを作成
          </Link>
        </div>
      )}

      {!isLoading && !error && contests && contests.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 animate-fadeInUp"
          style={{ animationDelay: '100ms' }}
        >
          {contests.map((contest: Contest) => (
            <div key={contest.slug} className="relative group">
              <ContestCard contest={contest} />
              {/* 編集ボタン */}
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10">
                <Link
                  href={`/contests/${contest.slug}/edit`}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-110 transform-gpu"
                >
                  ✏️ 編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
