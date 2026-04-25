'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useSidebar } from '@/lib/sidebar-context'
import { LoginButton } from './LoginButton'
import { CustomIcon } from './ui/custom-icon'
import { cn } from '@/lib/utils'

export function LeftSidebar() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()
  const { isLeftOpen } = useSidebar()

  const menuItems = [
    { href: '/', label: 'ホーム', icon: <CustomIcon name="home" size={20} /> },
    { href: '/contests', label: 'コンテスト', icon: <CustomIcon name="contest" size={20} /> },
    { href: '/calendar', label: 'カレンダー', icon: <CustomIcon name="calendar" size={20} /> },
    { href: '/features', label: '機能一覧', icon: <CustomIcon name="features" size={20} /> },
    ...(isAuthenticated
      ? [
          { href: '/my-contests', label: 'マイコンテスト', icon: <CustomIcon name="my-contests" size={20} /> },
          { href: '/judging-contests', label: '審査中', icon: <CustomIcon name="judge" size={20} /> },
          { href: '/submit', label: '写真を投稿', icon: <CustomIcon name="camera" size={20} /> },
          { href: '/my-entries', label: 'マイ投稿', icon: <CustomIcon name="camera" size={20} /> },
          ...(user?.is_moderator || user?.is_staff
            ? [{ href: '/pending-entries', label: '承認待ち', icon: <CustomIcon name="rule" size={20} /> }]
            : []),
          { href: '/profile', label: 'プロフィール', icon: <CustomIcon name="user" size={20} /> },
        ]
      : []),
  ]

  return (
    <aside
      className={cn(
        'sticky top-16 z-40 h-[calc(100vh-4rem)]',
        'border-r border-black/10 dark:border-white/6',
        'bg-white/70 backdrop-blur-2xl dark:bg-[#111116]/80',
        'shadow-[4px_0_24px_rgba(0,0,0,0.04)] dark:shadow-none',
        'transition-all duration-700 ease-out max-xl:hidden',
        isLeftOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'
      )}
    >
      <nav
        className={cn(
          'h-full overflow-y-auto overflow-x-hidden p-4 space-y-1.5 scrollbar-custom',
          'transition-all duration-700 delay-150',
          isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        )}
      >
        {/* サイドバーヘッダー */}
        <div
          className="mb-5 border-b border-black/10 pb-4 transition-all duration-500 dark:border-white/6"
          style={{
            transitionDelay: isLeftOpen ? '150ms' : '0ms',
            opacity: isLeftOpen ? 1 : 0,
            transform: isLeftOpen ? 'translateX(0)' : 'translateX(-20px)',
          }}
        >
          <h2 className="flex items-center gap-2 font-body text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-lime-700 dark:text-[#CDFF50]">
            <span className="inline-block h-px w-4 bg-lime-600 dark:bg-[#CDFF50]" />
            Navigation
          </h2>
        </div>

        {/* メニューアイテム */}
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                transitionDelay: isLeftOpen ? `${150 + index * 60}ms` : '0ms',
              }}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-4 py-2.5',
                'font-body text-sm transition-all duration-400',
                isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0',
                isActive
                  ? 'border border-lime-500/40 bg-lime-500/10 font-semibold text-lime-900 dark:border-[#CDFF50]/30 dark:bg-[#CDFF50]/10 dark:text-[#CDFF50]'
                  : 'border border-transparent text-zinc-600 hover:border-zinc-200/90 hover:bg-zinc-100/90 hover:text-zinc-950 dark:text-[#8A8A95] dark:hover:border-white/8 dark:hover:bg-white/4 dark:hover:text-[#F0EDE8]'
              )}
            >
              <span
                className={cn(
                  'flex-shrink-0 transition-colors duration-300',
                  isActive
                    ? 'text-lime-700 dark:text-[#CDFF50]'
                    : 'text-zinc-500 group-hover:text-lime-700 dark:text-[#55555F] dark:group-hover:text-[#CDFF50]'
                )}
              >
                {item.icon}
              </span>
              <span className="font-medium tracking-wide">{item.label}</span>
              {isActive && (
                <span className="ml-auto inline-block h-4 w-1 rounded-full bg-lime-500 dark:bg-[#CDFF50]" />
              )}
            </Link>
          )
        })}

        {/* 未ログイン時のCTA */}
        {!isAuthenticated && (
          <div
            className="mt-6 border-t border-black/10 pt-4 transition-all duration-500 dark:border-white/6"
            style={{
              transitionDelay: isLeftOpen ? `${150 + menuItems.length * 60}ms` : '0ms',
              opacity: isLeftOpen ? 1 : 0,
              transform: isLeftOpen ? 'translateX(0)' : 'translateX(-20px)',
            }}
          >
            <LoginButton variant="sidebar" />
          </div>
        )}

        {/* ログイン時のCTA */}
        {isAuthenticated && (
          <>
            <div
              className="my-5 border-t border-black/10 transition-all duration-500 dark:border-white/6"
              style={{
                transitionDelay: isLeftOpen ? `${150 + menuItems.length * 60}ms` : '0ms',
                opacity: isLeftOpen ? 1 : 0,
              }}
            />

            <div className="space-y-2">
              {/* コンテスト作成 */}
              <Link
                href="/contests/create"
                style={{
                  transitionDelay: isLeftOpen ? `${150 + (menuItems.length + 1) * 60}ms` : '0ms',
                }}
                className={cn(
                  'group relative flex items-center gap-3 overflow-hidden rounded-lg px-4 py-2.5',
                  'border border-lime-500/35 bg-lime-500/[0.07] text-lime-900',
                  'hover:border-lime-500/50 hover:bg-lime-500/12 hover:shadow-[0_0_20px_rgba(132,204,22,0.12)]',
                  'dark:border-[#CDFF50]/20 dark:bg-[#CDFF50]/5 dark:text-[#CDFF50]',
                  'dark:hover:border-[#CDFF50]/40 dark:hover:bg-[#CDFF50]/10 dark:hover:shadow-[0_0_20px_rgba(205,255,80,0.1)]',
                  'font-body text-sm font-semibold transition-all duration-400',
                  isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                )}
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-lime-500/0 via-lime-500/15 to-lime-500/0 transition-transform duration-700 group-hover:translate-x-full dark:from-[#CDFF50]/0 dark:via-[#CDFF50]/8 dark:to-[#CDFF50]/0" />
                <CustomIcon name="plus" size={18} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative z-10">新規コンテスト作成</span>
              </Link>

              {/* 投稿ボタン */}
              <Link
                href="/submit"
                style={{
                  transitionDelay: isLeftOpen ? `${150 + (menuItems.length + 2) * 60}ms` : '0ms',
                }}
                className={cn(
                  'group relative flex items-center gap-3 overflow-hidden rounded-lg border border-lime-500 bg-lime-400 px-4 py-2.5',
                  'text-zinc-950 hover:bg-lime-300 hover:shadow-[0_0_25px_rgba(132,204,22,0.25)]',
                  'dark:border-[#CDFF50] dark:bg-[#CDFF50] dark:text-[#0B0B0F]',
                  'dark:hover:bg-[#CDFF50]/90 dark:hover:shadow-[0_0_25px_rgba(205,255,80,0.3)]',
                  'font-body text-sm font-bold transition-all duration-400',
                  isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                )}
              >
                <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/10" />
                <CustomIcon name="camera" size={18} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative z-10">コンテストに投稿する</span>
              </Link>
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}
