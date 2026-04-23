import Link from 'next/link'
import { ContestList } from '@/components/ContestList'
import { Suspense, ReactNode } from 'react'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CustomIcon, type IconType } from '@/components/ui/custom-icon'
import { cva, type VariantProps } from 'class-variance-authority'

// ======
// Styles
// ======

const heroLinkBaseClass = cn(
  // Base structural classes explicitly substituting shadcn's default button
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  // ボックスモデル・サイズ
  'box-border h-auto min-h-11 min-w-0 px-4 py-3 sm:min-h-12 sm:px-6 sm:py-4',
  // タイポグラフィ
  'text-center text-sm font-bold sm:text-base whitespace-normal',
  // Flexレイアウト
  'flex items-center justify-center gap-2',
  // アニメーション
  'transition-all duration-300 transform-gpu'
)

const heroLinkVariants = cva(
  cn(
    heroLinkBaseClass,
    'group relative overflow-hidden backdrop-blur-md',
    // 影のデフォルト設定
    'shadow-sm dark:shadow-none'
  ),
  {
    variants: {
      variant: {
        cyan: cn(
          'bg-cyan-50/80 dark:bg-white/5 border border-cyan-300 dark:border-white/10',
          'text-cyan-800 dark:text-white',
          'hover:border-cyan-400 hover:bg-cyan-100 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-950/30',
          'hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:text-cyan-900 dark:hover:text-white'
        ),
        purple: cn(
          'bg-purple-50/80 dark:bg-white/5 border border-purple-300 dark:border-white/10',
          'text-purple-800 dark:text-white',
          'hover:border-purple-400 hover:bg-purple-100 dark:hover:border-purple-400/50 dark:hover:bg-purple-950/30',
          'hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:text-purple-900 dark:hover:text-white'
        ),
        pink: cn(
          'bg-pink-50/80 dark:bg-white/5 border border-pink-300 dark:border-white/10',
          'text-pink-800 dark:text-white',
          'hover:border-pink-400 hover:bg-pink-100 dark:hover:border-pink-400/50 dark:hover:bg-pink-950/30',
          'hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] dark:hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:text-pink-900 dark:hover:text-white'
        ),
        primary: cn(
          'bg-indigo-50/80 dark:bg-white/5 border border-indigo-300 dark:border-white/10',
          'text-indigo-800 dark:text-white',
          'hover:border-indigo-400 hover:bg-indigo-100 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-950/30',
          'hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:text-indigo-900 dark:hover:text-white'
        )
      }
    },
    defaultVariants: {
      variant: 'cyan'
    }
  }
)

const featureCardVariants = cva(
  cn(
    // ベース
    'group relative overflow-hidden backdrop-blur-xl',
    'bg-white/40 dark:bg-black/40',
    'border-white/20 dark:border-white/10',
    // アニメーション
    'transition-all duration-500 hover:-translate-y-2'
  ),
  {
    variants: {
      color: {
        cyan: 'hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]',
        purple: 'hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
        pink: 'hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] dark:hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]',
      }
    },
    defaultVariants: {
      color: 'cyan'
    }
  }
)

// ===========
// Components
// ===========

interface HeroLinkProps extends VariantProps<typeof heroLinkVariants> {
  href: string
  icon: IconType
  iconColorClass: string
  children: ReactNode
}

function HeroLink({ href, variant, icon, iconColorClass, children }: HeroLinkProps) {
  return (
    <Link href={href} className={heroLinkVariants({ variant })}>
      <div className={cn(
        "absolute inset-0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700",
        variant === 'cyan' && "bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0",
        variant === 'purple' && "bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-purple-400/0",
        variant === 'pink' && "bg-gradient-to-r from-pink-400/0 via-pink-400/10 to-pink-400/0",
        variant === 'primary' && "bg-gradient-to-r from-indigo-400/0 via-indigo-400/10 to-indigo-400/0"
      )} />
      <CustomIcon 
        name={icon} 
        size={40} 
        className={cn("relative z-10", iconColorClass)} 
      />
      <span className="relative z-10">{children}</span>
    </Link>
  )
}

interface FeatureCardProps extends VariantProps<typeof featureCardVariants> {
  emoji: React.ReactNode
  title: string
  description: string
  hoverTransform?: string
  className?: string
}

function FeatureCard({ color, emoji, title, description, hoverTransform, className }: FeatureCardProps) {
  // カラーに応じたエフェクトの設定
  const effectMap = {
    cyan: {
      bg: 'bg-cyan-500/20 group-hover:bg-cyan-500/30',
      title: 'group-hover:text-cyan-500 dark:group-hover:text-cyan-400',
      position: '-right-8 -top-8 h-32 w-32 rounded-full'
    },
    purple: {
      bg: 'bg-purple-500/20 group-hover:bg-purple-500/30',
      title: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
      position: '-bottom-8 -left-8 h-32 w-32 rounded-full'
    },
    pink: {
      bg: 'bg-pink-500/10 group-hover:bg-pink-500/20',
      title: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
      position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-64 rounded-full'
    }
  }
  const effect = effectMap[color || 'cyan']

  return (
    <Card className={cn(featureCardVariants({ color }), className)}>
      <div className={cn(
        "absolute blur-3xl transition-all duration-500 pointer-events-none",
        effect.bg,
        effect.position
      )} />
      <CardHeader className="text-center relative z-10">
        <div className={cn(
          "mb-4 flex justify-center text-4xl sm:mb-6 sm:text-5xl lg:text-6xl",
          "transition-transform duration-500 group-hover:scale-110",
          hoverTransform
        )}>
          {emoji}
        </div>
        <CardTitle className={cn(
          "text-lg sm:text-xl lg:text-2xl font-bold transition-colors",
          effect.title
        )}>
          {title}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base font-medium">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

// ====
// Main
// ====

export default function HomePage() {
  return (
    <div className="content-container py-4 sm:py-8 lg:py-12">
      {/* Cyberpunk Hero Section */}
      <section className={cn(
        // レイアウト・サイズ
        "relative mb-12 w-full min-w-0 max-w-full overflow-hidden sm:mb-16 lg:mb-20",
        // ボックスモデル・装飾 (Light: bg-slate-50, Dark: bg-slate-950)
        "rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/10",
        // エフェクト
        "shadow-lg dark:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] animate-fadeInUp"
      )}>
        {/* Cyberpunk grid background */}
        <div className={cn(
          "absolute inset-0 pointer-events-none",
          "bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]",
          "dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]",
          "bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]",
          "dark:[mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]"
        )} />
        
        {/* Glowing Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-400/40 dark:bg-purple-600/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow pointer-events-none" />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-400/30 dark:bg-cyan-600/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow pointer-events-none" 
          style={{ animationDelay: '1.5s' }} 
        />
        
        {/* Decorative hi-tech elements */}
        <div className="absolute left-6 top-6 h-[2px] w-24 bg-gradient-to-r from-cyan-400 to-transparent opacity-50 hidden sm:block" />
        <div className="absolute right-6 bottom-6 h-[2px] w-24 bg-gradient-to-l from-pink-500 to-transparent opacity-50 hidden sm:block" />
        <div className="absolute right-6 top-6 text-cyan-600/40 dark:text-cyan-400/40 font-mono text-xs hidden sm:block">SYS.INIT // METAVERSE</div>
        <div className="absolute left-6 bottom-6 text-purple-600/40 dark:purple-400/40 font-mono text-xs hidden sm:block">VRC_PROTO_V1</div>

        <div className="relative z-10 px-4 py-16 text-center flex flex-col items-center sm:py-24 lg:py-32">
          <div className={cn(
            "mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 sm:mb-8 backdrop-blur-md",
            "border border-cyan-500/30 dark:border-cyan-400/30 bg-cyan-100/50 dark:bg-cyan-400/10"
          )}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 dark:bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-600 dark:bg-cyan-500"></span>
            </span>
            <span className="text-xs font-semibold tracking-wider text-cyan-700 dark:text-cyan-400 uppercase sm:text-sm">Active Portal</span>
          </div>

          <h1 className={cn(
            "mb-4 max-w-full text-balance leading-none sm:mb-6",
            "text-[clamp(2.25rem,6vw,5rem)] font-black",
            "text-transparent bg-clip-text bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400"
          )}>
            <span className="block sm:inline">VRChat</span> フォトコンテスト
          </h1>
          <p className="mb-10 max-w-2xl text-balance text-[clamp(1rem,2vw,1.25rem)] font-medium text-slate-600 dark:text-slate-300 sm:mb-14">
            メタバースの日常から奇跡の瞬間まで。<br className="hidden sm:inline" />
            あなたの視点が創り出す、新しい世界のアートを見せてください。
          </p>

          <div className="cq-hero-actions grid w-full max-w-[50rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
            <HeroLink
              href="/contests"
              variant="cyan"
              icon="contest"
              iconColorClass="text-purple-600 dark:text-purple-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
            >
              コンテスト一覧
            </HeroLink>
            
            <HeroLink
              href="/submit"
              variant="primary"
              icon="camera"
              iconColorClass="text-pink-600 dark:text-pink-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
            >
              作品を投稿する
            </HeroLink>
            
            <HeroLink
              href="/calendar"
              variant="purple"
              icon="calendar"
              iconColorClass="text-pink-600 dark:text-pink-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
            >
              スケジュール
            </HeroLink>
            
            <HeroLink
              href="/features"
              variant="pink"
              icon="features"
              iconColorClass="text-cyan-600 dark:text-cyan-400 group-hover:text-pink-600 dark:group-hover:text-pink-400"
            >
              機能一覧
            </HeroLink>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "mb-12 w-full min-w-0 max-w-full animate-fadeInUp",
          "sm:mb-16 lg:mb-20"
        )}
        style={{ animationDelay: '100ms' }}
      >
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="h-8 w-2 rounded-full bg-gradient-to-b from-cyan-400 to-purple-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
          <h2 className="text-[clamp(1.5rem,3.5vw+0.5rem,2.25rem)] font-black text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/70">
            開催中のコンテスト
          </h2>
        </div>
        <Suspense fallback={
          <div className="h-[400px] w-full animate-pulse rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md" />
        }>
          <ContestList />
        </Suspense>
      </section>

      <section
        className={cn(
          "cq-features-grid grid grid-cols-1 gap-4 py-8",
          "sm:gap-6 sm:py-12 lg:gap-8 lg:py-16",
          "animate-fadeInUp"
        )}
        style={{ animationDelay: '200ms' }}
      >
        <FeatureCard
          color="cyan"
          emoji={<CustomIcon name="camera" size={48} />}
          title="簡単投稿"
          description="直感的なUIで、あなたの最高の一枚をすぐに世界へ発信できます。"
          hoverTransform="group-hover:-rotate-12"
        />

        <FeatureCard
          color="purple"
          emoji={<CustomIcon name="star" size={48} />}
          title="リアルタイム投票"
          description="気に入った作品に熱い想いを投票し、コミュニティを盛り上げよう。"
          hoverTransform="group-hover:rotate-12"
        />

        <FeatureCard
          color="pink"
          emoji={<CustomIcon name="contest" size={48} />}
          title="厳正な審査"
          description="プロの審査員による多角的な評価システムで、真のアートを見出します。"
          className="cq-features-wide"
        />
      </section>
    </div>
  )
}
