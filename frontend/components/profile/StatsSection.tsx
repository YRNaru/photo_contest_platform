import { CustomIcon } from '@/components/ui/custom-icon'
import { User } from '@/lib/types'

interface StatsSectionProps {
  user: User
}

export function StatsSection({ user }: StatsSectionProps) {
  if (user.entry_count === undefined && user.vote_count === undefined) {
    return null
  }

  return (
    <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
      <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <CustomIcon name="support" size={32} />
        統計情報
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {user.entry_count !== undefined && (
          <div className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-4 sm:p-6 lg:p-8 text-center border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-purple-700 dark:text-purple-400 group-hover:scale-110 transition-transform">
              {user.entry_count}
            </div>
            <div className="text-gray-700 dark:text-gray-300 mt-2 font-semibold text-sm sm:text-base flex items-center justify-center gap-2">
              <CustomIcon name="camera" size={24} />
              エントリー数
            </div>
          </div>
        )}
        {user.vote_count !== undefined && (
          <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-4 sm:p-6 lg:p-8 text-center border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-indigo-700 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              {user.vote_count}
            </div>
            <div className="text-gray-700 dark:text-gray-300 mt-2 font-semibold text-sm sm:text-base flex items-center justify-center gap-2">
              <CustomIcon name="star" size={24} />
              投票数
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
