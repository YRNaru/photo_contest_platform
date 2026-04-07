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
          'h-full overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-xl',
          'hover:-translate-y-0.5'
        )}
      >
        <ContestBanner
          bannerImage={contest.banner_image}
          title={contest.title}
          priority={priority}
        />

        <CardContent className="space-y-3 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <PhaseBadge phase={contest.phase} />
            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground sm:text-sm">
              <span className="text-primary" aria-hidden>
                📸
              </span>
              {contest.entry_count} 件
            </span>
          </div>

          <h3 className="line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
            {contest.title}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {contest.description}
          </p>

          <ContestDates startAt={contest.start_at} endAt={contest.end_at} />
        </CardContent>
      </Card>
    </Link>
  )
}
