'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { contestApi, userApi } from '@/lib/api'
import { ContestFormInput } from '@/components/contest/ContestFormInput'
import { DateTimeInput } from '@/components/contest/DateTimeInput'
import { TwitterSettings } from '@/components/contest/TwitterSettings'
import { JudgeSelector } from '@/components/contest/JudgeSelector'
import { JudgingTypeSelector } from '@/components/contest/JudgingTypeSelector'
import { JudgingType } from '@/types/judging'

const createContestSchema = z.object({
  slug: z.string().min(1, 'スラッグを入力してください').regex(/^[a-zA-Z0-9-]+$/, '英数字とハイフンのみ使用可能です'),
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
  selectedJudgeIds: z.array(z.string()),
  creatorAsJudge: z.boolean(),
})

type CreateContestFormValues = z.infer<typeof createContestSchema>

export default function CreateContestPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // デバッグ用: ユーザー情報を確認
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    console.log('アクセストークン:', token ? '存在する' : '存在しない')
  }

  const form = useForm<CreateContestFormValues>({
    resolver: zodResolver(createContestSchema),
    defaultValues: {
      slug: '',
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
      selectedJudgeIds: [],
      creatorAsJudge: false,
    },
  })

  // watch for disabled states
  const unlimitedEntries = form.watch('unlimitedEntries')
  const unlimitedImages = form.watch('unlimitedImages')

  const onSubmit = async (values: CreateContestFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const data = new FormData()

      // 必須フィールド
      data.append('slug', values.slug)
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

      // バナー画像
      if (values.bannerImage) {
        data.append('banner_image', values.bannerImage as File)
      }

      const response = await contestApi.createContest(data)
      const createdContest = response.data

      console.log('作成されたコンテスト:', createdContest)

      // 審査員を追加（コンテスト作成後）
      const slug = createdContest.slug
      if (slug) {
        try {
          // 主催者自身を審査員に追加
          if (values.creatorAsJudge) {
            const meResponse = await userApi.me()
            const currentUser = meResponse.data
            await contestApi.addJudge(slug, currentUser.id)
            console.log('主催者を審査員として追加しました')
          }

          // 選択された審査員を追加
          for (const judgeId of values.selectedJudgeIds) {
            await contestApi.addJudge(slug, judgeId)
            console.log(`審査員(ID: ${judgeId})を追加しました`)
          }
        } catch (judgeErr: unknown) {
          console.error('審査員の追加中にエラーが発生:', judgeErr)
          // 審査員追加に失敗してもコンテストは作成されているので、警告として表示
          const error = judgeErr as { response?: { data?: { detail?: string } } }
          const judgeError =
            error.response?.data?.detail ||
            '一部の審査員の追加に失敗しました。コンテスト詳細ページから手動で追加できます。'
          setError(judgeError)
        }

        // キャッシュをクリア
        queryClient.invalidateQueries({ queryKey: ['contests'] })
        queryClient.invalidateQueries({ queryKey: ['contest', slug] })
        queryClient.removeQueries({ queryKey: ['users'] })
        queryClient.removeQueries({ queryKey: ['current-user'] })

        router.push(`/contests/${slug}`)
      } else {
        // slugがない場合はコンテスト一覧へ
        queryClient.invalidateQueries({ queryKey: ['contests'] })
        router.push('/contests')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown } }
      console.error('コンテスト作成エラー:', err)
      console.error('エラーレスポンス:', error.response?.data)

      // エラーメッセージを整形
      let errorMessage = 'コンテストの作成に失敗しました。'
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">新しいコンテストを作成</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="slug" render={({ field }) => (
            <FormItem>
              <FormControl>
                <ContestFormInput
                  label="スラッグ（URL用）"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  placeholder="summer-photo-2024"
                  helperText="英数字とハイフンのみ使用可能"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormControl>
                <ContestFormInput
                  label="タイトル"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  placeholder="夏のフォトコンテスト2024"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormControl>
                <ContestFormInput
                  label="説明"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  type="textarea"
                  placeholder="コンテストの説明を入力してください"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="bannerImage" render={({ field }) => (
            <FormItem>
              <FormControl>
                <ContestFormInput
                  label="バナー画像"
                  value=""
                  onChange={() => {}}
                  type="file"
                  accept="image/*"
                  onFileChange={e => field.onChange(e.target.files?.[0] || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="start_at" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DateTimeInput
                    label="開始日時"
                    value={field.value}
                    onChange={field.onChange}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="end_at" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DateTimeInput
                    label="終了日時"
                    value={field.value}
                    onChange={field.onChange}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="voting_end_at" render={({ field }) => (
            <FormItem>
              <FormControl>
                <DateTimeInput
                  label="投票終了日時（任意）"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  helperText="未設定の場合、投票機能は無効になります"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ユーザーあたり最大応募数 */}
            <FormField control={form.control} name="max_entries_per_user" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div>
                    <ContestFormInput
                      label="ユーザーあたり最大応募数"
                      value={field.value}
                      onChange={field.onChange}
                      type="number"
                      disabled={unlimitedEntries}
                    />
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={unlimitedEntries}
                        onChange={e => form.setValue('unlimitedEntries', e.target.checked)}
                        className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">無制限</span>
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* エントリーあたり最大画像数 */}
            <FormField control={form.control} name="max_images_per_entry" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div>
                    <ContestFormInput
                      label="エントリーあたり最大画像数"
                      value={field.value}
                      onChange={field.onChange}
                      type="number"
                      disabled={unlimitedImages}
                    />
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={unlimitedImages}
                        onChange={e => form.setValue('unlimitedImages', e.target.checked)}
                        className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">無制限</span>
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="space-y-2">
            <FormField control={form.control} name="is_public" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">公開する</span>
                  </label>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="auto_approve_entries" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      投稿を自動承認する
                    </span>
                  </label>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
              有効にすると、ユーザーが投稿した作品が自動的に承認されます
            </p>
          </div>

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

          {/* 審査員設定 */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">審査員設定</h2>
            <FormField control={form.control} name="selectedJudgeIds" render={() => (
              <FormItem>
                <FormControl>
                  <JudgeSelector
                    selectedJudgeIds={form.watch('selectedJudgeIds')}
                    onJudgesChange={val => form.setValue('selectedJudgeIds', val)}
                    creatorAsJudge={form.watch('creatorAsJudge')}
                    onCreatorAsJudgeChange={val => form.setValue('creatorAsJudge', val)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || form.formState.isSubmitting}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading || form.formState.isSubmitting ? '作成中...' : 'コンテストを作成'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              キャンセル
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
