import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleButtonProps {
  theme: string
  onClick: () => void
}

export function ThemeToggleButton({ theme, onClick }: ThemeToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
      className={cn(
        'shrink-0 flex items-center justify-center w-9 h-9 rounded-lg',
        'border border-white/8 bg-white/4',
        'text-[#8A8A95] hover:text-[#CDFF50] hover:border-[#CDFF50]/30 hover:bg-[#CDFF50]/5',
        'transition-all duration-300'
      )}
    >
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  )
}
