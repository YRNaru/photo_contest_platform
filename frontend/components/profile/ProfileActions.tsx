import { User, SocialAccount } from '@/lib/types'

interface ProfileActionsProps {
  user: User
  twitterAccount?: SocialAccount
  googleAccount?: SocialAccount
  onLogout: () => void
}

export function ProfileActions({
  user,
  twitterAccount,
  googleAccount,
  onLogout,
}: ProfileActionsProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeInUp"
      style={{ animationDelay: '250ms' }}
    >
      {user.is_staff && (
        <a
          href="http://localhost:18000/admin/"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 sm:py-4 px-6 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl text-center flex items-center justify-center gap-2"
        >
          <span className="text-xl group-hover:scale-125 transition-transform">⚙️</span>
          管理画面へ
        </a>
      )}

      {!twitterAccount && (
        <a
          href="http://localhost:18000/accounts/twitter_oauth2/login/"
          className="group bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400 py-3 sm:py-4 px-6 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
        >
          <span className="text-xl group-hover:scale-125 transition-transform">𝕏</span>
          Twitter を連携
        </a>
      )}

      {!googleAccount && (
        <a
          href="http://localhost:18000/accounts/google/login/"
          className="group bg-white dark:bg-gray-800 border-2 border-red-500 dark:border-red-600 text-red-600 dark:text-red-400 py-3 sm:py-4 px-6 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
        >
          <span className="text-xl group-hover:scale-125 transition-transform">🔵</span>
          Google を連携
        </a>
      )}

      <button
        onClick={onLogout}
        className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 sm:py-4 px-6 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 sm:col-span-2"
      >
        <span className="text-xl group-hover:scale-125 transition-transform">🚪</span>
        ログアウト
      </button>
    </div>
  )
}
