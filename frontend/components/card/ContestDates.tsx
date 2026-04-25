import { formatDate } from '@/lib/utils'

interface ContestDatesProps {
  startAt: string
  endAt: string
}

export function ContestDates({ startAt, endAt }: ContestDatesProps) {
  return (
    <div className="space-y-1.5 font-body text-xs">
      <div className="flex items-center gap-2 text-zinc-500 dark:text-[#55555F]">
        <span className="inline-block h-px w-3 flex-shrink-0 bg-lime-500/50 dark:bg-[#CDFF50]/50" />
        <span className="tracking-wide text-zinc-600 dark:text-[#8A8A95]">開始</span>
        <span className="ml-auto truncate text-zinc-700 dark:text-[#8A8A95]">{formatDate(startAt)}</span>
      </div>
      <div className="flex items-center gap-2 text-zinc-500 dark:text-[#55555F]">
        <span className="inline-block h-px w-3 flex-shrink-0 bg-zinc-300 dark:bg-white/20" />
        <span className="tracking-wide text-zinc-600 dark:text-[#55555F]">終了</span>
        <span className="ml-auto truncate text-zinc-700 dark:text-[#55555F]">{formatDate(endAt)}</span>
      </div>
    </div>
  )
}
