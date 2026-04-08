'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { contestApi, entryApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { ContestSelect } from '@/components/submit/ContestSelect'
import { EntryLimitInfo } from '@/components/submit/EntryLimitInfo'
import { FormInput } from '@/components/submit/FormInput'
import { ImageUploadSection } from '@/components/submit/ImageUploadSection'
import { ErrorDisplay } from '@/components/submit/ErrorDisplay'
import { SubmitButton } from '@/components/submit/SubmitButton'
import { TagSelector } from '@/components/submit/TagSelector'

const submitSchema = z.object({
  contest: z.string().min(1, 'コンテストを選択してください'),
  title: z.string().min(1, 'タイトルを入力してください').max(100, 'タイトルは100文字以内で入力してください'),
  description: z.string().optional(),
  tags: z.array(z.string()),
  images: z.array(z.any()).min(1, '画像を1枚以上アップロードしてください').max(5, '画像は最大5枚までアップロードできます'),
})

type SubmitFormValues = z.infer<typeof submitSchema>

function SubmitPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contestSlug = searchParams.get('contest')
  const { isAuthenticated } = useAuth()

  const [error, setError] = useState('')

  const form = useForm<SubmitFormValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      contest: contestSlug || '',
      title: '',
      description: '',
      tags: [],
      images: [],
    },
  })

  const selectedContest = form.watch('contest')

  // コンテスト一覧取得
  const { data: contests } = useQuery({
    queryKey: ['contests'],
    queryFn: async () => {
      const response = await contestApi.getContests()
      return response.data.results || response.data
    },
  })

  // 選択されたコンテストの詳細を取得
  const { data: contestDetail } = useQuery({
    queryKey: ['contest', selectedContest],
    queryFn: async () => {
      if (!selectedContest) return null
      const response = await contestApi.getContest(selectedContest)
      return response.data
    },
    enabled: !!selectedContest,
  })

  // ユーザーの既存エントリーを取得
  const { data: userEntries } = useQuery({
    queryKey: ['user-entries', selectedContest],
    queryFn: async () => {
      if (!selectedContest || !isAuthenticated) return []
      const response = await entryApi.getEntries({ contest: selectedContest })
      const allEntries = response.data.results || response.data
      // 現在のユーザーのエントリーのみフィルター（クライアント側で）
      return allEntries
    },
    enabled: !!selectedContest && isAuthenticated,
  })

  // 画像追加ハンドラー
  const handleImagesAdd = (acceptedFiles: File[]) => {
    const currentImages = form.getValues('images')
    if (currentImages.length + acceptedFiles.length > 5) {
      form.setError('images', { type: 'manual', message: '画像は最大5枚までアップロードできます' })
      return
    }
    form.setValue('images', [...currentImages, ...acceptedFiles], { shouldValidate: true })
    form.clearErrors('images')
  }

  const removeImage = (index: number) => {
    const currentImages = form.getValues('images')
    form.setValue('images', currentImages.filter((_, i) => i !== index), { shouldValidate: true })
  }

  // 投稿mutation
  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await entryApi.createEntry(formData)
      return response.data
    },
    onSuccess: data => {
      router.push(`/entries/${data.id}`)
    },
    onError: (error: { response?: { data?: unknown; status?: number; headers?: unknown } }) => {
      console.error('投稿エラー:', error)
      console.error('エラーレスポンス:', error.response?.data)
      console.error('エラーステータス:', error.response?.status)
      console.error('エラーヘッダー:', error.response?.headers)

      // エラーメッセージを整形
      let errorMessage = '投稿に失敗しました。'
      if (error.response?.data) {
        const data = error.response.data as Record<string, unknown>
        
        // non_field_errorsの中身を詳細に表示
        if (data.non_field_errors) {
          console.error('non_field_errors 詳細:', data.non_field_errors)
          if (Array.isArray(data.non_field_errors)) {
            data.non_field_errors.forEach((err: unknown, index: number) => {
              console.error(`  [${index}]:`, err)
            })
          }
        }

        if (typeof data === 'string') {
          errorMessage = data
        } else if (data.detail && typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors)
            ? data.non_field_errors.map(String).join('\n')
            : String(data.non_field_errors)
        } else {
          // フィールドごとのエラーを表示
          const errors = Object.entries(data)
            .map(([field, messages]: [string, unknown]) => {
              const fieldName = field === 'non_field_errors' ? '' : `${field}: `
              return `${fieldName}${Array.isArray(messages) ? messages.join(', ') : String(messages)}`
            })
            .join('\n')
          errorMessage = errors || JSON.stringify(data)
        }
      }
      setError(errorMessage)
    },
  })

  const onSubmit = (values: SubmitFormValues) => {
    if (!isAuthenticated) {
      setError('ログインしてください')
      return
    }

    const formData = new FormData()
    formData.append('contest', values.contest)
    formData.append('title', values.title)
    if (values.description) {
      formData.append('description', values.description)
    }
    formData.append('tags', values.tags.join(', '))
    values.images.forEach(image => {
      formData.append('images', image as File)
    })

    submitMutation.mutate(formData)
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700">
          <span className="text-7xl mb-6 block">🔒</span>
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            ログインが必要です
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            作品を投稿するにはGoogleアカウントでログインしてください
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-fadeInUp">
        📸 作品を投稿
      </h1>

      {contestDetail && userEntries && (
        <EntryLimitInfo
          maxEntriesPerUser={contestDetail.max_entries_per_user}
          currentEntriesCount={userEntries.length}
        />
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 animate-fadeInUp"
          style={{ animationDelay: '100ms' }}
        >
          <FormField
            control={form.control}
            name="contest"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ContestSelect value={field.value} onChange={field.onChange} contests={contests} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    label="タイトル"
                    icon="✏️"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="作品のタイトルを入力"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    label="説明"
                    icon="📝"
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="作品の説明を入力"
                    multiline
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* タグ選択 */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-purple-500/10 p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🏷️</span>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">タグ</h2>
                    </div>
                    <TagSelector selectedTags={field.value} onTagsChange={field.onChange} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploadSection
                    images={field.value}
                    onImagesAdd={handleImagesAdd}
                    onImageRemove={removeImage}
                    maxImages={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ErrorDisplay error={error} />
          <SubmitButton isSubmitting={form.formState.isSubmitting || submitMutation.isPending} />
        </form>
      </Form>
    </div>
  )
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">読み込み中...</div>}>
      <SubmitPageContent />
    </Suspense>
  )
}
