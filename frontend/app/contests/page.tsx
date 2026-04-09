'use client'

import { ContestList } from '@/components/ContestList'
import { Suspense } from 'react'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { GradientHeading } from '@/components/ui/gradient-heading'
import { cn } from '@/lib/utils'

export default function ContestsPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-center",
        "mb-6 sm:mb-8 lg:mb-10 gap-3 sm:gap-4 animate-fadeInUp"
      )}>
        <GradientHeading as="h1">
          🏆 コンテスト一覧
        </GradientHeading>
        {isAuthenticated && (
          <Link
            href="/contests/create"
            className={cn(
              "group w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2",
              "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
              "text-white rounded-xl font-bold text-sm sm:text-base cursor-pointer",
              "shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 sm:hover:scale-110 transform-gpu"
            )}
          >
            <span className="text-lg sm:text-xl group-hover:rotate-90 transition-transform duration-300">
              ➕
            </span>
            新しいコンテストを作成
          </Link>
        )}
      </div>
      <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-xl bg-muted" />}>
          <ContestList />
        </Suspense>
      </div>
    </div>
  )
}
