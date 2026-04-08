'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
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

const editContestSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').max(100, 'タイトルは100文字以内で入力してください'),
  description: z.string().optional(),
  start_at: z.string().min(1, '開始日時を入力してください'),
  end_at: z.string().min(1, '終了日時を入力してください'),
  voting_end_at: z.string().optional(),
  is_public: z.boolean(),
  max_entries_per_user: z.string(),
  max_images_per_entry: z.string(),
  unlimitedEntries: z.boolean(),
  unlimitedImages: z.boolean(),
  judging_type: z.enum(['vote', 'score']),
  max_votes_per_judge: z.number().min(1),
  auto_approve_entries: z.boolean(),
  twitter_hashtag: z.string().optional(),
  twitter_auto_fetch: z.boolean(),
  twitter_auto_approve: z.boolean(),
  require_twitter_account: z.boolean(),
  bannerImage: z.any().optional(),
})

type EditContestFormValues = z.infer<typeof editContestSchema>

export default function EditContestPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<EditContestFormValues>({
    resolver: zodResolver(editContestSchema),
    defaultValues: {
      title: '',
      description: '',
      start_at: '',
      end_at: '',
      voting_end_at: '',
      is_public: true,
      max_entries_per_user: '10',
      max_images_per_entry: '100',
      unlimitedEntries: false,
      unlimitedImages: false,
      judging_type: 'vote',
      max_votes_per_judge: 3,
      auto_approve_entries: false,
      twitter_hashtag: '',
      twitter_auto_fetch: false,
      twitter_auto_approve: false,
      require_twitter_account: false,
      bannerImage: null,
    },
  })

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

      form.reset({
        title: contest.title || '',
        description: contest.description || '',
        start_at: formatDateTimeLocal(contest.start_at),
        end_at: formatDateTimeLocal(contest.end_at),
        voting_end_at: contest.voting_end_at ? formatDateTimeLocal(contest.voting_end_at) : '',
        is_public: contest.is_public,
        max_entries_per_user: String(contest.max_entries_per_user || 10),
        max_images_per_entry: String(contest.max_images_per_entry || 100),
        unlimitedEntries: contest.max_entries_per_user === 0,
        unlimitedImages: contest.max_images_per_entry === 0,
        judging_type: (contest.judging_type || 'vote') as JudgingType,
        max_votes_per_judge: contest.max_votes_per_judge || 3,
        auto_approve_entries: contest.auto_approve_entries || false,
        twitter_hashtag: contest.twitter_hashtag || '',
        twitter_auto_fetch: contest.twitter_auto_fetch || false,
        twitter_auto_approve: contest.twitter_auto_approve || false,
        require_twitter_account: contest.require_twitter_account || false,
        bannerImage: null,
      })
    }
  }, [contest, user, slug, router, form])

  const onSubmit = async (values: EditContestFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const data = new FormData()

      // 必須フィールド
      data.append('title', values.title)
      if (values.description) data.append('description', values.description)

      // datetime-localの値をISO形式に変換
      if (values.start_at) {
        const startDate = new Date(values.start_at)
        data.append('start_at', startDate.toISOString())
      }
      if (values.end_at) {
        const endDate = new Date(values.end_at)
        data.append('end_at', endDate.toISOString())
      }

      data.append('is_public', values.is_public.toString())
      // 無制限の場合は0を送信
      data.append('max_entries_per_user', values.unlimitedEntries ? '0' : values.max_entries_per_user)
      data.append('max_images_per_entry', values.unlimitedImages ? '0' : values.max_images_per_entry)
      data.append('auto_approve_entries', values.auto_approve_entries.toString())
      data.append('judging_type', values.judging_type)
      data.append('max_votes_per_judge', values.max_votes_per_judge.toString())

      // オプションフィールド
      if (values.voting_end_at) {
        const votingEndDate = new Date(values.voting_end_at)
        data.append('voting_end_at', votingEndDate.toISOString())
      }
      if (values.twitter_hashtag) {
        data.append('twitter_hashtag', values.twitter_hashtag)
      }
      data.append('twitter_auto_fetch', values.twitter_auto_fetch.toString())
      data.append('twitter_auto_approve', values.twitter_auto_approve.toString())
      data.append('require_twitter_account', values.require_twitter_account.toString())

      // バナー画像（新しい画像がアップロードされた場合のみ）
      if (values.bannerImage) {
        data.append('banner_image', values.bannerImage as File)
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本情報 */}
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormControl>
                <ContestBasicInfoForm
                  title={field.value}
                  description={form.watch('description') ?? ''}
                  slug={slug}
                  bannerImage={null}
                  currentBannerImage={contest.banner_image}
                  onTitleChange={field.onChange}
                  onDescriptionChange={value => form.setValue('description', value)}
                  onBannerImageChange={file => form.setValue('bannerImage', file)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* 日時設定 */}
          <FormField control={form.control} name="start_at" render={({ field }) => (
            <FormItem>
              <FormControl>
                <ContestDatesForm
                  startAt={field.value}
                  endAt={form.watch('end_at')}
                  votingEndAt={form.watch('voting_end_at') ?? ''}
                  onStartAtChange={field.onChange}
                  onEndAtChange={value => form.setValue('end_at', value)}
                  onVotingEndAtChange={value => form.setValue('voting_end_at', value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* 審査方式選択 */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">審査方式</h2>
            <FormField control={form.control} name="judging_type" render={() => (
              <FormItem>
                <FormControl>
                  <JudgingTypeSelector
                    judgingType={form.watch('judging_type') as JudgingType}
                    onJudgingTypeChange={type => form.setValue('judging_type', type)}
                    maxVotesPerJudge={form.watch('max_votes_per_judge')}
                    onMaxVotesChange={value => form.setValue('max_votes_per_judge', value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* 制限設定 */}
          <FormField control={form.control} name="max_entries_per_user" render={() => (
            <FormItem>
              <FormControl>
                <ContestLimitsForm
                  maxEntriesPerUser={form.watch('max_entries_per_user')}
                  maxImagesPerEntry={form.watch('max_images_per_entry')}
                  unlimitedEntries={form.watch('unlimitedEntries')}
                  unlimitedImages={form.watch('unlimitedImages')}
                  onMaxEntriesChange={value => form.setValue('max_entries_per_user', value)}
                  onMaxImagesChange={value => form.setValue('max_images_per_entry', value)}
                  onUnlimitedEntriesChange={value => form.setValue('unlimitedEntries', value)}
                  onUnlimitedImagesChange={value => form.setValue('unlimitedImages', value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* その他設定 */}
          <FormField control={form.control} name="is_public" render={() => (
            <FormItem>
              <FormControl>
                <ContestSettingsForm
                  isPublic={form.watch('is_public')}
                  autoApproveEntries={form.watch('auto_approve_entries')}
                  onIsPublicChange={value => form.setValue('is_public', value)}
                  onAutoApproveChange={value => form.setValue('auto_approve_entries', value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Twitter設定 */}
          <FormField control={form.control} name="twitter_hashtag" render={() => (
            <FormItem>
              <FormControl>
                <TwitterSettings
                  hashtag={form.watch('twitter_hashtag') ?? ''}
                  autoFetch={form.watch('twitter_auto_fetch')}
                  autoApprove={form.watch('twitter_auto_approve')}
                  requireTwitterAccount={form.watch('require_twitter_account')}
                  onHashtagChange={value => form.setValue('twitter_hashtag', value)}
                  onAutoFetchChange={value => form.setValue('twitter_auto_fetch', value)}
                  onAutoApproveChange={value => form.setValue('twitter_auto_approve', value)}
                  onRequireTwitterAccountChange={value => form.setValue('require_twitter_account', value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || form.formState.isSubmitting}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading || form.formState.isSubmitting ? '更新中...' : 'コンテストを更新'}
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
      </Form>
    </div>
  )
}
