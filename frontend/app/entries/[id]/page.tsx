'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { entryApi, entryViewApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { FaHeart, FaRegHeart, FaEye, FaCalendar, FaUser } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'

export default function EntryDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // エントリー詳細取得
  const {
    data: entry,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['entry', id],
    queryFn: async () => {
      const response = await entryApi.getEntry(id)
      return response.data
    },
  })

  // 審査員の場合、閲覧記録を作成
  const viewRecorded = useRef(false)
  useEffect(() => {
    if (isAuthenticated && user?.is_judge && entry && !viewRecorded.current) {
      viewRecorded.current = true
      entryViewApi.createView({ entry: entry.id })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['viewed-entries'] })
        })
        .catch((err) => {
          // 既に記録がある場合はエラーになるが無視
          console.debug('Entry view already exists or failed to create:', err)
        })
    }
  }, [isAuthenticated, user?.is_judge, entry, queryClient])

  // 投票mutation
  const voteMutation = useMutation({
    mutationFn: async () => {
      if (entry?.user_voted) {
        await entryApi.unvote(id)
      } else {
        await entryApi.vote(id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entry', id] })
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">エントリーが見つかりません</h1>
          <p className="text-muted-foreground mb-6">
            このエントリーは存在しないか、削除された可能性があります。
          </p>
          <Link href="/contests" className="text-blue-600 hover:underline">
            コンテスト一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  const currentImage = entry.images?.[selectedImageIndex]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* 左側: 画像 */}
        <div className="relative">
          {/* メイン画像 */}
          {currentImage ? (
            <div className="mb-4 relative w-full rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]" style={{ minHeight: '400px' }}>
              <Image
                src={currentImage.image}
                alt={entry.title}
                width={800}
                height={600}
                priority
                loading="eager"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                className="w-full h-auto object-contain bg-black/50 backdrop-blur-3xl"
                unoptimized
              />
            </div>
          ) : (
            <div
              className={cn(
                "mb-4 relative w-full flex flex-col items-center justify-center border border-white/20 dark:border-white/10",
                "bg-white/5 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
              )}
              style={{ minHeight: '400px' }}
            >
              <LoadingSpinner size="lg" className="mb-4" />
              <div className="animate-pulse text-foreground/50 font-bold tracking-widest uppercase text-sm">Loading Signal...</div>
            </div>
          )}

          {/* サムネイル一覧 */}
          {entry.images && entry.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {entry.images.map((image: { id: number; image: string; thumbnail?: string }, index: number) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "relative aspect-square rounded overflow-hidden transition-all duration-300",
                    selectedImageIndex === index
                      ? "ring-2 ring-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] scale-105"
                      : "opacity-60 hover:opacity-100 hover:ring-2 hover:ring-white/20"
                  )}
                >
                  <Image
                    src={image.thumbnail || image.image}
                    alt={`${entry.title} - ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右側: 詳細情報 */}
        <div className="flex flex-col bg-white/5 dark:bg-black/40 border border-white/20 dark:border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

          <h1 className="relative text-3xl font-black mb-6 bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/70 bg-clip-text text-transparent">{entry.title}</h1>

          {/* メタ情報 */}
          <div className="relative flex flex-wrap gap-4 mb-8 text-sm text-foreground/70 font-medium">
            <div className="flex items-center gap-2">
              <FaUser className="text-pink-500 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]" />
              <span>{entry.author?.username || entry.twitter_user_id || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendar className="text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]" />
              <span>{formatDate(entry.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEye className="text-cyan-500 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
              <span>{entry.view_count ?? 0} 閲覧</span>
            </div>
            {entry.twitter_url && (
              <a
                href={entry.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 font-bold transition-all hover:scale-105",
                  "text-sky-400 drop-shadow-[0_0_3px_rgba(56,189,248,0.8)] hover:text-sky-300 hover:drop-shadow-[0_0_8px_rgba(56,189,248,1)]"
                )}
                title="Xで元の投稿を見る"
              >
                <span className="text-lg">𝕏</span>
                <span>投稿元</span>
              </a>
            )}
          </div>

          {/* 投票ボタン */}
          {isAuthenticated && (
            <button
              onClick={() => voteMutation.mutate()}
              disabled={voteMutation.isPending}
              className={cn(
                "relative z-10 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold mb-8 transition-all duration-300 border",
                entry.user_voted
                  ? "bg-pink-500/20 border-pink-500/50 text-pink-400 hover:bg-pink-500/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                  : "bg-white/5 border-white/10 text-foreground/80 hover:bg-white/10 hover:border-white/20"
              )}
            >
              {entry.user_voted ? <FaHeart className="drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]" /> : <FaRegHeart />}
              <span className="tracking-widest uppercase">{entry.vote_count} いいね</span>
            </button>
          )}

          {!isAuthenticated && (
            <div className="relative z-10 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-xl mb-8 font-bold">
              <FaHeart className="text-foreground/40" />
              <span className="text-foreground/60 tracking-widest uppercase">{entry.vote_count} いいね</span>
            </div>
          )}

          {/* 説明 */}
          {entry.description && (
            <div className="relative z-10 mb-8 border-t border-border/30 pt-6">
              <h2 className="text-sm font-bold mb-3 text-cyan-400 drop-shadow-[0_0_2px_rgba(34,211,238,0.5)] tracking-widest uppercase">DESCRIPTION //</h2>
              <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{entry.description}</p>
            </div>
          )}

          {/* タグ */}
          {entry.tags && (
            <div className="relative z-10 mb-8 border-t border-border/30 pt-6">
              <h2 className="text-sm font-bold mb-3 text-cyan-400 drop-shadow-[0_0_2px_rgba(34,211,238,0.5)] tracking-widest uppercase">TAGS //</h2>
              <div className="flex flex-wrap gap-2">
                {(entry.tags || '').split(',').filter(Boolean).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 rounded-md text-sm font-semibold shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-default"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 承認ステータス */}
          {!entry.approved && (
            <div className="relative z-10 p-4 mb-6 bg-yellow-950/40 border border-yellow-500/50 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.1)]">
              <p className="text-yellow-400 font-bold flex items-center gap-2 drop-shadow-[0_0_2px_rgba(234,179,8,0.8)]">
                <span className="animate-pulse">⚠️</span> このエントリーは承認待ちです。
              </p>
            </div>
          )}

          {/* コンテストリンク */}
          <div className="relative z-10 mt-auto pt-6 border-t border-border/30">
            <Link
              href={`/contests/${entry.contest_slug}`}
              className="group inline-flex items-center gap-2 font-bold text-foreground/80 hover:text-cyan-400 transition-colors"
            >
              <span className="text-cyan-500 group-hover:-translate-x-1 group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] transition-all">←</span>
              <span className="group-hover:drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]">Return to {entry.contest_title || 'コンテスト'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
