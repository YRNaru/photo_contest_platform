'use client'

import { useAuth } from '@/lib/auth'
import { useSidebar } from '@/lib/sidebar-context'
import { useTheme } from '@/lib/theme-context'
import { useEffect } from 'react'
import { LoginButton } from './LoginButton'
import { UserMenu } from './UserMenu'
import { Logo } from './header/Logo'
import { SidebarToggleButton } from './header/SidebarToggleButton'
import { ThemeToggleButton } from './header/ThemeToggleButton'
import { ContestDropdownMenu } from './header/ContestDropdownMenu'
import { SubmitDropdownMenu } from './header/SubmitDropdownMenu'
import { cn } from '@/lib/utils'

export function Header() {
  const { isAuthenticated, loadUser } = useAuth()
  const { isLeftOpen, isRightOpen, toggleLeft, toggleRight } = useSidebar()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'bg-white/80 backdrop-blur-xl dark:bg-[#0B0B0F]/80',
        'border-b border-black/10 dark:border-white/6',
        'shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]'
      )}
    >
      {/* アクセントラインアニメーション（ヘッダー下部） */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-lime-500/35 dark:via-[#CDFF50]/20 to-transparent" />

      <div
        className={cn(
          'relative z-10 flex w-full min-w-0 max-w-full items-center gap-4 py-3 sm:gap-6 sm:py-4 md:gap-8',
          'pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]'
        )}
      >
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-4">
          <SidebarToggleButton isOpen={isLeftOpen} onClick={toggleLeft} variant="left" />
          <Logo />
        </div>

        <nav
          className={cn(
            'nav-scroll flex min-w-0 flex-1 basis-0 items-center justify-end gap-2 overflow-x-auto overscroll-x-contain sm:gap-3 md:gap-6'
          )}
        >
          <ContestDropdownMenu isAuthenticated={isAuthenticated} />
          {isAuthenticated && <SubmitDropdownMenu />}
        </nav>

        <div className="flex shrink-0 items-center gap-4 sm:gap-6 md:gap-8">
          <div className="hidden items-center gap-2 md:flex md:gap-3">
            {isAuthenticated ? <UserMenu /> : <LoginButton />}
          </div>
          <ThemeToggleButton theme={theme} onClick={toggleTheme} />
        </div>
        <SidebarToggleButton isOpen={isRightOpen} onClick={toggleRight} variant="right" />
      </div>
    </header>
  )
}
