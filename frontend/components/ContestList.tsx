'use client'

import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { useQueryState, parseAsStringLiteral } from 'nuqs'
import { contestApi } from '@/lib/api'
import { Contest } from '@/lib/types'
import { ContestCard } from './ContestCard'
import { Skeleton } from '@/components/ui/skeleton'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { getPhaseLabel } from '@/lib/utils'
import { useMemo } from 'react'

/** フィルタ対象のフェーズ一覧（'all' はフィルタなしを意味する） */
const PHASE_OPTIONS = ['all', 'upcoming', 'submission', 'voting', 'closed'] as const

export function ContestList() {
  const [phase, setPhase] = useQueryState(
    'phase',
    parseAsStringLiteral(PHASE_OPTIONS).withDefault('all')
  )
  const [search, setSearch] = useQueryState('q', { defaultValue: '' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['contests'],
    queryFn: async () => {
      const response = await contestApi.getContests()
      return response.data.results || response.data
    },
  })

  const prefersReducedMotion = useReducedMotion()

  /** フィルタリング済みのコンテスト一覧 */
  const filteredData = useMemo(() => {
    if (!data) return []
    let filtered = data as Contest[]

    // フェーズフィルタ
    if (phase !== 'all') {
      filtered = filtered.filter((contest: Contest) => contest.phase === phase)
    }

    // キーワード検索
    if (search) {
      const keyword = search.toLowerCase()
      filtered = filtered.filter(
        (contest: Contest) =>
          contest.title.toLowerCase().includes(keyword) ||
          contest.description.toLowerCase().includes(keyword)
      )
    }

    return filtered
  }, [data, phase, search])

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

  return (
    <div className="space-y-6">
      {/* フィルタ・検索バー */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* フェーズフィルタ */}
        <div className="flex flex-wrap gap-2">
          {PHASE_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => setPhase(option === 'all' ? null : option)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                phase === option
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option === 'all' ? 'すべて' : getPhaseLabel(option)}
            </button>
          ))}
        </div>

        {/* 検索ボックス */}
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value || null)}
            placeholder="🔍 コンテストを検索..."
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* コンテスト一覧 */}
      {filteredData.length === 0 ? (
        <div className="w-full min-w-0 max-w-full rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-purple-50/80 to-pink-50/80 px-4 py-16 text-center dark:from-purple-950/30 dark:to-pink-950/30 sm:px-8 sm:py-20">
          <span className="mb-4 block text-6xl opacity-50 sm:text-7xl">🏆</span>
          <p className="text-balance text-lg font-semibold text-muted-foreground sm:text-xl">
            {phase !== 'all' || search
              ? '条件に一致するコンテストが見つかりません'
              : '現在開催中のコンテストはありません'}
          </p>
          {(phase !== 'all' || search) && (
            <button
              onClick={() => {
                setPhase(null)
                setSearch(null)
              }}
              className="mt-4 text-sm text-purple-600 underline hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              フィルタをクリア
            </button>
          )}
          {!search && phase === 'all' && (
            <p className="mt-2 text-balance text-sm text-muted-foreground">
              新しいコンテストをお楽しみに！
            </p>
          )}
        </div>
      ) : (
        <motion.div
          className="cq-contest-grid grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:gap-6 lg:gap-8"
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
          variants={prefersReducedMotion ? undefined : staggerContainer}
        >
          {filteredData.map((contest: Contest, index: number) => (
            <motion.div
              key={contest.slug}
              variants={prefersReducedMotion ? undefined : staggerItem}
              className="h-full"
            >
              <ContestCard contest={contest} priority={index < 3} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
