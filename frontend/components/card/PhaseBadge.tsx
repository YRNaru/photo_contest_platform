import { getPhaseLabel, cn } from '@/lib/utils'

interface PhaseBadgeProps {
  phase: string
}

/** フェーズに応じたライムグリーン系バッジ（ポートフォリオのstat-itemラインスタイル参考） */
export function PhaseBadge({ phase }: PhaseBadgeProps) {
  const isActive = phase === 'submission' || phase === 'voting'
  const isUpcoming = phase === 'upcoming'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-body text-[0.65rem] font-bold uppercase tracking-[0.12em]',
        isActive
          ? 'border-lime-600/50 bg-lime-100 text-lime-900 dark:border-[#CDFF50]/40 dark:bg-[#CDFF50]/10 dark:text-[#CDFF50]'
          : isUpcoming
            ? 'border-zinc-300/90 bg-zinc-100/90 text-zinc-700 dark:border-[#8A8A95]/30 dark:bg-white/4 dark:text-[#8A8A95]'
            : 'border-zinc-200/90 bg-zinc-50/90 text-zinc-600 dark:border-white/10 dark:bg-white/4 dark:text-[#55555F]'
      )}
    >
      {isActive && (
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#CDFF50] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#CDFF50]" />
        </span>
      )}
      {getPhaseLabel(phase)}
    </span>
  )
}
