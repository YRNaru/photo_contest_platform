import { formatDate } from '@/lib/utils'

interface ContestDatesProps {
  startAt: string
  endAt: string
}

export function ContestDates({ startAt, endAt }: ContestDatesProps) {
  return (
    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span className="text-green-600 dark:text-green-400">🟢</span>
        <span className="font-semibold">開始:</span>
        <span className="truncate">{formatDate(startAt)}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span className="text-red-600 dark:text-red-400">🔴</span>
        <span className="font-semibold">終了:</span>
        <span className="truncate">{formatDate(endAt)}</span>
      </div>
    </div>
  )
}
