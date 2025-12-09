import { SocialAccount } from '@/lib/types'
import Image from 'next/image'

interface SocialAccountsSectionProps {
  twitterAccount?: SocialAccount
  googleAccount?: SocialAccount
}

export function SocialAccountsSection({
  twitterAccount,
  googleAccount,
}: SocialAccountsSectionProps) {
  return (
    <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
      <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
        🔗 ソーシャルアカウント連携
      </h2>

      {twitterAccount && (
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-2xl p-4 sm:p-6 mb-4 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center mb-4">
            {twitterAccount.profile_image_url ? (
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full mr-4 border-2 border-blue-400 shadow-lg overflow-hidden">
                <Image
                  src={twitterAccount.profile_image_url}
                  alt="Twitter"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl mr-4 shadow-lg">
                𝕏
              </div>
            )}
            <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400">
              Twitter (X)
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">ユーザー名:</span>
              <span className="text-gray-900 dark:text-gray-100 font-bold">
                @{twitterAccount.username}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">User ID:</span>
              <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                {twitterAccount.uid}
              </span>
            </div>
          </div>
        </div>
      )}

      {googleAccount && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-2 border-red-400 dark:border-red-600 rounded-2xl p-4 sm:p-6 mb-4 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center mb-4">
            {googleAccount.picture ? (
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full mr-4 border-2 border-red-400 shadow-lg overflow-hidden">
                <Image
                  src={googleAccount.picture}
                  alt="Google"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-2xl mr-4 shadow-lg">
                G
              </div>
            )}
            <div className="text-lg sm:text-xl font-black text-red-600 dark:text-red-400">
              Google
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {googleAccount.name && (
              <div className="flex flex-col">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">名前:</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold">
                  {googleAccount.name}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">User ID:</span>
              <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                {googleAccount.uid}
              </span>
            </div>
          </div>
        </div>
      )}

      {!twitterAccount && !googleAccount && (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <span className="text-5xl mb-4 block opacity-50">🔗</span>
          <p className="text-gray-500 dark:text-gray-400 italic text-sm sm:text-base">
            まだソーシャルアカウントが連携されていません。
          </p>
        </div>
      )}
    </div>
  )
}
