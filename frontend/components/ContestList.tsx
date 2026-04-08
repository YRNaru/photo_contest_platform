'use client'

import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { contestApi } from '@/lib/api'
import { Contest } from '@/lib/types'
import { ContestCard } from './ContestCard'
import { Skeleton } from '@/components/ui/skeleton'
import { staggerContainer, staggerItem } from '@/lib/motion'

export function ContestList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['contests'],
    queryFn: async () => {
      const response = await contestApi.getContests()
      return response.data.results || response.data
    },
  })

  const prefersReducedMotion = useReducedMotion()

  if (isLoading) {
    return (
      <div className="cq-contest-grid grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl sm:h-96" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full min-w-0 max-w-full rounded-2xl border border-border bg-card px-4 py-16 text-center sm:px-6">
        <p className="text-balance text-xl font-semibold text-destructive">
          ⚠️ コンテストの読み込みに失敗しました
        </p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full min-w-0 max-w-full rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-purple-50/80 to-pink-50/80 px-4 py-16 text-center dark:from-purple-950/30 dark:to-pink-950/30 sm:px-8 sm:py-20">
        <span className="mb-4 block text-6xl opacity-50 sm:text-7xl">🏆</span>
        <p className="text-balance text-lg font-semibold text-muted-foreground sm:text-xl">
          現在開催中のコンテストはありません
        </p>
        <p className="mt-2 text-balance text-sm text-muted-foreground">新しいコンテストをお楽しみに！</p>
      </div>
    )
  }

  return (
    <motion.div
      className="cq-contest-grid grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:gap-6 lg:gap-8"
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
      variants={prefersReducedMotion ? undefined : staggerContainer}
    >
      {data.map((contest: Contest, index: number) => (
        <motion.div
          key={contest.slug}
          variants={prefersReducedMotion ? undefined : staggerItem}
          className="h-full"
        >
          <ContestCard contest={contest} priority={index < 3} />
        </motion.div>
      ))}
    </motion.div>
  )
}
