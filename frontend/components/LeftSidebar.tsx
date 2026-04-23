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
        'border-r border-white/6',
        'bg-[#111116]/80 backdrop-blur-2xl',
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
          className="mb-5 pb-4 border-b border-white/6 transition-all duration-500"
          style={{
            transitionDelay: isLeftOpen ? '150ms' : '0ms',
            opacity: isLeftOpen ? 1 : 0,
            transform: isLeftOpen ? 'translateX(0)' : 'translateX(-20px)',
          }}
        >
          <h2 className="text-[0.6rem] font-semibold font-body tracking-[0.25em] uppercase text-[#CDFF50] flex items-center gap-2">
            <span className="inline-block w-4 h-px bg-[#CDFF50]" />
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
                'group flex items-center gap-3 px-4 py-2.5 rounded-lg',
                'transition-all duration-400 font-body text-sm',
                isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0',
                isActive
                  ? 'bg-[#CDFF50]/10 border border-[#CDFF50]/30 text-[#CDFF50] font-semibold'
                  : 'border border-transparent text-[#8A8A95] hover:bg-white/4 hover:border-white/8 hover:text-[#F0EDE8]'
              )}
            >
              <span
                className={cn(
                  'flex-shrink-0 transition-colors duration-300',
                  isActive ? 'text-[#CDFF50]' : 'text-[#55555F] group-hover:text-[#CDFF50]'
                )}
              >
                {item.icon}
              </span>
              <span className="font-medium tracking-wide">{item.label}</span>
              {isActive && (
                <span className="ml-auto inline-block w-1 h-4 bg-[#CDFF50] rounded-full" />
              )}
            </Link>
          )
        })}

        {/* 未ログイン時のCTA */}
        {!isAuthenticated && (
          <div
            className="mt-6 pt-4 border-t border-white/6 transition-all duration-500"
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
              className="my-5 border-t border-white/6 transition-all duration-500"
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
                  'group relative overflow-hidden flex items-center gap-3 px-4 py-2.5 rounded-lg',
                  'border border-[#CDFF50]/20 bg-[#CDFF50]/5 text-[#CDFF50]',
                  'hover:border-[#CDFF50]/40 hover:bg-[#CDFF50]/10',
                  'font-semibold text-sm font-body transition-all duration-400',
                  'hover:shadow-[0_0_20px_rgba(205,255,80,0.1)]',
                  isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#CDFF50]/0 via-[#CDFF50]/8 to-[#CDFF50]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
                  'group relative overflow-hidden flex items-center gap-3 px-4 py-2.5 rounded-lg',
                  'border border-[#CDFF50] bg-[#CDFF50] text-[#0B0B0F]',
                  'hover:bg-[#CDFF50]/90 hover:shadow-[0_0_25px_rgba(205,255,80,0.3)]',
                  'font-bold text-sm font-body transition-all duration-400',
                  isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                )}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
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
