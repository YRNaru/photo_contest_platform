'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useSidebar } from '@/lib/sidebar-context'
import { LoginButton } from './LoginButton'

export function LeftSidebar() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()
  const { isLeftOpen } = useSidebar()

  const menuItems = [
    { href: '/', label: 'ホーム', icon: '🏠' },
    { href: '/contests', label: 'コンテスト', icon: '🏆' },
    { href: '/calendar', label: 'カレンダー', icon: '📅' },
    { href: '/features', label: '機能一覧', icon: '✨' },
    ...(isAuthenticated
      ? [
          { href: '/my-contests', label: 'マイコンテスト', icon: '📋' },
          { href: '/judging-contests', label: '審査中のコンテスト', icon: '👨‍⚖️' },
          { href: '/submit', label: '写真を投稿', icon: '📸' },
          { href: '/my-entries', label: 'マイ投稿', icon: '📷' },
          ...(user?.is_moderator || user?.is_staff
            ? [{ href: '/pending-entries', label: '承認待ちエントリー', icon: '📋' }]
            : []),
          { href: '/profile', label: 'プロフィール', icon: '👤' },
        ]
      : []),
  ]

  return (
    <aside
      className={`sticky top-16 z-40 h-[calc(100vh-4rem)] border-r border-border bg-muted/30 shadow-sm transition-all duration-700 ease-in-out dark:bg-muted/10 ${
        isLeftOpen ? 'w-80 opacity-100' : 'w-0 opacity-0'
      }`}
    >
      <nav
        className={`h-full overflow-y-auto overflow-x-hidden p-5 space-y-2 transition-all duration-700 delay-150 scrollbar-custom ${
          isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        <div
          className="mb-6 border-b border-border pb-4 transition-all duration-500"
          style={{
            transitionDelay: isLeftOpen ? '150ms' : '0ms',
            opacity: isLeftOpen ? 1 : 0,
            transform: isLeftOpen ? 'translateX(0)' : 'translateX(-20px)',
          }}
        >
          <h2 className="text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent uppercase tracking-wider px-3 animate-pulse-slow">
            ✨ メニュー
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
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl hover:scale-105 hover:shadow-lg transform-gpu transition-all duration-500 ${
                isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white font-bold shadow-xl glow-purple'
                  : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 text-gray-700 dark:text-gray-100 hover:text-purple-700 dark:hover:text-white'
              }`}
            >
              <span
                className={`text-2xl transition-transform duration-300 ${isActive ? 'animate-float' : 'group-hover:scale-125'}`}
              >
                {item.icon}
              </span>
              <span className="font-semibold">{item.label}</span>
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
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 dark:from-purple-500 dark:via-purple-400 dark:to-pink-500 animate-gradient text-white hover:shadow-2xl hover:scale-110 font-bold transform-gpu glow-purple transition-all duration-500 ${
                  isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                }`}
              >
                <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">
                  ➕
                </span>
                <span>新規コンテスト作成</span>
              </Link>

              <Link
                href="/submit"
                style={{
                  transitionDelay: isLeftOpen ? `${150 + (menuItems.length + 2) * 80}ms` : '0ms',
                }}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 dark:from-pink-500 dark:via-pink-400 dark:to-purple-500 animate-gradient text-white hover:shadow-2xl hover:scale-110 font-bold transform-gpu glow-pink transition-all duration-500 ${
                  isLeftOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                }`}
              >
                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
                  📸
                </span>
                <span>コンテストに投稿する</span>
              </Link>
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}
