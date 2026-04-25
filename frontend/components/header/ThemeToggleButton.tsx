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
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
        'border border-black/10 bg-black/[0.04] text-muted-foreground',
        'hover:border-lime-500/40 hover:bg-lime-500/10 hover:text-lime-800',
        'dark:border-white/8 dark:bg-white/4 dark:text-[#8A8A95]',
        'dark:hover:border-[#CDFF50]/30 dark:hover:bg-[#CDFF50]/5 dark:hover:text-[#CDFF50]',
        'transition-all duration-300'
      )}
    >
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  )
}
