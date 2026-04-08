'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'

export const categoryFormSchema = z.object({
  name: z.string().min(1, '賞の名前を入力してください'),
  description: z.string().optional(),
  order: z.number().min(0, '0以上の数値を入力してください'),
  max_votes_per_judge: z.string().optional(),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
  initialData: CategoryFormValues
  isEditing: boolean
  onSubmit: (data: CategoryFormValues) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({
  initialData,
  isEditing,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset(initialData)
  }, [initialData, form])

  const handleSubmitWrapper = async (values: CategoryFormValues) => {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitWrapper)}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? '賞を編集' : '新しい賞を追加'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              賞の名前 <span className="text-red-500">*</span>
            </label>
            <FormControl>
              <input
                {...field}
                placeholder="例: グランプリ、風景賞、人物賞、技術賞"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              説明
            </label>
            <FormControl>
              <textarea
                {...field}
                value={field.value || ''}
                rows={3}
                placeholder="賞の説明（任意）"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="order" render={({ field }) => (
            <FormItem>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                表示順
              </label>
              <FormControl>
                <input
                  type="number"
                  value={field.value}
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="max_votes_per_judge" render={({ field }) => (
            <FormItem>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                最大投票数（任意）
              </label>
              <FormControl>
                <input
                  type="number"
                  {...field}
                  value={field.value || ''}
                  placeholder="コンテスト設定を使用"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </FormControl>
              <p className="text-xs text-gray-500 mt-1">未設定の場合、コンテストの設定を使用</p>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {form.formState.isSubmitting ? '処理中...' : isEditing ? '更新' : '追加'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            キャンセル
          </button>
        </div>
      </form>
    </Form>
  )
}
