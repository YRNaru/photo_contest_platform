import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CustomIcon } from '@/components/ui/custom-icon'


interface Entry {
  id: string
  title: string
  author: {
    username: string
  } | null
  vote_count: number
  view_count: number
  thumbnail?: string
  twitter_user_id?: string
  twitter_username?: string
  twitter_url?: string
}

export function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link href={`/entries/${entry.id}`} className="group block h-full">
      <Card
        className={cn(
          "relative h-full overflow-hidden transition-all duration-500",
          "border-white/20 bg-white/40 backdrop-blur-lg dark:border-white/10 dark:bg-black/40",
          "hover:-translate-y-1.5 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] flex flex-col"
        )}
      >
        <div className={cn(
          "relative h-48 w-full overflow-hidden sm:h-56 lg:h-64",
          "bg-slate-900"
        )}>
          {entry.thumbnail ? (
            <Image
              src={entry.thumbnail}
              alt={entry.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:opacity-90"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center relative">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-transparent to-purple-600/20" />
              <span className="relative z-10 transition-transform duration-700 group-hover:scale-125 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <CustomIcon name="entries" size={80} />
              </span>
            </div>
          )}
          <div className={cn(
            "absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-60",
            "bg-gradient-to-t from-black/80 via-black/10 to-transparent"
          )} />
          {/* Glowing line border underneath the thumbnail on hover */}
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        <CardContent className="relative flex flex-1 flex-col space-y-3 p-4 sm:p-5 lg:p-6">
          {/* Subtle background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-cyan-500/10 dark:to-purple-500/10 pointer-events-none" />

          <h3 className={cn(
            "relative line-clamp-2 text-base font-bold text-foreground",
            "transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent dark:group-hover:from-cyan-400 dark:group-hover:to-purple-400 sm:text-lg"
          )}>
            {entry.title}
          </h3>
          <p className="relative flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <CustomIcon 
              name="user" 
              size={18} 
              className="text-cyan-500 drop-shadow-[0_0_3px_rgba(6,182,212,0.4)]" 
              aria-hidden 
            />
            <span className="truncate font-semibold text-foreground/80 dark:text-foreground/70">
              {entry.author?.username || (entry.twitter_username ? `@${entry.twitter_username}` : '匿名ユーザー')}
            </span>
          </p>

          <div className="relative mt-auto flex flex-wrap items-center gap-4 text-xs sm:gap-5 sm:text-sm border-t border-border/40 pt-3">
            <div className="flex items-center gap-1.5 text-muted-foreground sm:gap-2">
              <CustomIcon name="star" size={16} className="text-pink-500 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]" aria-hidden />
              <span className="font-semibold text-foreground/90">{entry.vote_count}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground sm:gap-2">
              <CustomIcon name="stats" size={16} className="text-cyan-500 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" aria-hidden />
              <span className="font-semibold text-foreground/90">{entry.view_count}</span>
            </div>
            {entry.twitter_url && (
              <a
                href={entry.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="ml-auto flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 text-sky-600 transition-colors hover:bg-sky-500/10 hover:text-sky-500 dark:bg-white/5 dark:text-sky-400 dark:hover:bg-sky-400/20 dark:hover:text-sky-300"
                title="Xで見る"
              >
                  <CustomIcon name="twitter" size={18} />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
