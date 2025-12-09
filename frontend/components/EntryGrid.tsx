'use client'

import { useQuery } from '@tanstack/react-query'
import { contestApi } from '@/lib/api'
import { EntryCard } from './EntryCard'
import { useState } from 'react'

interface EntryGridProps {
  contestSlug: string
}

export function EntryGrid({ contestSlug }: EntryGridProps) {
  const [ordering, setOrdering] = useState('-created_at')

  const { data, isLoading, error } = useQuery({
    queryKey: ['contest-entries', contestSlug, ordering],
    queryFn: async () => {
      const response = await contestApi.getContestEntries(contestSlug, { ordering })
      return response.data.results || response.data
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-80 sm:h-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 px-4">
        <p className="text-lg sm:text-xl font-semibold text-red-500 dark:text-red-400">
          ⚠️ エントリーの読み込みに失敗しました
        </p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl sm:rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 px-4">
        <span className="text-5xl sm:text-6xl lg:text-7xl mb-4 block opacity-50">📸</span>
        <p className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400">
          まだ投稿がありません
        </p>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">
          最初の作品を投稿してみましょう！
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* ソート */}
      <div className="flex justify-start sm:justify-end mb-4 sm:mb-6">
        <select
          value={ordering}
          onChange={e => setOrdering(e.target.value)}
          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-sm sm:text-base font-semibold hover:border-purple-400 dark:hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all cursor-pointer"
        >
          <option value="-created_at">🆕 新着順</option>
          <option value="created_at">⏰ 古い順</option>
          <option value="-vote_count">🔥 人気順</option>
        </select>
      </div>

      {/* グリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {data.map((entry: any) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}
