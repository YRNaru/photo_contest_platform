import { cn } from '@/lib/utils'
import { CustomIcon } from '../ui/custom-icon'

interface SubmitButtonProps {
  isSubmitting: boolean
  disabled?: boolean
}

export function SubmitButton({ isSubmitting, disabled = false }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className={cn(
        // ベース・レイアウト
        "w-full px-8 py-4 flex items-center justify-center gap-3",
        "rounded-2xl font-bold text-lg text-white",
        // グラデーション・アニメーション
        "bg-gradient-to-r from-purple-600 to-pink-600",
        "hover:from-purple-700 hover:to-pink-700",
        "shadow-xl hover:shadow-2xl transition-all duration-300 transform-gpu",
        // ホバーエフェクト
        "hover:scale-105",
        // 非アクティブエフェクト
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      )}
    >
      {isSubmitting ? (
        <>
          <CustomIcon name="wait" size={24} className="brightness-0 invert animate-spin" />
          投稿中...
        </>
      ) : (
        <>
          <CustomIcon name="rocket" size={24} className="brightness-0 invert" />
          投稿する
        </>
      )}
    </button>
  )
}
