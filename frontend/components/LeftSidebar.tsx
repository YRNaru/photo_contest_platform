'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useSidebar } from '@/lib/sidebar-context'
import { LoginButton } from './LoginButton'
import { CustomIcon } from './ui/custom-icon'

export function LeftSidebar() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()
  const { isLeftOpen } = useSidebar()

  const menuItems = [
    { href: '/', label: 'ホーム', icon: <CustomIcon name="home" size={32} /> },
    { href: '/contests', label: 'コンテスト', icon: <CustomIcon name="contest" size={32} /> },
    { href: '/calendar', label: 'カレンダー', icon: <CustomIcon name="calendar" size={32} /> },
    { href: '/features', label: '機能一覧', icon: <CustomIcon name="features" size={32} /> },
    ...(isAuthenticated
      ? [
          { href: '/my-contests', label: 'マイコンテスト', icon: <CustomIcon name="my-contests" size={32} /> },
          { href: '/judging-contests', label: '審査中のコンテスト', icon: '👨‍⚖️' },
          { href: '/submit', label: '写真を投稿', icon: <CustomIcon name="camera" size={32} /> },
          { href: '/my-entries', label: 'マイ投稿', icon: <CustomIcon name="camera" size={32} /> },
          ...(user?.is_moderator || user?.is_staff
            ? [{ href: '/pending-entries', label: '承認待ちエントリー', icon: '📋' }]
            : []),
          { href: '/profile', label: 'プロフィール', icon: '👤' },
        ]
      : []),
  ]

  return (
    <aside
      className={`sticky top-16 z-40 h-[calc(100vh-4rem)] border-r border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-[5px_0_30px_rgba(0,0,0,0.1)] transition-all duration-700 ease-in-out ${
        isLeftOpen ? 'w-80 opacity-100' : 'w-0 opacity-0'
      }`}
    >
      <nav
        className={`h-full overflow-y-auto overflow-x-hidden p-5 space-y-2 transition-all duration-700 delay-150 scrollbar-custom ${
          isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        <div
          className="mb-6 border-b border-border/30 pb-4 transition-all duration-500"
          style={{
            transitionDelay: isLeftOpen ? '150ms' : '0ms',
            opacity: isLeftOpen ? 1 : 0,
            transform: isLeftOpen ? 'translateX(0)' : 'translateX(-20px)',
          }}
        >
          <h2 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.3)] dark:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] uppercase tracking-wider px-3 animate-pulse-slow">
            SYS.MENU //
          </h2>
        </div>

        {menuItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                transitionDelay: isLeftOpen ? `${150 + index * 80}ms` : '0ms',
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl border hover:scale-105 transform-gpu transition-all duration-500 ${
                isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
              } ${
                isActive
                  ? 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-400 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)] dark:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-transparent border-transparent text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10 hover:text-foreground dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <span
                className={`text-2xl transition-transform duration-300 ${isActive ? 'animate-float drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] dark:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'group-hover:scale-125'}`}
              >
                {item.icon}
              </span>
              <span className="font-semibold tracking-wide">{item.label}</span>
            </Link>
          )
        })}

        {!isAuthenticated && (
          <div
            className="mt-6 border-t border-border pt-4 transition-all duration-500"
            style={{
              transitionDelay: isLeftOpen ? `${150 + menuItems.length * 80}ms` : '0ms',
              opacity: isLeftOpen ? 1 : 0,
              transform: isLeftOpen ? 'translateX(0)' : 'translateX(-20px)',
            }}
          >
            <div
              style={{
                transitionDelay: isLeftOpen ? `${150 + (menuItems.length + 1) * 80}ms` : '0ms',
              }}
              className={`transition-all duration-500 ${
                isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
              }`}
            >
              <LoginButton variant="sidebar" />
            </div>
          </div>
        )}

        {isAuthenticated && (
          <>
            <div
              className="my-6 border-t border-border transition-all duration-500"
              style={{
                transitionDelay: isLeftOpen ? `${150 + menuItems.length * 80}ms` : '0ms',
                opacity: isLeftOpen ? 1 : 0,
              }}
            />

            <div className="space-y-3">
              <Link
                href="/contests/create"
                style={{
                  transitionDelay: isLeftOpen ? `${150 + (menuItems.length + 1) * 80}ms` : '0ms',
                }}
                className={`group relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl border border-cyan-400 dark:border-cyan-500/50 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-100 hover:border-cyan-500 dark:hover:border-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] font-bold transform-gpu transition-all duration-500 ${
                  isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="text-2xl group-hover:rotate-90 transition-transform duration-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] dark:drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] relative z-10">
                  ➕
                </span>
                <span className="relative z-10">新規コンテスト作成</span>
              </Link>

              <Link
                href="/submit"
                style={{
                  transitionDelay: isLeftOpen ? `${150 + (menuItems.length + 2) * 80}ms` : '0ms',
                }}
                className={`group relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl border border-pink-500/50 bg-gradient-to-r from-purple-600/80 to-pink-600/80 shadow-[0_0_15px_rgba(236,72,153,0.3)] text-white hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] font-bold transform-gpu hover:scale-105 transition-all duration-500 ${
                  isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                }`}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-300" />
                <span className="text-2xl group-hover:scale-125 transition-transform duration-300 relative z-10">
                  <CustomIcon name="camera" size={32} />
                </span>
                <span className="relative z-10">コンテストに投稿する</span>
              </Link>
            </div>

          </>
        )}
      </nav>
    </aside>
  )
}
