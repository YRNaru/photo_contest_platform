'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown, LayoutGrid, Plus, Scale, Star } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ContestDropdownMenuProps {
  isAuthenticated: boolean
}

const contentPanelClass = cn(
  'min-w-[17rem] max-w-[min(100vw-1rem,20rem)] overflow-hidden p-1.5',
  'rounded-xl border border-border/70 bg-popover/95 text-popover-foreground shadow-lg',
  'shadow-purple-500/10 backdrop-blur-xl dark:border-white/10 dark:shadow-purple-500/20',
  'ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
)

const itemBaseClass = cn(
  'cursor-pointer gap-3 rounded-lg px-2.5 py-2.5 text-sm outline-none',
  'transition-[background-color,box-shadow,transform] duration-200',
  'hover:bg-gradient-to-r hover:shadow-sm',
  'focus-visible:bg-gradient-to-r focus-visible:shadow-sm',
  'data-[highlighted]:bg-gradient-to-r data-[highlighted]:shadow-sm',
  'active:scale-[0.99]'
)

function IconBadge({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10',
        'bg-gradient-to-br shadow-inner dark:border-white/5',
        className
      )}
    >
      {children}
    </span>
  )
}

function ContestNavItem({
  icon: Icon,
  label,
  onNavigate,
  gradientHover,
  iconWrapClass,
  iconClass,
}: {
  icon: LucideIcon
  label: string
  onNavigate: () => void
  gradientHover: string
  iconWrapClass: string
  iconClass: string
}) {
  return (
    <DropdownMenuItem
      onClick={onNavigate}
      className={cn(itemBaseClass, gradientHover)}
    >
      <IconBadge className={iconWrapClass}>
        <Icon className={cn('size-[18px]', iconClass)} strokeWidth={2} aria-hidden />
      </IconBadge>
      <span className="min-w-0 flex-1 font-medium leading-snug">{label}</span>
    </DropdownMenuItem>
  )
}

export function ContestDropdownMenu({ isAuthenticated }: ContestDropdownMenuProps) {
  const router = useRouter()

  return (
    <div className="relative hidden shrink-0 md:block">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'group inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5',
            'text-sm font-semibold text-foreground transition-all',
            'hover:bg-accent/80 hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'ring-offset-background data-popup-open:bg-accent/80'
          )}
        >
          コンテスト
          <ChevronDown className="size-4 opacity-70 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={6} className={contentPanelClass}>
          <ContestNavItem
            icon={LayoutGrid}
            label="すべてのコンテスト"
            onNavigate={() => router.push('/contests')}
            gradientHover={cn(
              'hover:from-cyan-500/12 hover:to-purple-500/8 dark:hover:from-cyan-500/18 dark:hover:to-purple-500/12',
              'focus-visible:from-cyan-500/12 focus-visible:to-purple-500/8',
              'dark:focus-visible:from-cyan-500/18 dark:focus-visible:to-purple-500/12',
              'data-[highlighted]:from-cyan-500/12 data-[highlighted]:to-purple-500/8',
              'dark:data-[highlighted]:from-cyan-500/18 dark:data-[highlighted]:to-purple-500/12'
            )}
            iconWrapClass="from-cyan-500/25 to-cyan-600/10 dark:from-cyan-400/20 dark:to-cyan-500/5"
            iconClass="text-cyan-600 dark:text-cyan-400"
          />
          {isAuthenticated && (
            <>
              <ContestNavItem
                icon={Star}
                label="マイコンテスト"
                onNavigate={() => router.push('/my-contests')}
                gradientHover={cn(
                  'hover:from-purple-500/12 hover:to-pink-500/8 dark:hover:from-purple-500/18 dark:hover:to-pink-500/10',
                  'focus-visible:from-purple-500/12 focus-visible:to-pink-500/8',
                  'dark:focus-visible:from-purple-500/18 dark:focus-visible:to-pink-500/10',
                  'data-[highlighted]:from-purple-500/12 data-[highlighted]:to-pink-500/8',
                  'dark:data-[highlighted]:from-purple-500/18 dark:data-[highlighted]:to-pink-500/10'
                )}
                iconWrapClass="from-purple-500/25 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-500/5"
                iconClass="text-purple-600 dark:text-purple-400"
              />
              <ContestNavItem
                icon={Scale}
                label="審査中のコンテスト"
                onNavigate={() => router.push('/judging-contests')}
                gradientHover={cn(
                  'hover:from-amber-500/12 hover:to-orange-500/8 dark:hover:from-amber-500/16 dark:hover:to-orange-500/10',
                  'focus-visible:from-amber-500/12 focus-visible:to-orange-500/8',
                  'dark:focus-visible:from-amber-500/16 dark:focus-visible:to-orange-500/10',
                  'data-[highlighted]:from-amber-500/12 data-[highlighted]:to-orange-500/8',
                  'dark:data-[highlighted]:from-amber-500/16 dark:data-[highlighted]:to-orange-500/10'
                )}
                iconWrapClass="from-amber-500/25 to-orange-500/10 dark:from-amber-400/18 dark:to-orange-500/5"
                iconClass="text-amber-700 dark:text-amber-400"
              />
              <DropdownMenuSeparator
                className={cn(
                  'my-1.5 h-px border-0 bg-gradient-to-r from-transparent via-border to-transparent',
                  'opacity-80'
                )}
              />
              <DropdownMenuItem
                onClick={() => router.push('/contests/create')}
                className={cn(
                  itemBaseClass,
                  'mt-0.5 gap-3 border border-transparent',
                  'hover:border-purple-500/25 hover:from-purple-500/15 hover:to-pink-500/12',
                  'dark:hover:border-purple-400/20 dark:hover:from-purple-500/20 dark:hover:to-pink-500/14',
                  'focus-visible:border-purple-500/25 focus-visible:from-purple-500/15 focus-visible:to-pink-500/12',
                  'dark:focus-visible:border-purple-400/20 dark:focus-visible:from-purple-500/20 dark:focus-visible:to-pink-500/14',
                  'data-[highlighted]:border-purple-500/25 data-[highlighted]:from-purple-500/15 data-[highlighted]:to-pink-500/12',
                  'dark:data-[highlighted]:border-purple-400/20 dark:data-[highlighted]:from-purple-500/20 dark:data-[highlighted]:to-pink-500/14'
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    'border border-purple-500/30 bg-gradient-to-br from-purple-500/35 to-pink-500/30',
                    'text-purple-700 shadow-inner dark:border-purple-400/25 dark:from-purple-500/40 dark:to-pink-500/35',
                    'dark:text-purple-200'
                  )}
                >
                  <Plus className="size-[18px]" strokeWidth={2.5} aria-hidden />
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text',
                    'font-semibold text-transparent dark:from-purple-300 dark:to-pink-300'
                  )}
                >
                  新しいコンテストを作成
                </span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
