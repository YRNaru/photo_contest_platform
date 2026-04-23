import { formatDate } from '@/lib/utils'

interface ContestDatesProps {
  startAt: string
  endAt: string
}

export function ContestDates({ startAt, endAt }: ContestDatesProps) {
  return (
    <div className="space-y-1.5 text-xs font-body">
      <div className="flex items-center gap-2 text-[#55555F]">
        <span className="inline-block w-3 h-px bg-[#CDFF50]/50 flex-shrink-0" />
        <span className="text-[#8A8A95] tracking-wide">開始</span>
        <span className="ml-auto truncate text-[#8A8A95]">{formatDate(startAt)}</span>
      </div>
      <div className="flex items-center gap-2 text-[#55555F]">
        <span className="inline-block w-3 h-px bg-white/20 flex-shrink-0" />
        <span className="text-[#55555F] tracking-wide">終了</span>
        <span className="ml-auto truncate text-[#55555F]">{formatDate(endAt)}</span>
      </div>
    </div>
  )
}
