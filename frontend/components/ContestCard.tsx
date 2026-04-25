import Link from 'next/link'
import { ContestBanner } from './card/ContestBanner'
import { PhaseBadge } from './card/PhaseBadge'
import { ContestDates } from './card/ContestDates'
import { CustomIcon } from '@/components/ui/custom-icon'
import { cn } from '@/lib/utils'

interface Contest {
  slug: string
  title: string
  description: string
  banner_image?: string
  start_at: string
  end_at: string
  phase: string
  entry_count: number
}

interface ContestCardProps {
  contest: Contest
  priority?: boolean
}

export function ContestCard({ contest, priority = false }: ContestCardProps) {
  return (
    <Link href={`/contests/${contest.slug}`} className="group block h-full">
      <article
        className={cn(
          'relative flex h-full flex-col overflow-hidden',
          'border border-zinc-200/90 bg-white shadow-sm dark:border-white/6 dark:bg-[#16161E] dark:shadow-none',
          'transition-all duration-500',
          'hover:-translate-y-1.5 hover:border-zinc-300/90 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]',
          'dark:hover:border-white/12 dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
        )}
      >
        {/* バナー画像エリア */}
        <div className="relative overflow-hidden" data-cursor="view">
          <ContestBanner
            bannerImage={contest.banner_image}
            title={contest.title}
            priority={priority}
          />
          {/* ホバー時のオーバーレイ（ポートフォリオのwork-overlay風） */}
          <div
            className={cn(
              'absolute inset-0 flex flex-col justify-end p-4',
              'bg-gradient-to-t from-zinc-900/50 via-zinc-900/15 to-transparent',
              'opacity-0 transition-opacity duration-500 group-hover:opacity-100',
              'dark:from-[#0B0B0F] dark:via-[#0B0B0F]/30'
            )}
          >
            <span className="font-body text-xs font-medium uppercase tracking-[0.15em] text-lime-200 dark:text-[#CDFF50]">
              View Contest →
            </span>
          </div>
          {/* ホバー時のアクセントライン */}
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-lime-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:via-[#CDFF50]" />
        </div>

        {/* コンテンツ */}
        <div className="relative flex flex-1 flex-col gap-3 p-5">
          {/* フェーズバッジとエントリー数 */}
          <div className="flex items-center justify-between gap-2">
            <PhaseBadge phase={contest.phase} />
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-[#8A8A95]">
              <span className="text-lime-700 dark:text-[#CDFF50]/70" aria-hidden>
                <CustomIcon name="camera" size={14} />
              </span>
              {contest.entry_count} 件
            </span>
          </div>

          {/* タイトル・説明 */}
          <div className="flex-1 space-y-1.5">
            <h3
              className={cn(
                'line-clamp-2 font-display text-base font-bold uppercase tracking-wide sm:text-lg',
                'text-zinc-900 transition-colors duration-300 group-hover:text-lime-800',
                'dark:text-[#F0EDE8] dark:group-hover:text-[#CDFF50]'
              )}
            >
              {contest.title}
            </h3>
            <p className="line-clamp-2 font-body text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-[#55555F]">
              {contest.description}
            </p>
          </div>

          {/* 日付（ポートフォリオのwork-meta風） */}
          <div className="mt-auto border-t border-zinc-200/90 pt-3 dark:border-white/6">
            <ContestDates startAt={contest.start_at} endAt={contest.end_at} />
          </div>
        </div>
      </article>
    </Link>
  )
}
