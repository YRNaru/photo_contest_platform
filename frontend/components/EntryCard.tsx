import Link from 'next/link'
import Image from 'next/image'
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
      <article
        className={cn(
          'relative h-full overflow-hidden flex flex-col',
          // ポートフォリオのwork-item風
          'border border-white/6 bg-[#16161E]',
          'transition-all duration-500',
          'hover:-translate-y-1.5 hover:border-white/12',
          'hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
        )}
      >
        {/* サムネイル */}
        <div className="relative h-52 sm:h-60 overflow-hidden bg-[#111116]" data-cursor="view">
          {entry.thumbnail ? (
            <Image
              src={entry.thumbnail}
              alt={entry.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center relative">
              {/* グリッドパターン */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <span className="relative z-10 text-[#8A8A95] group-hover:text-[#CDFF50] transition-colors duration-500">
                <CustomIcon name="entries" size={64} />
              </span>
            </div>
          )}

          {/* グラデーションオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F]/90 via-[#0B0B0F]/20 to-transparent transition-opacity duration-500 opacity-80 group-hover:opacity-60" />

          {/* ホバー時テキスト（ポートフォリオのwork-overlay風） */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-[#CDFF50] font-body">
              View Entry →
            </span>
          </div>

          {/* ホバー時のアクセントライン */}
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#CDFF50] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* コンテンツ */}
        <div className="relative flex flex-1 flex-col gap-3 p-4 sm:p-5">
          {/* タイトル */}
          <h3
            className={cn(
              'line-clamp-2 font-display font-bold text-sm sm:text-base',
              'text-[#F0EDE8] group-hover:text-[#CDFF50]',
              'transition-colors duration-300 tracking-wide uppercase'
            )}
          >
            {entry.title}
          </h3>

          {/* 作者 */}
          <div className="flex items-center gap-1.5 text-xs text-[#8A8A95] font-body">
            <CustomIcon name="user" size={14} className="text-[#CDFF50]/60 flex-shrink-0" aria-hidden />
            <span className="truncate">
              {entry.author?.username || (entry.twitter_username ? `@${entry.twitter_username}` : '匿名')}
            </span>
          </div>

          {/* スタッツ */}
          <div className="mt-auto flex items-center gap-4 text-xs border-t border-white/6 pt-3">
            <span className="flex items-center gap-1.5 text-[#55555F]">
              <CustomIcon name="star" size={14} className="text-[#CDFF50]/70" aria-hidden />
              <span className="font-semibold text-[#8A8A95]">{entry.vote_count}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#55555F]">
              <CustomIcon name="stats" size={14} className="text-[#CDFF50]/50" aria-hidden />
              <span className="font-semibold text-[#8A8A95]">{entry.view_count}</span>
            </span>
            {entry.twitter_url && (
              <a
                href={entry.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="ml-auto flex items-center gap-1 text-[#55555F] hover:text-[#CDFF50] transition-colors duration-300"
                title="Xで見る"
              >
                <CustomIcon name="twitter" size={14} />
              </a>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
