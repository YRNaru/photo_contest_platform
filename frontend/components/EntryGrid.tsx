'use client'

import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { contestApi } from '@/lib/api'
import { Entry } from '@/lib/types'
import { EntryCard } from './EntryCard'
import { Skeleton } from '@/components/ui/skeleton'
import { staggerContainer, staggerItem } from '@/lib/motion'

interface EntryGridProps {
  contestSlug: string
}

export function EntryGrid({ contestSlug }: EntryGridProps) {
  const [ordering, setOrdering] = useState('-created_at')
  const prefersReducedMotion = useReducedMotion()

  const { data, isLoading, error } = useQuery({
    queryKey: ['contest-entries', contestSlug, ordering],
    queryFn: async () => {
      const response = await contestApi.getContestEntries(contestSlug, { ordering })
      return response.data.results || response.data
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl sm:h-96" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-12 text-center sm:rounded-2xl sm:py-16">
        <p className="text-lg font-semibold text-destructive sm:text-xl">
          ⚠️ エントリーの読み込みに失敗しました
        </p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-purple-50/80 to-pink-50/80 px-4 py-12 text-center sm:rounded-2xl sm:py-16 lg:py-20 dark:from-purple-950/30 dark:to-pink-950/30">
        <span className="mb-4 block text-5xl opacity-50 sm:text-6xl lg:text-7xl">📸</span>
        <p className="text-lg font-semibold text-muted-foreground sm:text-xl">まだ投稿がありません</p>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">最初の作品を投稿してみましょう！</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-start sm:mb-6 sm:justify-end">
        <select
          value={ordering}
          onChange={e => setOrdering(e.target.value)}
          className="w-full cursor-pointer rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:py-3 sm:text-base"
        >
          <option value="-created_at">🆕 新着順</option>
          <option value="created_at">⏰ 古い順</option>
          <option value="-vote_count">🔥 人気順</option>
        </select>
      </div>

      <motion.div
        key={ordering}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4"
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
        variants={prefersReducedMotion ? undefined : staggerContainer}
      >
        {data.map((entry: Entry) => (
          <motion.div key={entry.id} variants={prefersReducedMotion ? undefined : staggerItem} className="h-full">
            <EntryCard entry={entry} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
