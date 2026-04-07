import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarToggleButtonProps {
  isOpen: boolean
  onClick: () => void
  variant: 'left' | 'right'
}

export function SidebarToggleButton({ isOpen, onClick, variant }: SidebarToggleButtonProps) {
  const isLeft = variant === 'left'
  const gradient = isLeft
    ? 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/25'
    : 'from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 shadow-pink-500/25'

  const title = isLeft
    ? isOpen
      ? 'メニューを閉じる'
      : 'メニューを開く'
    : isOpen
      ? 'サイドパネルを閉じる'
      : 'サイドパネルを開く'

  const label = isLeft ? (isOpen ? '閉じる' : 'メニュー') : isOpen ? '閉じる' : 'パネル'

  return (
    <Button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'h-auto gap-2 rounded-xl border-0 bg-gradient-to-r px-3 py-2 text-white shadow-lg hover:opacity-95 sm:px-4 sm:py-2.5',
        gradient
      )}
    >
      {isLeft && (
        <svg
          className={cn('size-4 shrink-0 transition-transform sm:size-5', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      )}
      <span className="hidden text-xs font-semibold md:inline sm:text-sm">{label}</span>
      {!isLeft && (
        <svg
          className={cn('size-4 shrink-0 transition-transform sm:size-5', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2m4-12h2a2 2 0 012 2v10a2 2 0 01-2 2h-2m-4-12v12m0 0l3-3m-3 3l-3-3"
            />
          )}
        </svg>
      )}
    </Button>
  )
}
