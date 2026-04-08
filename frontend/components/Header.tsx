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

export function Header() {
  const { isAuthenticated, loadUser } = useAuth()
  const { isLeftOpen, isRightOpen, toggleLeft, toggleRight } = useSidebar()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <header className="sticky top-0 z-50 overflow-x-clip border-b border-border bg-background/85 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-background/70">
      <div className="content-container flex min-w-0 items-center justify-between gap-2 py-3 animate-fadeInUp sm:py-4">
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
