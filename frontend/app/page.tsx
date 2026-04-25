import Link from 'next/link'
import { ContestList } from '@/components/ContestList'
import { Suspense } from 'react'
import { MarqueeStrip } from '@/components/MarqueeStrip'
import { cn } from '@/lib/utils'
import { CustomIcon, type IconType } from '@/components/ui/custom-icon'
import { HeroTitle } from '@/components/HeroTitle'

// ======
// Hero Action Button
// ======

interface HeroActionProps {
  href: string
  icon: IconType
  label: string
  sub: string
}

function HeroAction({ href, icon, label, sub }: HeroActionProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-4 overflow-hidden',
        'rounded-2xl border border-zinc-200/90 bg-white/70 px-5 py-4 backdrop-blur-sm',
        'hover:border-lime-500/50 hover:bg-lime-50/80 hover:shadow-[0_0_30px_rgba(132,204,22,0.15)]',
        'dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-[#CDFF50]/40 dark:hover:bg-[#CDFF50]/5',
        'dark:hover:shadow-[0_0_30px_rgba(205,255,80,0.12)]',
        'transition-all duration-500'
      )}
    >
      {/* hover shine */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-lime-500/0 via-lime-500/12 to-lime-500/0 transition-transform duration-700 group-hover:translate-x-full dark:from-[#CDFF50]/0 dark:via-[#CDFF50]/8 dark:to-[#CDFF50]/0" />

      <span className="relative z-10 flex-shrink-0 text-lime-700 transition-colors duration-300 group-hover:text-lime-800 dark:text-[#CDFF50]/70 dark:group-hover:text-[#CDFF50]">
        <CustomIcon name={icon} size={28} />
      </span>
      <span className="relative z-10 min-w-0 text-left">
        <span className="block font-display text-sm font-semibold tracking-wide text-zinc-900 transition-colors duration-300 group-hover:text-lime-900 dark:text-[#F0EDE8] dark:group-hover:text-[#CDFF50]">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-zinc-600 transition-colors duration-300 group-hover:text-zinc-800 dark:text-[#55555F] dark:group-hover:text-[#8A8A95]">
          {sub}
        </span>
      </span>
      <span className="relative z-10 ml-auto text-zinc-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-lime-700 dark:text-[#55555F] dark:group-hover:text-[#CDFF50]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </span>
    </Link>
  )
}

// ======
// Feature Card
// ======

interface FeatureCardProps {
  icon: IconType
  title: string
  description: string
  index: number
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 backdrop-blur-sm',
        'hover:-translate-y-1.5 hover:border-lime-400/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]',
        'dark:border-white/6 dark:bg-white/[0.025] dark:hover:border-[#CDFF50]/30',
        'dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]',
        'sm:p-8',
        'transition-all duration-500'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 背景グロー */}
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-lime-400/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-[#CDFF50]/5" />

      <div className="relative z-10">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200/90 bg-zinc-50/90 transition-all duration-500 group-hover:border-lime-400/40 group-hover:bg-lime-50 dark:border-white/10 dark:bg-white/5 dark:group-hover:border-[#CDFF50]/40 dark:group-hover:bg-[#CDFF50]/10">
          <span className="text-zinc-600 transition-colors duration-300 group-hover:text-lime-800 dark:text-[#8A8A95] dark:group-hover:text-[#CDFF50]">
            <CustomIcon name={icon} size={24} />
          </span>
        </div>

        <h3 className="mb-2 font-display text-base font-bold uppercase tracking-wide text-zinc-900 transition-colors duration-300 group-hover:text-lime-900 dark:text-[#F0EDE8] dark:group-hover:text-[#CDFF50]">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-[#8A8A95]">
          {description}
        </p>
      </div>
    </div>
  )
}

// ======
// Section Header (ポートフォリオ風)
// ======

function SectionHeader({ label, title, count }: { label: string; title: string; count?: string }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-lime-700 dark:text-[#CDFF50]">
          <span className="inline-block h-px w-5 bg-lime-600 dark:bg-[#CDFF50]" />
          {label}
        </p>
        <h2 className="whitespace-pre-line font-display text-4xl font-black uppercase leading-none tracking-tight text-zinc-900 dark:text-[#F0EDE8] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </div>
      {count && (
        <span className="shrink-0 text-xs font-medium uppercase tracking-[0.15em] text-zinc-500 dark:text-[#55555F]">
          {count}
        </span>
      )}
    </div>
  )
}

// ====
// Main
// ====

export default function HomePage() {
  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex flex-col justify-end overflow-hidden px-4 sm:px-8 pb-16 sm:pb-24">
        {/* 背景グロー（ポートフォリオと同じ配置） */}
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-3xl max-h-3xl bg-[radial-gradient(circle,rgba(205,255,80,0.12)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-15%] w-[40vw] h-[40vw] max-w-2xl max-h-2xl bg-[radial-gradient(circle,rgba(205,255,80,0.06)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

        {/* アンビエントテキスト */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display font-black uppercase text-zinc-300/40 dark:text-[#F0EDE8] dark:opacity-[0.018]"
          style={{ fontSize: 'clamp(8rem, 22vw, 28rem)', lineHeight: 1 }}
          aria-hidden
        >
          PHOTO
        </div>

        {/* 右端の縦線装飾 */}
        <div className="absolute top-[30%] right-6 hidden h-[30vh] w-px bg-zinc-200/80 dark:bg-white/6 sm:right-12 md:block">
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rotate-90 whitespace-nowrap font-body text-[0.55rem] tracking-[0.2em] text-zinc-500 dark:text-[#55555F]">
            VRC PHOTO CONTEST
          </span>
        </div>

        {/* コンテンツ */}
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          {/* ラベル */}
          <p className="mb-6 flex animate-fadeInUp items-center gap-3 font-body text-xs font-medium uppercase tracking-[0.2em] text-lime-700 dark:text-[#CDFF50] sm:text-sm">
            <span className="inline-block h-px w-10 bg-lime-600 dark:bg-[#CDFF50]" />
            VRChat Photo Contest Platform
          </p>

          {/* メインタイトル */}
          <HeroTitle className="mb-8 sm:mb-12" />

          {/* 下部エリア */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            {/* サブテキスト */}
            <p className="max-w-[38ch] font-body text-sm font-light leading-[1.8] text-zinc-700 dark:text-[#8A8A95] sm:text-base">
              メタバースの日常から奇跡の瞬間まで。<br className="hidden sm:inline" />
              あなたの視点が創り出す新しい世界のアートを<br className="hidden sm:inline" />
              見せてください。
            </p>

            {/* スクロールインジケーター */}
            <div className="invisible flex flex-col items-center gap-2 font-body text-[0.65rem] uppercase tracking-[0.15em] text-zinc-500 sm:visible sm:flex dark:text-[#55555F]">
              <span>Scroll</span>
              <div className="h-14 w-px animate-scrollPulse bg-gradient-to-b from-lime-500 to-transparent dark:from-[#CDFF50]" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <MarqueeStrip />

      {/* ===== SECTION DIVIDER ===== */}
      <div className="px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="h-px bg-zinc-200/90 dark:bg-white/10" />
      </div>

      {/* ===== ACTION LINKS ===== */}
      <section className="px-4 sm:px-8 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Quick Access" title={`Quick\nAccess`} />
          <div className="cq-hero-actions grid grid-cols-1 gap-3 sm:gap-4 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <HeroAction href="/contests" icon="contest" label="コンテスト一覧" sub="開催中・過去のコンテストを確認" />
            <HeroAction href="/submit" icon="camera" label="作品を投稿する" sub="あなたの最高の一枚をシェア" />
            <HeroAction href="/calendar" icon="calendar" label="スケジュール" sub="開催予定のコンテスト日程" />
            <HeroAction href="/features" icon="features" label="機能一覧" sub="プラットフォームの全機能" />
          </div>
        </div>
      </section>

      {/* ===== SECTION DIVIDER ===== */}
      <div className="px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="h-px bg-zinc-200/90 dark:bg-white/10" />
      </div>

      {/* ===== ACTIVE CONTESTS ===== */}
      <section className="px-4 sm:px-8 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Now Live" title={`Active\nContests`} />
          <Suspense
            fallback={
              <div className="h-[400px] w-full animate-pulse rounded-2xl border border-zinc-200/80 bg-zinc-100/80 dark:border-white/6 dark:bg-white/[0.02]" />
            }
          >
            <ContestList />
          </Suspense>
        </div>
      </section>

      {/* ===== SECTION DIVIDER ===== */}
      <div className="px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="h-px bg-zinc-200/90 dark:bg-white/10" />
      </div>

      {/* ===== FEATURES ===== */}
      <section className="px-4 sm:px-8 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Platform Features" title={`Why\nJoin Us`} />
          <div className="cq-features-grid grid grid-cols-1 gap-4 sm:gap-5">
            <FeatureCard
              icon="camera"
              title="簡単投稿"
              description="直感的なUIで、あなたの最高の一枚をすぐに世界へ発信できます。フォームに入力してワンクリックで完了。"
              index={0}
            />
            <FeatureCard
              icon="star"
              title="リアルタイム投票"
              description="気に入った作品に熱い想いを投票し、コミュニティを盛り上げよう。結果はリアルタイムで反映されます。"
              index={1}
            />
            <FeatureCard
              icon="contest"
              title="厳正な審査"
              description="プロの審査員による多角的な評価システムで、真のアートを見出します。スコア方式・投票方式を選択可能。"
              index={2}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
