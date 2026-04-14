'use client'

import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { CustomIcon } from '@/components/ui/custom-icon'


const footerLinkVariants = cva(
  'group flex items-center gap-2 transition-all duration-300 hover:translate-x-2',
  {
    variants: {
      color: {
        purple: 'hover:text-purple-400 dark:hover:text-purple-300',
        pink: 'hover:text-pink-400 dark:hover:text-pink-300',
        blue: 'hover:text-blue-400 dark:hover:text-blue-300',
      },
    },
    defaultVariants: {
      color: 'purple',
    },
  }
)

const footerLinkDotVariants = cva(
  'w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity',
  {
    variants: {
      color: {
        purple: 'bg-purple-400 dark:bg-purple-300',
        pink: 'bg-pink-400 dark:bg-pink-300',
        blue: 'bg-blue-400 dark:bg-blue-300',
      },
    },
    defaultVariants: {
      color: 'purple',
    },
  }
)

// ===========
// Components
// ===========

interface FooterLinkProps extends VariantProps<typeof footerLinkVariants> {
  href: string
  children: React.ReactNode
}

function FooterLink({ href, color, children }: FooterLinkProps) {
  return (
    <li>
      <Link href={href} className={footerLinkVariants({ color })}>
        <span className={footerLinkDotVariants({ color })} />
        {children}
      </Link>
    </li>
  )
}

// ====
// Main
// ====

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn(
      "relative mt-auto overflow-hidden text-foreground/80 dark:text-gray-400 backdrop-blur-2xl",
      "bg-zinc-50/80 dark:bg-black/95",
      "border-t border-black/10 dark:border-white/10"
    )}>
      {/* 背景装飾 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-cyan-500/20 dark:bg-cyan-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Cyberpunk accent lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent pointer-events-none" />

      <div className="content-container relative z-10 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 animate-fadeInUp">
          {/* サイト情報 */}
          <div className="animate-fadeInLeft">
            <h3 className={cn(
              "mb-4 text-2xl font-black text-transparent bg-clip-text animate-float animate-gradient",
              "bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400",
              "dark:from-purple-300 dark:via-pink-300 dark:to-purple-300"
            )}>
              VRChat Photo Contest
            </h3>
            <p className="text-sm text-foreground/60 dark:text-gray-500 leading-relaxed">
              VRChatのフォトコンテストプラットフォーム。 あなたの最高の瞬間を共有しましょう。✨
            </p>
          </div>

          {/* クイックリンク */}
          <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <h4 className="font-bold text-foreground dark:text-gray-200 mb-4 flex items-center gap-2">
              <CustomIcon name="link" size={20} className="text-purple-600 dark:text-purple-300" />
              クイックリンク
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <FooterLink href="/contests" color="purple">コンテスト一覧</FooterLink>
              <FooterLink href="/calendar" color="purple">カレンダー</FooterLink>
              <FooterLink href="/contests/create" color="purple">コンテスト作成</FooterLink>
              <FooterLink href="/submit" color="purple">写真を投稿</FooterLink>
              <FooterLink href="/my-entries" color="purple">マイ投稿</FooterLink>
              <FooterLink href="/profile" color="purple">マイページ</FooterLink>
            </ul>
          </div>

          {/* サポート */}
          <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <h4 className="font-bold text-foreground dark:text-gray-200 mb-4 flex items-center gap-2">
              <CustomIcon name="chat" size={20} className="text-pink-600 dark:text-pink-300" />
              サポート
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <FooterLink href="/features" color="pink">機能一覧</FooterLink>
              <FooterLink href="/help" color="pink">ヘルプセンター</FooterLink>
              <FooterLink href="/guidelines" color="pink">ガイドライン</FooterLink>
              <FooterLink href="/faq" color="pink">よくある質問</FooterLink>
              <FooterLink href="/contact" color="pink">お問い合わせ</FooterLink>
            </ul>
          </div>

          {/* 法的情報 */}
          <div className="animate-fadeInRight">
            <h4 className="font-bold text-foreground dark:text-gray-200 mb-4 flex items-center gap-2">
              <CustomIcon name="rule" size={20} className="text-blue-600 dark:text-blue-300" />
              法的情報
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <FooterLink href="/terms" color="blue">利用規約</FooterLink>
              <FooterLink href="/privacy" color="blue">プライバシーポリシー</FooterLink>
              <FooterLink href="/cookie-policy" color="blue">Cookieポリシー</FooterLink>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-black/10 dark:bg-border" />

        {/* コピーライト */}
        <div
          className={cn(
            "flex flex-col md:flex-row justify-between items-center",
            "gap-4 sm:gap-6 text-center md:text-left animate-fadeInUp"
          )}
          style={{ animationDelay: '300ms' }}
        >
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-600 font-medium">
            © {currentYear} VRChat Photo Contest Platform. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-125 transform-gpu"
            >
              <CustomIcon name="twitter" size={24} className="group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-gray-400 hover:text-pink-400 transition-all duration-300 hover:scale-125 transform-gpu"
            >
              <CustomIcon name="discord" size={24} className="group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-125 transform-gpu"
            >
              <CustomIcon name="github" size={24} className="group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
