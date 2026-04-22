'use client'

import type { ReactNode } from 'react'
import { FaGoogle, FaTwitter } from 'react-icons/fa'
import { getBackendBaseUrl } from '@/lib/backend-url'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface LoginButtonProps {
  variant?: 'default' | 'sidebar'
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

export function LoginButton({ variant = 'default' }: LoginButtonProps) {
  const handleGoogleLogin = () => {
    const backendUrl = getBackendBaseUrl()
    window.location.href = `${backendUrl}/accounts/google/login/`
  }

  const handleTwitterLogin = () => {
    const backendUrl = getBackendBaseUrl()
    window.location.href = `${backendUrl}/accounts/twitter_oauth2/login/`
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-3">
        {process.env.NODE_ENV !== 'production' && (
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className={cn(
                'h-auto w-full justify-start gap-3 rounded-xl border py-3 font-bold shadow-sm dark:shadow-md hover:-translate-y-0.5 transition-all duration-300 transform-gpu backdrop-blur-md',
                'border-red-300 dark:border-white/20 bg-red-50/80 dark:bg-black/40 text-red-800 dark:text-white',
                'hover:border-red-400 dark:hover:border-red-500/50 hover:bg-red-100 dark:hover:bg-red-950/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] dark:hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:text-red-900 dark:hover:text-white'
              )}
            >
              <FaGoogle className="text-2xl text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.3)] dark:drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" aria-hidden />
              Googleでログイン
            </Button>
          )}
          <Button
            type="button"
            onClick={handleTwitterLogin}
            className={cn(
              'h-auto w-full justify-start gap-3 rounded-xl border py-3 font-bold shadow-sm dark:shadow-md hover:-translate-y-0.5 transition-all duration-300 transform-gpu backdrop-blur-md',
              'border-sky-300 dark:border-white/20 bg-sky-50/80 dark:bg-black/40 text-sky-800 dark:text-white',
              'hover:border-sky-400 dark:hover:border-sky-500/50 hover:bg-sky-100 dark:hover:bg-sky-950/40 hover:shadow-[0_0_15px_rgba(14,165,233,0.15)] dark:hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:text-sky-900 dark:hover:text-white'
            )}
          >
            <FaTwitter className="text-2xl text-sky-500 drop-shadow-[0_0_5px_rgba(14,165,233,0.3)] dark:drop-shadow-[0_0_5px_rgba(14,165,233,0.8)]" aria-hidden />
            Twitterでログイン
          </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ size: 'lg' }),
          'font-semibold text-base',
          'inline-flex shrink-0 items-center whitespace-nowrap',
          'data-popup-open:opacity-95'
        )}
      >
        ログイン
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        positionMethod="fixed"
        collisionAvoidance={{
          side: "flip",
          align: "none",
          fallbackAxisSide: "none",
        }}
        className={contentPanelClass}
      >
        <DropdownMenuItem
          onClick={handleGoogleLogin}
          className={cn(
            itemBaseClass,
            'hover:from-red-500/12 hover:to-orange-500/8 dark:hover:from-red-500/18 dark:hover:to-orange-500/10',
            'focus-visible:from-red-500/12 focus-visible:to-orange-500/8',
            'dark:focus-visible:from-red-500/18 dark:focus-visible:to-orange-500/10',
            'data-[highlighted]:from-red-500/12 data-[highlighted]:to-orange-500/8',
            'dark:data-[highlighted]:from-red-500/18 dark:data-[highlighted]:to-orange-500/10'
          )}
        >
          <IconBadge className="from-red-500/30 to-red-600/10 dark:from-red-400/25 dark:to-red-500/5">
            <FaGoogle className="size-[18px] text-red-600 dark:text-red-400" aria-hidden />
          </IconBadge>
          <span className="min-w-0 flex-1 font-medium leading-snug">Googleでログイン</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleTwitterLogin}
          className={cn(
            itemBaseClass,
            'hover:from-sky-500/12 hover:to-cyan-500/8 dark:hover:from-sky-500/18 dark:hover:to-cyan-500/12',
            'focus-visible:from-sky-500/12 focus-visible:to-cyan-500/8',
            'dark:focus-visible:from-sky-500/18 dark:focus-visible:to-cyan-500/12',
            'data-[highlighted]:from-sky-500/12 data-[highlighted]:to-cyan-500/8',
            'dark:data-[highlighted]:from-sky-500/18 dark:data-[highlighted]:to-cyan-500/12'
          )}
        >
          <IconBadge className="from-sky-500/30 to-sky-600/10 dark:from-sky-400/25 dark:to-cyan-500/5">
            <FaTwitter className="size-[18px] text-sky-600 dark:text-sky-400" aria-hidden />
          </IconBadge>
          <span className="min-w-0 flex-1 font-medium leading-snug">Twitterでログイン</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
