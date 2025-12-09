import { User } from '@/lib/types'

interface BasicInfoSectionProps {
  user: User
}

export function BasicInfoSection({ user }: BasicInfoSectionProps) {
  return (
    <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
      <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
        ℹ️ 基本情報
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
          <span className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-bold mb-2 block">
            👤 ユーザー名
          </span>
          <span className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold">
            {user.username}
          </span>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-bold mb-2 block">
            📧 メールアドレス
          </span>
          <span className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold truncate block">
            {user.email}
          </span>
        </div>
        {(user.first_name || user.last_name) && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-800">
            <span className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-bold mb-2 block">
              🏷️ 名前
            </span>
            <span className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold">
              {user.first_name} {user.last_name}
            </span>
          </div>
        )}
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <span className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 font-bold mb-2 block">
            ⭐ 権限
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {user.is_superuser && (
              <span className="px-3 sm:px-4 py-1 bg-yellow-400 text-gray-900 rounded-full text-xs sm:text-sm font-semibold">
                🔑 スーパーユーザー
              </span>
            )}
            {!user.is_superuser && user.is_staff && (
              <span className="px-3 sm:px-4 py-1 bg-green-500 text-white rounded-full text-xs sm:text-sm font-semibold">
                ⚙️ スタッフ
              </span>
            )}
            {!user.is_superuser && !user.is_staff && (
              <span className="px-3 sm:px-4 py-1 bg-blue-500 text-white rounded-full text-xs sm:text-sm font-semibold">
                👤 一般ユーザー
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
