import { CustomIcon } from '../ui/custom-icon'

interface EntryLimitInfoProps {
  maxEntriesPerUser: number
  currentEntriesCount: number
}

export function EntryLimitInfo({ maxEntriesPerUser, currentEntriesCount }: EntryLimitInfoProps) {
  return (
    <div
      className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-red-700 rounded-xl animate-fadeInUp"
      style={{ animationDelay: '50ms' }}
    >
      <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-2">
        <CustomIcon name="hint" size={20} />
        <span>
          このコンテストへの投稿可能数: <span className="text-lg">{maxEntriesPerUser}</span>件
          {currentEntriesCount > 0 && (
            <span className="ml-2 text-blue-700 dark:text-blue-300">
              （現在 <span className="font-bold text-lg">{currentEntriesCount}</span>件投稿済み）
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
