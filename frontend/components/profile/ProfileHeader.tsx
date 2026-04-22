import { CustomIcon } from '@/components/ui/custom-icon'

export function ProfileHeader() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-t-2xl sm:rounded-t-3xl p-6 sm:p-8 lg:p-10 text-center shadow-xl animate-fadeInUp">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 flex items-center justify-center gap-3">
        <CustomIcon name="user" size={48} className="brightness-0 invert" />
        プロフィール
      </h1>
      <p className="text-purple-100 text-base sm:text-lg">VRChat Photo Contest Platform</p>
    </div>
  )
}
