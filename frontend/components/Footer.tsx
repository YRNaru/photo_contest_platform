'use client'

import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { CustomIcon } from '@/components/ui/custom-icon'

// ===========
// Footer Link
// ===========

interface FooterLinkProps {
  href: string
  children: React.ReactNode
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          'group flex items-center gap-2 text-sm text-[#55555F] font-body',
          'hover:text-[#F0EDE8] transition-all duration-300 hover:translate-x-1.5'
        )}
      >
        <span className="w-1.5 h-px bg-[#CDFF50] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
        {children}
      </Link>
    </li>
  )
}

// ===========
// Section Heading
// ===========

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-display font-bold text-[0.65rem] tracking-[0.2em] uppercase text-[#8A8A95] mb-5 flex items-center gap-2">
      <span className="inline-block w-4 h-px bg-[#CDFF50]/60" />
      {children}
    </h4>
  )
}

// ====
// Main
// ====

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn(
      'relative mt-auto overflow-hidden',
      'bg-[#0B0B0F]',
      'border-t border-white/6'
    )}>
      {/* アクセントライン */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#CDFF50]/20 to-transparent" />

      {/* 背景グロー */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#CDFF50]/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#CDFF50]/2 rounded-full blur-[80px] pointer-events-none" />

      <div className="content-container relative z-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
          {/* ブランド情報 */}
          <div>
            <p className="font-display font-black text-2xl uppercase tracking-[0.05em] text-[#F0EDE8] mb-1">
              VRC Contest
            </p>
            <p className="font-display font-bold text-[0.6rem] tracking-[0.2em] uppercase text-[#CDFF50] mb-4">
              Photo Platform
            </p>
            <p className="text-sm text-[#55555F] font-body leading-relaxed">
              VRChatのフォトコンテストプラットフォーム。あなたの最高の瞬間を共有しよう。
            </p>
          </div>

          {/* クイックリンク */}
          <div>
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="space-y-3">
              <FooterLink href="/contests">コンテスト一覧</FooterLink>
              <FooterLink href="/calendar">カレンダー</FooterLink>
              <FooterLink href="/contests/create">コンテスト作成</FooterLink>
              <FooterLink href="/submit">写真を投稿</FooterLink>
              <FooterLink href="/my-entries">マイ投稿</FooterLink>
              <FooterLink href="/profile">マイページ</FooterLink>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <FooterHeading>Support</FooterHeading>
            <ul className="space-y-3">
              <FooterLink href="/features">機能一覧</FooterLink>
              <FooterLink href="/help">ヘルプセンター</FooterLink>
              <FooterLink href="/guidelines">ガイドライン</FooterLink>
              <FooterLink href="/faq">よくある質問</FooterLink>
              <FooterLink href="/contact">お問い合わせ</FooterLink>
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <FooterHeading>Legal</FooterHeading>
            <ul className="space-y-3">
              <FooterLink href="/terms">利用規約</FooterLink>
              <FooterLink href="/privacy">プライバシーポリシー</FooterLink>
              <FooterLink href="/cookie-policy">Cookieポリシー</FooterLink>
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-white/6" />

        {/* コピーライト */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-xs text-[#55555F] font-body tracking-wide">
            © {currentYear} VRChat Photo Contest Platform. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#55555F] hover:text-[#CDFF50] transition-colors duration-300 hover:scale-110 transform-gpu"
              aria-label="X (Twitter)"
            >
              <CustomIcon name="twitter" size={18} />
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#55555F] hover:text-[#CDFF50] transition-colors duration-300 hover:scale-110 transform-gpu"
              aria-label="Discord"
            >
              <CustomIcon name="discord" size={18} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#55555F] hover:text-[#CDFF50] transition-colors duration-300 hover:scale-110 transform-gpu"
              aria-label="GitHub"
            >
              <CustomIcon name="github" size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
