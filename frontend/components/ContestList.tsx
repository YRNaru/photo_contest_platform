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
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                phase === option
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-muted text-foreground/80 hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {option === 'all' ? 'すべて' : getPhaseLabel(option)}
            </button>
          ))}
        </div>

        {/* 検索ボックス */}
        <div className="relative flex-1 sm:max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <CustomIcon name="search" size={16} />
          </div>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value || null)}
            placeholder="コンテストを検索..."
            className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-1.5 text-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* コンテスト一覧 */}
      {filteredData.length === 0 ? (
        <div className="w-full min-w-0 max-w-full rounded-3xl border border-white/20 bg-white/5 p-8 text-center backdrop-blur-xl dark:border-white/10 dark:bg-black/20 sm:p-20 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <CustomIcon name="contest" size={96} className="opacity-70 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            </div>
            <p className="text-balance text-lg font-bold text-foreground sm:text-xl tracking-wider">
              {phase !== 'all' || search
                ? 'SYS.ERROR: CONDITIONS NOT MET (条件に一致するコンテストが見つかりません)'
                : 'SYS.STANDBY: NO ACTIVE CONTESTS (現在開催中のコンテストはありません)'}
            </p>
            {(phase !== 'all' || search) && (
              <button
                onClick={() => {
                  setPhase(null)
                  setSearch(null)
                }}
                className="mt-6 text-sm text-cyan-400 underline hover:text-cyan-300 transition-colors drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]"
              >
                [ RESET_FILTERS ]
              </button>
            )}
            {!search && phase === 'all' && (
              <p className="mt-4 text-balance text-sm text-foreground/60 font-medium">
                新しいコンテストをお楽しみに！
              </p>
            )}
          </div>
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
