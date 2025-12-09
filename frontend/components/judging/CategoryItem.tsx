'use client'

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Category } from '@/types/judging'

interface CategoryItemProps {
  category: Category
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
}

export function CategoryItem({ category, isOwner, onEdit, onDelete }: CategoryItemProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
          )}
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>エントリー数: {category.entry_count}</span>
            <span>表示順: {category.order}</span>
            {category.max_votes_per_judge && (
              <span>最大投票数: {category.max_votes_per_judge}</span>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
