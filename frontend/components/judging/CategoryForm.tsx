'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'

interface CategoryFormData {
  name: string
  description: string
  order: number
  max_votes_per_judge: string
}

interface CategoryFormProps {
  formData: CategoryFormData
  isEditing: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onChange: (data: Partial<CategoryFormData>) => void
}

export function CategoryForm({
  formData,
  isEditing,
  onSubmit,
  onCancel,
  onChange,
}: CategoryFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isEditing ? '部門を編集' : '新しい部門を追加'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          部門名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => onChange({ name: e.target.value })}
          required
          placeholder="例: 風景部門、人物部門、グランプリ"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          説明
        </label>
        <textarea
          value={formData.description}
          onChange={e => onChange({ description: e.target.value })}
          rows={3}
          placeholder="部門の説明（任意）"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            表示順
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={e => onChange({ order: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            最大投票数（任意）
          </label>
          <input
            type="number"
            value={formData.max_votes_per_judge}
            onChange={e => onChange({ max_votes_per_judge: e.target.value })}
            placeholder="コンテスト設定を使用"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">未設定の場合、コンテストの設定を使用</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          {isEditing ? '更新' : '追加'}
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
  )
}
