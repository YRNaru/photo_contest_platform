'use client'

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { JudgingCriteria } from '@/types/judging'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface JudgingCriteriaItemProps {
  criterion: JudgingCriteria
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
}

export function JudgingCriteriaItem({
  criterion,
  isOwner,
  onEdit,
  onDelete,
}: JudgingCriteriaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: criterion.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* ドラッグハンドル */}
          {isOwner && (
            <button
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab touch-none rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="ドラッグして並び替え"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="5" cy="3" r="1.5" />
                <circle cx="11" cy="3" r="1.5" />
                <circle cx="5" cy="8" r="1.5" />
                <circle cx="11" cy="8" r="1.5" />
                <circle cx="5" cy="13" r="1.5" />
                <circle cx="11" cy="13" r="1.5" />
              </svg>
            </button>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {criterion.name}
              </h3>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm font-medium">
                {criterion.max_score}点
              </span>
            </div>
            {criterion.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{criterion.description}</p>
            )}
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>表示順: {criterion.order}</span>
              {criterion.category_name ? (
                <span>部門: {criterion.category_name}</span>
              ) : (
                <span>全部門共通</span>
              )}
            </div>
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
