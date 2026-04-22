'use client'

import { useQuery } from '@tanstack/react-query'
import { contestApi } from '@/lib/api'
import { useParams } from 'next/navigation'
import { formatDate, getPhaseLabel, getPhaseColor } from '@/lib/utils'
import { EntryGrid } from '@/components/EntryGrid'
import JudgeManager from '@/components/contest/JudgeManager'
import { ContestStatistics } from '@/components/contest/ContestStatistics'
import TwitterImporter from '@/components/contest/TwitterImporter'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth'
import { CustomIcon } from '@/components/ui/custom-icon'

export default function ContestDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  useAuth()

  const { data: contest, isLoading } = useQuery({
    queryKey: ['contest', slug],
    queryFn: async () => {
      const response = await contestApi.getContest(slug)
      return response.data
    },
    staleTime: 1 * 60 * 1000, // 1分間キャッシュ
    refetchOnMount: true, // マウント時に再取得
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500 dark:text-red-400">コンテストが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-purple-500/10 overflow-hidden mb-6 sm:mb-8 border border-gray-200 dark:border-gray-800 animate-fadeInUp">
        {/* バナー画像 */}
        {contest.banner_image && (
          <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
            <Image
              src={contest.banner_image}
              alt={contest.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            {/* バナー上のフェーズバッジ */}
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg backdrop-blur-sm ${getPhaseColor(contest.phase)}`}
              >
                {getPhaseLabel(contest.phase)}
              </span>
            </div>
            {/* バナー上のアクションボタン */}
            <div className="absolute top-4 right-4 flex gap-2">
              {contest.is_judge && (
                <Link
                  href={`/contests/${slug}/judge`}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-purple-600/90 hover:bg-purple-600 backdrop-blur-sm text-white font-bold text-xs sm:text-sm rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
                >
                  ⚖️ 審査する
                </Link>
              )}
              {contest.is_owner && (
                <Link
                  href={`/contests/${slug}/edit`}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900/80 hover:bg-gray-900 backdrop-blur-sm text-white font-bold text-xs sm:text-sm rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1.5"
                >
                  <CustomIcon name="edit" size={16} className="brightness-0 invert" />
                  編集
                </Link>
              )}
              {contest.phase === 'submission' && (
                <Link
                  href={`/submit?contest=${slug}`}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600/90 hover:bg-blue-600 backdrop-blur-sm text-white font-bold text-xs sm:text-sm rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
                >
                  ✨ 作品を投稿
                </Link>
              )}
            </div>
          </div>
        )}

        {/* コンテンツ部分 */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* バナーがない場合のヘッダー */}
          {!contest.banner_image && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <span
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-white shadow-md ${getPhaseColor(contest.phase)}`}
              >
                {getPhaseLabel(contest.phase)}
              </span>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {contest.is_judge && (
                  <Link
                    href={`/contests/${slug}/judge`}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu text-center"
                  >
                    ⚖️ 審査する
                  </Link>
                )}
                {contest.is_owner && (
                  <Link
                    href={`/contests/${slug}/edit`}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu text-center flex items-center justify-center gap-2"
                  >
                    <CustomIcon name="edit" size={20} className="brightness-0 invert" />
                    編集
                  </Link>
                )}
                {contest.phase === 'submission' && (
                  <Link
                    href={`/submit?contest=${slug}`}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu text-center"
                  >
                    ✨ 作品を投稿
                  </Link>
                )}
              </div>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight">
            {contest.title}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
            {contest.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-sm">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <CustomIcon name="calendar" size={28} />
                <span className="font-bold text-purple-900 dark:text-purple-300">
                  応募期間
                </span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                {formatDate(contest.start_at)} 〜 {formatDate(contest.end_at)}
              </span>
            </div>
            {contest.voting_end_at && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1 text-blue-900 dark:text-blue-300">
                  <CustomIcon name="vote" size={24} />
                  <span className="font-bold">投票終了</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDate(contest.voting_end_at)}
                </span>
              </div>
            )}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1 text-green-900 dark:text-green-300">
                <CustomIcon name="camera" size={24} />
                <span className="font-bold">応募数</span>
              </div>
              <span className="text-2xl font-black text-gray-700 dark:text-gray-100">
                {contest.entry_count} <span className="text-sm font-normal">件</span>
              </span>
            </div>
          </div>

          {/* Twitter連携必須の表示 */}
          {contest.require_twitter_account && (
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <span className="text-2xl">𝕏</span>
                <div>
                  <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                    X (Twitter) アカウント連携が必須
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    このコンテストに投稿するには、X (Twitter) アカウントとの連携が必要です。
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 審査員管理 */}
      {contest.is_owner && <JudgeManager contestSlug={slug} isOwner={contest.is_owner} />}

      {/* ツイートURL手動登録（コンテスト作成者のみ表示） */}
      {contest.is_owner && <TwitterImporter contestSlug={slug} />}

      {/* 統計情報（コンテスト作成者のみ表示） */}
      {contest.is_owner && (
        <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '50ms' }}>
          <ContestStatistics contestSlug={slug} />
        </div>
      )}

      {/* エントリー一覧 */}
      <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <h2 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
          <CustomIcon name="entries" size={32} />
          投稿作品
        </h2>
        <EntryGrid contestSlug={slug} />
      </div>
    </div>
  )
}
