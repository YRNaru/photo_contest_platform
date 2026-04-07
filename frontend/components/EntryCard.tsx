import Link from 'next/link'
import Image from 'next/image'
import { FaHeart, FaEye } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
          'h-full overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-xl',
          'hover:-translate-y-0.5'
        )}
      >
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50 sm:h-56 lg:h-64">
          {entry.thumbnail ? (
            <Image
              src={entry.thumbnail}
              alt={entry.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-8xl opacity-50 transition-transform duration-500 group-hover:scale-105" aria-hidden>
                📷
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <CardContent className="space-y-3 p-3 sm:p-4 lg:p-5">
          <h3 className="line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
            {entry.title}
          </h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
            <span className="text-primary" aria-hidden>
              👤
            </span>
            by{' '}
            <span className="truncate font-semibold">
              {entry.author?.username || (entry.twitter_username ? `@${entry.twitter_username}` : '匿名ユーザー')}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:gap-5 sm:text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground sm:gap-2">
              <FaHeart className="text-red-500 dark:text-red-400" aria-hidden />
              <span className="font-semibold">{entry.vote_count}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground sm:gap-2">
              <FaEye className="text-blue-500 dark:text-blue-400" aria-hidden />
              <span className="font-semibold">{entry.view_count}</span>
            </div>
            {entry.twitter_url && (
              <a
                href={entry.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-400"
                title="Xで見る"
              >
                <span className="text-base">𝕏</span>
                <span className="text-xs">投稿元</span>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
