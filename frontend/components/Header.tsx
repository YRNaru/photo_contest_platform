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
    <header className={cn(
      "sticky top-0 z-50 overflow-x-clip border-b shadow-sm",
      "bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40",
      "border-white/20 dark:border-white/10 dark:bg-black/60"
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 pointer-events-none" />

      <div className={cn(
        "content-container relative z-10 flex min-w-0 items-center justify-between",
        "gap-2 py-3 sm:py-4 animate-fadeInUp"
      )}>
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <SidebarToggleButton isOpen={isLeftOpen} onClick={toggleLeft} variant="left" />
          <Logo />
        </div>

        <nav className="nav-scroll flex shrink-0 items-center gap-2 overflow-x-auto sm:gap-3 md:gap-6">
          <ContestDropdownMenu isAuthenticated={isAuthenticated} />
          {isAuthenticated && <SubmitDropdownMenu />}
          <ThemeToggleButton theme={theme} onClick={toggleTheme} />
          <div className="hidden shrink-0 md:block">{isAuthenticated ? <UserMenu /> : <LoginButton />}</div>
          <SidebarToggleButton isOpen={isRightOpen} onClick={toggleRight} variant="right" />
        </nav>
      </div>
    </header>
  )
}
