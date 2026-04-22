import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ThemeToggleButtonProps {
  theme: string
  onClick: () => void
}

export function ThemeToggleButton({ theme, onClick }: ThemeToggleButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-lg"
      className="shrink-0 rounded-xl border-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md hover:opacity-90 dark:from-indigo-600 dark:to-purple-600"
      onClick={onClick}
      title={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
    >
      {theme === 'light' ? <Moon className="size-5 sm:size-6" /> : <Sun className="size-5 sm:size-6" />}
    </Button>
  )
}
