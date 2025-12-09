'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { contestApi } from '@/lib/api'
import { ContestBasicInfoForm } from '@/components/contest/ContestBasicInfoForm'
import { ContestDatesForm } from '@/components/contest/ContestDatesForm'
import { ContestLimitsForm } from '@/components/contest/ContestLimitsForm'
import { ContestSettingsForm } from '@/components/contest/ContestSettingsForm'
import { TwitterSettings } from '@/components/contest/TwitterSettings'
import { JudgingTypeSelector } from '@/components/contest/JudgingTypeSelector'
import { Contest } from '@/lib/types'
import { JudgingType } from '@/types/judging'
import { useAuth } from '@/lib/auth'

export default function EditContestPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    voting_end_at: '',
    is_public: true,
    max_entries_per_user: '10',
    max_images_per_entry: '100',
    judging_type: 'vote' as JudgingType,
    max_votes_per_judge: 3,
    auto_approve_entries: false,
    twitter_hashtag: '',
    twitter_auto_fetch: false,
    twitter_auto_approve: false,
    require_twitter_account: false,
  })

  const [bannerImage, setBannerImage] = useState<File | null>(null)
  const [unlimitedEntries, setUnlimitedEntries] = useState(false)
  const [unlimitedImages, setUnlimitedImages] = useState(false)

  // コンテスト情報を取得（キャッシュを使わず常に最新データを取得）
  const { data: contest, isLoading: contestLoading } = useQuery({
    queryKey: ['contest-edit', slug],
    queryFn: async () => {
      const response = await contestApi.getContest(slug)
      return response.data as Contest
    },
    staleTime: 0,
    gcTime: 0,
  })

  // コンテスト情報が取得できたらフォームに設定
  useEffect(() => {
    if (contest) {
      // 権限チェック: 作成者またはスタッフのみ編集可能
      if (!contest.is_owner && !user?.is_staff) {
        router.push(`/contests/${slug}`)
        return
      }

      // ISO形式の日時を datetime-local 形式に変換
      const formatDateTimeLocal = (isoString: string) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        title: contest.title || '',
        description: contest.description || '',
        start_at: formatDateTimeLocal(contest.start_at),
        end_at: formatDateTimeLocal(contest.end_at),
        voting_end_at: contest.voting_end_at ? formatDateTimeLocal(contest.voting_end_at) : '',
        is_public: contest.is_public,
        max_entries_per_user: String(contest.max_entries_per_user || 10),
        max_images_per_entry: String(contest.max_images_per_entry || 100),
        judging_type: (contest.judging_type || 'vote') as JudgingType,
        max_votes_per_judge: contest.max_votes_per_judge || 3,
        auto_approve_entries: contest.auto_approve_entries || false,
        twitter_hashtag: contest.twitter_hashtag || '',
        twitter_auto_fetch: contest.twitter_auto_fetch || false,
        twitter_auto_approve: contest.twitter_auto_approve || false,
        require_twitter_account: contest.require_twitter_account || false,
      })

      // 無制限フラグを設定（0の場合は無制限）
      setUnlimitedEntries(contest.max_entries_per_user === 0)
      setUnlimitedImages(contest.max_images_per_entry === 0)
    }
  }, [contest, user, slug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = new FormData()

      // 必須フィールド
      data.append('title', formData.title)
      data.append('description', formData.description)

      // datetime-localの値をISO形式に変換
      if (formData.start_at) {
        const startDate = new Date(formData.start_at)
        data.append('start_at', startDate.toISOString())
      }
      if (formData.end_at) {
        const endDate = new Date(formData.end_at)
        data.append('end_at', endDate.toISOString())
      }

      data.append('is_public', formData.is_public.toString())
      // 無制限の場合は0を送信
      data.append('max_entries_per_user', unlimitedEntries ? '0' : formData.max_entries_per_user)
      data.append('max_images_per_entry', unlimitedImages ? '0' : formData.max_images_per_entry)
      data.append('auto_approve_entries', formData.auto_approve_entries.toString())
      data.append('judging_type', formData.judging_type)
      data.append('max_votes_per_judge', formData.max_votes_per_judge.toString())

      // オプションフィールド
      if (formData.voting_end_at) {
        const votingEndDate = new Date(formData.voting_end_at)
        data.append('voting_end_at', votingEndDate.toISOString())
      }
      if (formData.twitter_hashtag) {
        data.append('twitter_hashtag', formData.twitter_hashtag)
      }
      data.append('twitter_auto_fetch', formData.twitter_auto_fetch.toString())
      data.append('twitter_auto_approve', formData.twitter_auto_approve.toString())
      data.append('require_twitter_account', formData.require_twitter_account.toString())

      // バナー画像（新しい画像がアップロードされた場合のみ）
      if (bannerImage) {
        data.append('banner_image', bannerImage)
      }

      await contestApi.updateContest(slug, data)

      // キャッシュをクリア
      queryClient.invalidateQueries({ queryKey: ['contests'] })
      queryClient.invalidateQueries({ queryKey: ['contest', slug] })
      queryClient.invalidateQueries({ queryKey: ['contest-edit', slug] })
      queryClient.removeQueries({ queryKey: ['contest-edit', slug] })

      // 更新したコンテストの詳細ページにリダイレクト
      router.push(`/contests/${slug}`)
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown } }
      console.error('コンテスト更新エラー:', err)
      console.error('エラーレスポンス:', error.response?.data)

      // エラーメッセージを整形
      let errorMessage = 'コンテストの更新に失敗しました。'
      if (error.response?.data) {
        const data = error.response.data as { detail?: string } | string
        if (typeof data === 'string') {
          errorMessage = data
        } else if (data.detail) {
          errorMessage = data.detail
        } else {
          // フィールドごとのエラーを表示
          const errors = Object.entries(data as Record<string, unknown>)
            .map(([field, messages]: [string, unknown]) => {
              const fieldName = field === 'non_field_errors' ? '' : `${field}: `
              return `${fieldName}${Array.isArray(messages) ? messages.join(', ') : String(messages)}`
            })
            .join('\n')
          errorMessage = errors || JSON.stringify(data)
        }
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ローディング中
  if (authLoading || contestLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    )
  }

  // コンテストが見つからない場合
  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          コンテストが見つかりません
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">コンテストを編集</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <ContestBasicInfoForm
          title={formData.title}
          description={formData.description}
          slug={slug}
          bannerImage={bannerImage}
          currentBannerImage={contest.banner_image}
          onTitleChange={value => setFormData({ ...formData, title: value })}
          onDescriptionChange={value => setFormData({ ...formData, description: value })}
          onBannerImageChange={setBannerImage}
        />

        {/* 日時設定 */}
        <ContestDatesForm
          startAt={formData.start_at}
          endAt={formData.end_at}
          votingEndAt={formData.voting_end_at}
          onStartAtChange={value => setFormData({ ...formData, start_at: value })}
          onEndAtChange={value => setFormData({ ...formData, end_at: value })}
          onVotingEndAtChange={value => setFormData({ ...formData, voting_end_at: value })}
        />

        {/* 審査方式選択 */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">審査方式</h2>
          <JudgingTypeSelector
            judgingType={formData.judging_type}
            onJudgingTypeChange={type => setFormData({ ...formData, judging_type: type })}
            maxVotesPerJudge={formData.max_votes_per_judge}
            onMaxVotesChange={value => setFormData({ ...formData, max_votes_per_judge: value })}
          />
        </div>

        {/* 制限設定 */}
        <ContestLimitsForm
          maxEntriesPerUser={formData.max_entries_per_user}
          maxImagesPerEntry={formData.max_images_per_entry}
          unlimitedEntries={unlimitedEntries}
          unlimitedImages={unlimitedImages}
          onMaxEntriesChange={value => setFormData({ ...formData, max_entries_per_user: value })}
          onMaxImagesChange={value => setFormData({ ...formData, max_images_per_entry: value })}
          onUnlimitedEntriesChange={setUnlimitedEntries}
          onUnlimitedImagesChange={setUnlimitedImages}
        />

        {/* その他設定 */}
        <ContestSettingsForm
          isPublic={formData.is_public}
          autoApproveEntries={formData.auto_approve_entries}
          onIsPublicChange={value => setFormData({ ...formData, is_public: value })}
          onAutoApproveChange={value => setFormData({ ...formData, auto_approve_entries: value })}
        />

        {/* Twitter設定 */}
        <TwitterSettings
          hashtag={formData.twitter_hashtag}
          autoFetch={formData.twitter_auto_fetch}
          autoApprove={formData.twitter_auto_approve}
          requireTwitterAccount={formData.require_twitter_account}
          onHashtagChange={value => setFormData({ ...formData, twitter_hashtag: value })}
          onAutoFetchChange={value => setFormData({ ...formData, twitter_auto_fetch: value })}
          onAutoApproveChange={value => setFormData({ ...formData, twitter_auto_approve: value })}
          onRequireTwitterAccountChange={value =>
            setFormData({ ...formData, require_twitter_account: value })
          }
        />

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '更新中...' : 'コンテストを更新'}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/contests/${slug}`)}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
