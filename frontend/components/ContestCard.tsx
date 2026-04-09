import Link from 'next/link'
import { ContestBanner } from './card/ContestBanner'
import { PhaseBadge } from './card/PhaseBadge'
import { ContestDates } from './card/ContestDates'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Contest {
  slug: string
  title: string
  description: string
  banner_image?: string
  start_at: string
  end_at: string
  phase: string
  entry_count: number
}

interface ContestCardProps {
  contest: Contest
  priority?: boolean
}

export function ContestCard({ contest, priority = false }: ContestCardProps) {
  return (
    <Link href={`/contests/${contest.slug}`} className="group block h-full">
      <Card
        className={cn(
          'relative h-full overflow-hidden border-white/20 bg-white/40 backdrop-blur-lg transition-all duration-500 dark:border-white/10 dark:bg-black/40',
          'hover:-translate-y-1.5 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] flex flex-col'
        )}
      >
        <div className="relative">
          <ContestBanner
            bannerImage={contest.banner_image}
            title={contest.title}
            priority={priority}
          />
          {/* Glowing line border underneath the banner on hover */}
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        <CardContent className="relative flex flex-1 flex-col space-y-4 p-5 lg:p-6">
          {/* Subtle background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-cyan-500/10 dark:to-purple-500/10 pointer-events-none" />

          <div className="relative flex items-center justify-between gap-2">
            <PhaseBadge phase={contest.phase} />
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-foreground backdrop-blur-md dark:border-white/10 dark:bg-black/20 sm:text-sm">
              <span className="text-cyan-500 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" aria-hidden>
                📸
              </span>
              <span>{contest.entry_count} 件</span>
            </span>
          </div>

          <div className="relative space-y-2 flex-1">
            <h3 className="line-clamp-2 text-lg font-bold text-foreground transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent dark:group-hover:from-cyan-400 dark:group-hover:to-purple-400 sm:text-xl">
              {contest.title}
            </h3>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {contest.description}
            </p>
          </div>

          <div className="relative mt-auto pt-2 border-t border-border/50">
            <ContestDates startAt={contest.start_at} endAt={contest.end_at} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
