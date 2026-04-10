'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { contestApi, categoryApi, entryViewApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'
import { VotingPanel } from '@/components/judging/VotingPanel'
import { ScoringPanel } from '@/components/judging/ScoringPanel'
import { CategoryManager } from '@/components/judging/CategoryManager'
import { JudgingCriteriaManager } from '@/components/judging/JudgingCriteriaManager'
import { Category } from '@/types/judging'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { CustomIcon } from '@/components/ui/custom-icon'

export default function JudgingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { isLoading: authLoading } = useAuth()

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'judge' | 'manage'>('judge')
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null)
  const [ordering, setOrdering] = useState('-created_at')
  const [viewedFilter, setViewedFilter] = useState<'all' | 'viewed' | 'unviewed'>('all')

  // コンテスト情報を取得
  const { data: contest, isLoading: contestLoading } = useQuery({
    queryKey: ['contest', slug],
    queryFn: async () => {
      const response = await contestApi.getContest(slug)
      return response.data
    },
  })

  // エントリー一覧を取得
  const { data: entriesData, refetch: refetchEntries } = useQuery({
    queryKey: ['contest-entries', slug, ordering],
    queryFn: async () => {
      const response = await contestApi.getContestEntries(slug, { ordering })
      return response.data
    },
    enabled: !!contest,
  })

  // 賞一覧を取得
  const { data: categories } = useQuery({
    queryKey: ['categories', contest?.id],
    queryFn: async () => {
      if (!contest || !contest.id) return []
      const response = await categoryApi.getCategories(contest.id)
      // ページネーション対応
      const categoriesData = Array.isArray(response.data) ? response.data : response.data.results || []
      return categoriesData as Category[]
    },
    enabled: !!contest,
  })

  // 閲覧済みエントリーIDを取得
  const { data: viewedData } = useQuery({
    queryKey: ['viewed-entries', slug],
    queryFn: async () => {
      const response = await entryViewApi.getViewedEntryIds()
      return response.data.viewed_entry_ids || []
    },
    enabled: !!contest && contest.is_judge,
  })

  // 審査員チェック
  useEffect(() => {
    if (!authLoading && !contestLoading && contest) {
      if (!contest.is_judge && !contest.is_owner) {
        router.push(`/contests/${slug}`)
      }
    }
  }, [authLoading, contestLoading, contest, router, slug])

  if (authLoading || contestLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">コンテストが見つかりません</div>
      </div>
    )
  }

  const allEntries = entriesData?.results || entriesData || []
  const viewedEntryIds = (viewedData as string[]) || []
  
  // フィルタリング適用
  const entries = allEntries.filter((entry: { id: string }) => {
    if (viewedFilter === 'viewed') return viewedEntryIds.includes(entry.id)
    if (viewedFilter === 'unviewed') return !viewedEntryIds.includes(entry.id)
    return true
  })
  
  const judgingType = contest.judging_type || 'vote'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">審査画面</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{contest.title}</p>
          </div>
          <button
            onClick={() => router.push(`/contests/${slug}`)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            ← コンテストに戻る
          </button>
        </div>

        {/* 審査方式バッジ */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
            {judgingType === 'vote' ? (
              <span className="flex items-center gap-1.5">
                <CustomIcon name="support" size={20} />
                投票方式
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CustomIcon name="star" size={20} />
                点数方式
              </span>
            )}
          </span>
          {contest.phase === 'submission' && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              📝 応募期間中
            </span>
          )}
        </div>
      </div>

      {/* タブ */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('judge')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'judge'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            審査する
          </button>
          {contest.is_owner && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'manage'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              設定管理
            </button>
          )}
        </div>
      </div>

      {/* コンテンツ */}
      {activeTab === 'judge' ? (
        <div>
          {/* ソートとフィルター */}
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  並び順
                </label>
                <Select value={ordering} onValueChange={setOrdering}>
                  <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                    <SelectValue placeholder="並び順を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created_at">
                      <div className="flex items-center gap-2">
                        <CustomIcon name="sort-new" size={20} />
                        <span>新着順</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="created_at">
                      <div className="flex items-center gap-2">
                        <CustomIcon name="sort-old" size={20} />
                        <span>古い順</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="-vote_count">
                      <div className="flex items-center gap-2">
                        <CustomIcon name="sort-hot" size={20} />
                        <span>人気順</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="vote_count">
                      <div className="flex items-center gap-2">
                        <CustomIcon name="sort-trend" size={20} />
                        <span>投票数少ない順</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  閲覧状態
                </label>
                <Select 
                  value={viewedFilter} 
                  onValueChange={(v) => setViewedFilter(v as 'all' | 'viewed' | 'unviewed')}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                    <SelectValue placeholder="閲覧状態を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて ({allEntries.length}件)</SelectItem>
                    <SelectItem value="unviewed">未閲覧のみ ({allEntries.filter((e: { id: string }) => !viewedEntryIds.includes(e.id)).length}件)</SelectItem>
                    <SelectItem value="viewed">閲覧済みのみ ({viewedEntryIds.length}件)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 投票方式 */}
          {judgingType === 'vote' && (
            <VotingPanel
              contestSlug={slug}
              contestId={contest.id}
              entries={entries}
              maxVotesPerJudge={contest.max_votes_per_judge || 3}
              isJudge={contest.is_judge || false}
              viewedEntryIds={viewedEntryIds}
              onVoteChange={() => refetchEntries()}
            />
          )}

          {/* 賞選択（点数方式のみ） */}
          {judgingType === 'score' && categories && categories.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                賞を選択
              </label>
              <select
                value={selectedCategory || ''}
                onChange={e =>
                  setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">全体</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 点数方式 */}
          {judgingType === 'score' && (
            <div>
              {!selectedEntryId ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    審査する作品を選択してください
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entries.map((entry: { id: number; title: string; thumbnail?: string; author?: { username: string }; twitter_username?: string }) => (
                      <div
                        key={entry.id}
                        className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-purple-600 dark:hover:border-purple-400 transition-all"
                      >
                        {entry.thumbnail && (
                          <div className="relative h-48 bg-gray-100 dark:bg-gray-900">
                            <Image
                              src={entry.thumbnail}
                              alt={entry.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {entry.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            投稿者: {entry.author ? entry.author.username : entry.twitter_username ? `@${entry.twitter_username}` : '不明'}
                          </p>
                          
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => setSelectedEntryId(entry.id)}
                              className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                            >
                              採点する
                            </button>
                            <Link
                              href={`/entries/${entry.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                            >
                              詳細
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setSelectedEntryId(null)}
                    className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ← 作品一覧に戻る
                  </button>
                  <ScoringPanel
                    entry={entries.find((e: { id: number }) => e.id === selectedEntryId)}
                    contestId={contest.id}
                    categoryId={selectedCategory}
                    isJudge={contest.is_judge || false}
                    onScoreSubmit={() => {
                      setSelectedEntryId(null)
                      refetchEntries()
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* 賞の管理 */}
          <CategoryManager
            contestId={contest.id}
            contestSlug={slug}
            isOwner={contest.is_owner || false}
          />

          {/* 審査基準管理（点数方式の場合のみ） */}
          {judgingType === 'score' && (
            <div className="mt-8">
              <JudgingCriteriaManager
                contestId={contest.id}
                isOwner={contest.is_owner || false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
