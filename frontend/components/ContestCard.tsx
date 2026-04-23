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
          'relative h-full overflow-hidden flex flex-col',
          // ポートフォリオのwork-item風スタイル
          'border border-white/6 bg-[#16161E]',
          'transition-all duration-500',
          'hover:-translate-y-1.5 hover:border-white/12',
          'hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
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
          <div className={cn(
            'absolute inset-0 flex flex-col justify-end p-4',
            'bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/30 to-transparent',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-500'
          )}>
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-[#CDFF50] font-body">
              View Contest →
            </span>
          </div>
          {/* ホバー時のアクセントライン */}
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#CDFF50] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* コンテンツ */}
        <div className="relative flex flex-1 flex-col gap-3 p-5">
          {/* フェーズバッジとエントリー数 */}
          <div className="flex items-center justify-between gap-2">
            <PhaseBadge phase={contest.phase} />
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#8A8A95]">
              <span className="text-[#CDFF50]/70" aria-hidden>
                <CustomIcon name="camera" size={14} />
              </span>
              {contest.entry_count} 件
            </span>
          </div>

          {/* タイトル・説明 */}
          <div className="flex-1 space-y-1.5">
            <h3
              className={cn(
                'line-clamp-2 font-display font-bold text-base sm:text-lg',
                'text-[#F0EDE8] group-hover:text-[#CDFF50]',
                'transition-colors duration-300 tracking-wide uppercase'
              )}
            >
              {contest.title}
            </h3>
            <p className="line-clamp-2 text-xs sm:text-sm text-[#55555F] leading-relaxed font-body">
              {contest.description}
            </p>
          </div>

          {/* 日付（ポートフォリオのwork-meta風） */}
          <div className="mt-auto pt-3 border-t border-white/6">
            <ContestDates startAt={contest.start_at} endAt={contest.end_at} />
          </div>
        </div>
      </article>
    </Link>
  )
}
