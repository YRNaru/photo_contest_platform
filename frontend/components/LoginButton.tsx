'use client'

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
      <DropdownMenuTrigger className={cn(buttonVariants(), 'font-semibold')}>
        ログイン
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleGoogleLogin}>
          <FaGoogle className="text-red-500" />
          Googleでログイン
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterLogin}>
          <FaTwitter className="text-sky-500" />
          Twitterでログイン
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
