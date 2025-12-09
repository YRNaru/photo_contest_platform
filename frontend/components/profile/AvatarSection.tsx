import { useRef } from 'react'
import { FaUpload, FaCheck } from 'react-icons/fa'
import Image from 'next/image'
import { User, SocialAccount } from '@/lib/types'

interface AvatarSectionProps {
  user: User
  avatarPreview: string | null
  uploading: boolean
  uploadSuccess: boolean
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSetTwitterIcon: () => void
  twitterAccount?: SocialAccount
}

export function AvatarSection({
  user,
  avatarPreview,
  uploading,
  uploadSuccess,
  onFileSelect,
  onSetTwitterIcon,
  twitterAccount,
}: AvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mb-8 animate-fadeInUp">
      <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
        📸 プロフィール画像
      </h2>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* アバター表示 */}
        <div className="relative group">
          <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-purple-500 dark:border-purple-600 shadow-xl group-hover:scale-105 transition-transform duration-300">
            {avatarPreview || user.avatar_url ? (
              <div className="relative w-full h-full">
                <Image
                  src={avatarPreview || user.avatar_url || ''}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center text-white text-6xl sm:text-7xl lg:text-8xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="animate-spin text-white text-4xl">⏳</div>
            </div>
          )}
          {uploadSuccess && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg animate-fadeInUp">
              <FaCheck size={20} />
            </div>
          )}
        </div>

        {/* アップロードボタン */}
        <div className="flex-1 w-full space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaUpload className="text-xl" />
            <span>{uploading ? 'アップロード中...' : '画像をアップロード'}</span>
          </button>

          {twitterAccount?.profile_image_url && (
            <button
              onClick={onSetTwitterIcon}
              disabled={uploading}
              className="w-full flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-lg overflow-hidden">
                <Image
                  src={twitterAccount.profile_image_url}
                  alt="Twitter"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="font-black text-base sm:text-lg">Twitterアイコンを使用</div>
                <div className="text-xs text-blue-100">@{twitterAccount.username}</div>
              </div>
            </button>
          )}

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
            推奨サイズ: 512x512px 以上 | 形式: JPG, PNG, WEBP
          </p>
        </div>
      </div>
    </div>
  )
}
