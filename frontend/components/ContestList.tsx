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
      <div className="cq-contest-grid grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:gap-5">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-none bg-white/4 border border-white/6" />
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
              className={`px-3 py-1.5 text-xs font-body font-medium tracking-[0.1em] uppercase border transition-all duration-300 ${
                phase === option
                  ? 'border-[#CDFF50]/50 bg-[#CDFF50]/10 text-[#CDFF50]'
                  : 'border-white/8 bg-white/4 text-[#8A8A95] hover:border-white/15 hover:text-[#F0EDE8]'
              }`}
            >
              {option === 'all' ? 'All' : getPhaseLabel(option)}
            </button>
          ))}
        </div>

        {/* 検索ボックス */}
        <div className="relative flex-1 sm:max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#55555F] pointer-events-none">
            <CustomIcon name="search" size={14} />
          </div>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value || null)}
            placeholder="コンテストを検索..."
            className="w-full border border-white/8 bg-white/4 text-[#F0EDE8] placeholder:text-[#55555F] pl-9 pr-3 py-2 text-sm font-body transition-all duration-300 focus:border-[#CDFF50]/40 focus:outline-none focus:bg-[#CDFF50]/5"
          />
        </div>
      </div>

      {/* コンテスト一覧 */}
      {filteredData.length === 0 ? (
        <div className="w-full border border-white/6 bg-white/[0.02] py-20 text-center">
          <div className="flex justify-center mb-6 text-[#55555F]">
            <CustomIcon name="contest" size={64} />
          </div>
          <p className="font-display font-bold text-sm uppercase tracking-[0.15em] text-[#8A8A95]">
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
              className="mt-6 text-xs tracking-[0.15em] uppercase text-[#CDFF50] hover:text-[#CDFF50]/70 transition-colors duration-300 font-body"
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
