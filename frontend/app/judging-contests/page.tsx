'use client'

import { useQuery } from '@tanstack/react-query'
import { contestApi } from '@/lib/api'
import { Contest } from '@/lib/types'
import { ContestCard } from '@/components/ContestCard'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { GradientHeading } from '@/components/ui/gradient-heading'
import { cn } from '@/lib/utils'

export default function JudgingContestsPage() {
  const { user, isLoading: loading } = useAuth()
  const router = useRouter()

  // 未認証の場合はホームページへリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const { data: contests, isLoading } = useQuery({
    queryKey: ['judging-contests'],
    queryFn: async () => {
      const response = await contestApi.getJudgingContests()
      return response.data.results as Contest[]
    },
    enabled: !!user,
  })

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8 animate-fadeInUp">
        <GradientHeading as="h1" className="mb-3 sm:mb-4">
          👨‍⚖️ 審査中のコンテスト
        </GradientHeading>
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
          あなたが審査員として割り当てられているコンテスト一覧です
        </p>
      </div>

      {/* コンテスト一覧 */}
      <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        {contests && contests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {contests.map(contest => (
              <ContestCard key={contest.slug} contest={contest} />
            ))}
          </div>
        ) : (
          <div className={cn(
            "rounded-xl shadow-lg p-8 sm:p-12 text-center border",
            "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
          )}>
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              審査中のコンテストはありません
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              まだ審査員として割り当てられているコンテストはありません
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
