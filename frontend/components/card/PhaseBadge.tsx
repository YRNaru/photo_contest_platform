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
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] font-bold font-body tracking-[0.12em] uppercase',
        'border rounded-sm',
        isActive
          ? 'border-[#CDFF50]/40 bg-[#CDFF50]/10 text-[#CDFF50]'
          : isUpcoming
            ? 'border-[#8A8A95]/30 bg-white/4 text-[#8A8A95]'
            : 'border-white/10 bg-white/4 text-[#55555F]'
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
