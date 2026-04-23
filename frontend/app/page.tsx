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
        'border border-white/8 bg-white/[0.03]',
        'px-5 py-4 rounded-2xl backdrop-blur-sm',
        'hover:border-[#CDFF50]/40 hover:bg-[#CDFF50]/5',
        'transition-all duration-500',
        'hover:shadow-[0_0_30px_rgba(205,255,80,0.12)]'
      )}
    >
      {/* hover shine */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-[#CDFF50]/0 via-[#CDFF50]/8 to-[#CDFF50]/0 pointer-events-none" />

      <span className="relative z-10 flex-shrink-0 text-[#CDFF50]/70 group-hover:text-[#CDFF50] transition-colors duration-300">
        <CustomIcon name={icon} size={28} />
      </span>
      <span className="relative z-10 text-left min-w-0">
        <span className="block text-sm font-semibold tracking-wide text-[#F0EDE8] group-hover:text-[#CDFF50] transition-colors duration-300 font-display">
          {label}
        </span>
        <span className="block text-xs text-[#55555F] group-hover:text-[#8A8A95] transition-colors duration-300 mt-0.5">
          {sub}
        </span>
      </span>
      <span className="relative z-10 ml-auto text-[#55555F] group-hover:text-[#CDFF50] group-hover:translate-x-1 transition-all duration-300">
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
        'group relative overflow-hidden border border-white/6 bg-white/[0.025]',
        'p-6 sm:p-8 rounded-2xl backdrop-blur-sm',
        'hover:border-[#CDFF50]/30 hover:-translate-y-1.5',
        'transition-all duration-500',
        'hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]',
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 背景グロー */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#CDFF50]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-white/5 group-hover:border-[#CDFF50]/40 group-hover:bg-[#CDFF50]/10 transition-all duration-500">
          <span className="text-[#8A8A95] group-hover:text-[#CDFF50] transition-colors duration-300">
            <CustomIcon name={icon} size={24} />
          </span>
        </div>

        <h3 className="text-base font-bold font-display text-[#F0EDE8] mb-2 group-hover:text-[#CDFF50] transition-colors duration-300 uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-sm text-[#8A8A95] leading-relaxed">
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
    <div className="flex items-end justify-between mb-10 gap-4">
      <div>
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#CDFF50] mb-3 flex items-center gap-3">
          <span className="inline-block w-5 h-px bg-[#CDFF50]" />
          {label}
        </p>
        <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tight uppercase text-[#F0EDE8]">
          {title}
        </h2>
      </div>
      {count && (
        <span className="text-xs font-medium tracking-[0.15em] uppercase text-[#55555F] flex-shrink-0">
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-black uppercase text-[#F0EDE8] opacity-[0.018] pointer-events-none whitespace-nowrap select-none"
          style={{ fontSize: 'clamp(8rem, 22vw, 28rem)', lineHeight: 1 }}
          aria-hidden
        >
          PHOTO
        </div>

        {/* 右端の縦線装飾 */}
        <div className="absolute top-[30%] right-6 sm:right-12 w-px h-[30vh] bg-white/6 hidden md:block">
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rotate-90 text-[0.55rem] tracking-[0.2em] text-[#55555F] whitespace-nowrap font-body">
            VRC PHOTO CONTEST
          </span>
        </div>

        {/* コンテンツ */}
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          {/* ラベル */}
          <p className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-[#CDFF50] mb-6 flex items-center gap-3 font-body animate-fadeInUp">
            <span className="inline-block w-10 h-px bg-[#CDFF50]" />
            VRChat Photo Contest Platform
          </p>

          {/* メインタイトル */}
          <HeroTitle className="mb-8 sm:mb-12" />

          {/* 下部エリア */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            {/* サブテキスト */}
            <p className="max-w-[38ch] text-sm sm:text-base text-[#8A8A95] font-light leading-[1.8] font-body">
              メタバースの日常から奇跡の瞬間まで。<br className="hidden sm:inline" />
              あなたの視点が創り出す新しい世界のアートを<br className="hidden sm:inline" />
              見せてください。
            </p>

            {/* スクロールインジケーター */}
            <div className="flex flex-col items-center gap-2 text-[0.65rem] tracking-[0.15em] uppercase text-[#55555F] font-body sm:flex invisible sm:visible">
              <span>Scroll</span>
              <div className="w-px h-14 bg-gradient-to-b from-[#CDFF50] to-transparent animate-scrollPulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <MarqueeStrip />

      {/* ===== SECTION DIVIDER ===== */}
      <div className="px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="h-px bg-white/10" />
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
        <div className="h-px bg-white/10" />
      </div>

      {/* ===== ACTIVE CONTESTS ===== */}
      <section className="px-4 sm:px-8 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Now Live" title={`Active\nContests`} />
          <Suspense
            fallback={
              <div className="h-[400px] w-full rounded-2xl border border-white/6 bg-white/[0.02] animate-pulse" />
            }
          >
            <ContestList />
          </Suspense>
        </div>
      </section>

      {/* ===== SECTION DIVIDER ===== */}
      <div className="px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="h-px bg-white/10" />
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
