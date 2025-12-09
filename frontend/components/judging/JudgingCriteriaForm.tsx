'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { Category } from '@/types/judging'

interface CriteriaFormData {
  name: string
  description: string
  max_score: number
  order: number
  category_id: string
}

interface JudgingCriteriaFormProps {
  formData: CriteriaFormData
  isEditing: boolean
  categories: Category[]
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onChange: (data: Partial<CriteriaFormData>) => void
}

export function JudgingCriteriaForm({
  formData,
  isEditing,
  categories,
  onSubmit,
  onCancel,
  onChange,
}: JudgingCriteriaFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isEditing ? '審査基準を編集' : '新しい審査基準を追加'}
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
          評価項目名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => onChange({ name: e.target.value })}
          required
          placeholder="例: 構図、色彩、独創性"
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
          rows={2}
          placeholder="評価項目の説明（任意）"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            最大点数 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={formData.max_score}
            onChange={e => onChange({ max_score: parseInt(e.target.value) || 1 })}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

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
            部門
          </label>
          <select
            value={formData.category_id}
            onChange={e => onChange({ category_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">全部門共通</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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
