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
import { CustomIcon } from '@/components/ui/custom-icon'
import { cn } from '@/lib/utils'

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
      <div className="cq-contest-grid grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:gap-5">
        {[...Array(6)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-80 rounded-none border border-zinc-200/80 bg-zinc-200/50 dark:border-white/6 dark:bg-white/4"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full min-w-0 max-w-full rounded-2xl border border-border bg-card px-4 py-16 text-center sm:px-6">
        <p className="text-balance text-xl font-semibold text-destructive flex items-center justify-center gap-2">
          <CustomIcon name="warning" size={24} className="text-destructive mb-1" />
          コンテストの読み込みに失敗しました
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
              className={cn(
                'border px-3 py-1.5 font-body text-xs font-medium uppercase tracking-[0.1em] transition-all duration-300',
                phase === option
                  ? 'border-lime-600/60 bg-lime-100 text-lime-900 dark:border-[#CDFF50]/50 dark:bg-[#CDFF50]/10 dark:text-[#CDFF50]'
                  : 'border-zinc-200/90 bg-zinc-50/90 text-zinc-700 hover:border-zinc-400/80 hover:text-zinc-950 dark:border-white/8 dark:bg-white/4 dark:text-[#8A8A95] dark:hover:border-white/15 dark:hover:text-[#F0EDE8]'
              )}
            >
              {option === 'all' ? 'All' : getPhaseLabel(option)}
            </button>
          ))}
        </div>

        {/* 検索ボックス */}
        <div className="relative flex-1 sm:max-w-xs">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-[#55555F]">
            <CustomIcon name="search" size={14} />
          </div>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value || null)}
            placeholder="コンテストを検索..."
            className="w-full border border-zinc-200/90 bg-white py-2 pl-9 pr-3 font-body text-sm text-zinc-900 placeholder:text-zinc-500 transition-all duration-300 focus:border-lime-500/50 focus:outline-none focus:ring-1 focus:ring-lime-500/30 dark:border-white/8 dark:bg-white/4 dark:text-[#F0EDE8] dark:placeholder:text-[#55555F] dark:focus:border-[#CDFF50]/40 dark:focus:bg-[#CDFF50]/5 dark:focus:ring-0"
          />
        </div>
      </div>

      {/* コンテスト一覧 */}
      {filteredData.length === 0 ? (
        <div className="w-full border border-zinc-200/80 bg-zinc-50/50 py-20 text-center dark:border-white/6 dark:bg-white/[0.02]">
          <div className="mb-6 flex justify-center text-zinc-500 dark:text-[#55555F]">
            <CustomIcon name="contest" size={64} />
          </div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.15em] text-zinc-600 dark:text-[#8A8A95]">
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
              className="mt-6 font-body text-xs uppercase tracking-[0.15em] text-lime-800 transition-colors duration-300 hover:text-lime-950 dark:text-[#CDFF50] dark:hover:text-[#CDFF50]/70"
            >
              フィルタをリセット
            </button>
          )}
        </div>
      ) : (
        <motion.div
          className="cq-contest-grid grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:gap-5"
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
