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
      className={`sticky top-16 z-40 h-[calc(100vh-4rem)] border-l border-border bg-muted/30 shadow-sm transition-all duration-700 ease-in-out dark:bg-muted/10 ${
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
          <h2 className="text-sm font-bold bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-300 dark:to-pink-300 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <span className="text-2xl animate-pulse-slow">🔥</span>
            人気のコンテスト
          </h2>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Skeleton className="size-6 rounded-md" />
                      <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
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
                  className={`group block rounded-xl border border-border bg-card p-4 transition-all duration-500 hover:border-primary/40 hover:bg-accent/50 hover:shadow-md ${
                    isRightOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent group-hover:scale-125 transition-transform duration-300">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors">
                        {contest.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse-slow"></span>
                        {contest.entry_count} 件の投稿
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // データがない場合
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                現在、人気のコンテストはありません
              </div>
            )}
          </div>
        </div>

        <Separator
          className="transition-all duration-500"
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
          <h2 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <span className="text-2xl">📢</span>
            お知らせ
          </h2>
          <div className="space-y-3">
            <div className="group p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 border-2 border-blue-200 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu">
              <p className="text-xs text-blue-900 dark:text-blue-100 font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-600 dark:bg-blue-300 rounded-full animate-pulse-slow"></span>
                新機能リリース
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-2">
                投票機能が追加されました
              </p>
            </div>
            <div className="group p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 border-2 border-green-200 dark:border-green-600 hover:border-green-400 dark:hover:border-green-400 hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu">
              <p className="text-xs text-green-900 dark:text-green-100 font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-600 dark:bg-green-300 rounded-full animate-pulse-slow"></span>
                メンテナンス完了
              </p>
              <p className="text-xs text-green-700 dark:text-green-200 mt-2">
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
          <h2 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            サポート
          </h2>
          <div className="space-y-2 text-sm">
            <Link
              href="/help"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              ヘルプセンター
            </Link>
            <Link
              href="/guidelines"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              ガイドライン
            </Link>
            <Link
              href="/faq"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              よくある質問
            </Link>
            <Link
              href="/contact"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
