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
              'h-auto w-full justify-start gap-3 rounded-xl border-0 bg-gradient-to-r from-red-500 to-red-600 py-3 font-bold text-white shadow-md hover:opacity-95 dark:from-red-600 dark:to-red-700'
            )}
          >
            <FaGoogle className="text-2xl" aria-hidden />
            Googleでログイン
          </Button>
        )}
        <Button
          type="button"
          onClick={handleTwitterLogin}
          className={cn(
            'h-auto w-full justify-start gap-3 rounded-xl border-0 bg-gradient-to-r from-sky-500 to-blue-600 py-3 font-bold text-white shadow-md hover:opacity-95 dark:from-sky-600 dark:to-blue-700'
          )}
        >
          <FaTwitter className="text-2xl" aria-hidden />
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
