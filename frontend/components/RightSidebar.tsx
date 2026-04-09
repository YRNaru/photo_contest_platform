'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSidebar } from '@/lib/sidebar-context'
import { contestApi } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

interface TrendingContest {
  slug: string
  title: string
  entry_count: number
}

export function RightSidebar() {
  const [trending, setTrending] = useState<TrendingContest[]>([])
  const [loading, setLoading] = useState(true)
  const { isRightOpen } = useSidebar()

  useEffect(() => {
    const fetchTrendingContests = async () => {
      try {
        const response = await contestApi.getContests()
        const contests = response.data.results || response.data

        // エントリー数が多い順に並べ替えて上位5件を取得
        const sortedContests = contests
          .filter((c: { entry_count?: number }) => (c.entry_count || 0) > 0) // エントリーがあるものだけ
          .sort((a: { entry_count?: number }, b: { entry_count?: number }) => (b.entry_count || 0) - (a.entry_count || 0))
          .slice(0, 5)
          .map((c: { slug: string; title: string; entry_count?: number }) => ({
            slug: c.slug,
            title: c.title,
            entry_count: c.entry_count,
          }))

        setTrending(sortedContests)
      } catch (error) {
        console.error('Failed to fetch trending contests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingContests()
  }, [])

  return (
    <aside
      className={`sticky top-16 z-40 h-[calc(100vh-4rem)] border-l border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-[-5px_0_30px_rgba(0,0,0,0.1)] transition-all duration-700 ease-in-out ${
        isRightOpen ? 'w-96 opacity-100' : 'w-0 opacity-0'
      }`}
    >
      <div
        className={`h-full overflow-y-auto overflow-x-hidden p-5 space-y-6 w-96 transition-all duration-700 delay-150 scrollbar-custom ${
          isRightOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        {/* トレンディングコンテスト */}
        <div
          className="transition-all duration-500"
          style={{
            transitionDelay: isRightOpen ? '150ms' : '0ms',
            opacity: isRightOpen ? 1 : 0,
            transform: isRightOpen ? 'translateX(0)' : 'translateX(20px)',
          }}
        >
          <h2 className="text-xs font-bold text-pink-600 dark:text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.3)] dark:drop-shadow-[0_0_5px_rgba(236,72,153,0.5)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="text-2xl animate-pulse-slow">🔥</span>
            TRENDING //
          </h2>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Skeleton className="size-6 rounded-md bg-black/10 dark:bg-white/20" />
                      <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-3/4 bg-black/10 dark:bg-white/20" />
                        <Skeleton className="h-3 w-1/2 bg-black/10 dark:bg-white/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : trending.length > 0 ? (
              // コンテスト一覧
              trending.map((contest, index) => (
                <Link
                  key={contest.slug}
                  href={`/contests/${contest.slug}`}
                  style={{
                    transitionDelay: isRightOpen ? `${150 + (index + 1) * 80}ms` : '0ms',
                  }}
                  className={`group block rounded-xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 p-4 transition-all duration-500 hover:border-pink-300 dark:hover:border-pink-500/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.1)] dark:hover:shadow-[0_0_15px_rgba(236,72,153,0.2)] ${
                    isRightOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-black text-pink-500 dark:text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.3)] dark:drop-shadow-[0_0_5px_rgba(236,72,153,0.5)] group-hover:scale-125 transition-transform duration-300">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground/90 truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {contest.title}
                      </h3>
                      <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse-slow shadow-[0_0_5px_rgba(34,197,94,0.3)] dark:shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                        {contest.entry_count} 件の投稿
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // データがない場合
              <div className="p-4 text-center text-foreground/50 text-sm">
                現在、人気のコンテストはありません
              </div>
            )}
          </div>
        </div>

        <Separator
          className="border-white/10 transition-all duration-500"
          style={{
            transitionDelay: isRightOpen ? `${150 + (trending.length + 1) * 80}ms` : '0ms',
            opacity: isRightOpen ? 1 : 0,
          }}
        />

        {/* お知らせ */}
        <div
          className="transition-all duration-500"
          style={{
            transitionDelay: isRightOpen ? `${150 + (trending.length + 2) * 80}ms` : '0ms',
            opacity: isRightOpen ? 1 : 0,
            transform: isRightOpen ? 'translateX(0)' : 'translateX(20px)',
          }}
        >
          <h2 className="text-xs font-bold text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.3)] dark:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="text-2xl">📢</span>
            NOTICES //
          </h2>
          <div className="space-y-3">
            <div className="group p-4 rounded-xl border border-cyan-300 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 hover:border-cyan-500 dark:hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 hover:scale-105 transform-gpu backdrop-blur-sm">
              <p className="text-xs text-cyan-700 dark:text-cyan-300 font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-pulse-slow shadow-[0_0_5px_rgba(6,182,212,0.5)] dark:shadow-[0_0_5px_rgba(6,182,212,0.8)]"></span>
                新機能リリース
              </p>
              <p className="text-xs text-cyan-800 dark:text-cyan-100/70 mt-2">
                投票機能が追加されました
              </p>
            </div>
            <div className="group p-4 rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-105 transform-gpu backdrop-blur-sm">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse-slow shadow-[0_0_5px_rgba(16,185,129,0.5)] dark:shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                メンテナンス完了
              </p>
              <p className="text-xs text-emerald-800 dark:text-emerald-100/70 mt-2">
                サーバーメンテナンスが完了しました
              </p>
            </div>
          </div>
        </div>

        <Separator
          className="transition-all duration-500"
          style={{
            transitionDelay: isRightOpen ? `${150 + (trending.length + 3) * 80}ms` : '0ms',
            opacity: isRightOpen ? 1 : 0,
          }}
        />

        {/* サポート情報 */}
        <div
          className="transition-all duration-500"
          style={{
            transitionDelay: isRightOpen ? `${150 + (trending.length + 4) * 80}ms` : '0ms',
            opacity: isRightOpen ? 1 : 0,
            transform: isRightOpen ? 'translateX(0)' : 'translateX(20px)',
          }}
        >
          <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.3)] dark:drop-shadow-[0_0_5px_rgba(168,85,247,0.5)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            SUPPORT //
          </h2>
          <div className="space-y-2 text-sm">
            <Link
              href="/help"
              className="group flex items-center gap-2 text-foreground/80 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_5px_rgba(168,85,247,0.5)] dark:shadow-[0_0_5px_rgba(168,85,247,0.8)] transition-opacity"></span>
              ヘルプセンター
            </Link>
            <Link
              href="/guidelines"
              className="group flex items-center gap-2 text-foreground/80 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_5px_rgba(168,85,247,0.5)] dark:shadow-[0_0_5px_rgba(168,85,247,0.8)] transition-opacity"></span>
              ガイドライン
            </Link>
            <Link
              href="/faq"
              className="group flex items-center gap-2 text-foreground/80 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_5px_rgba(168,85,247,0.5)] dark:shadow-[0_0_5px_rgba(168,85,247,0.8)] transition-opacity"></span>
              よくある質問
            </Link>
            <Link
              href="/contact"
              className="group flex items-center gap-2 text-foreground/80 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_5px_rgba(168,85,247,0.5)] dark:shadow-[0_0_5px_rgba(168,85,247,0.8)] transition-opacity"></span>
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
