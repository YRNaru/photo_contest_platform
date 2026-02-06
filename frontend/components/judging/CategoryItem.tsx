'use client'

import { PencilIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { Category } from '@/types/judging'
import { useState } from 'react'
import { categoryApi } from '@/lib/api'

interface CategoryItemProps {
  category: Category
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
  onStageAdvanced?: () => void
}

export function CategoryItem({ category, isOwner, onEdit, onDelete, onStageAdvanced }: CategoryItemProps) {
  const [advanceCheck, setAdvanceCheck] = useState<{
    can_advance: boolean
    message: string
  } | null>(null)
  const [isAdvancing, setIsAdvancing] = useState(false)

  const checkAdvance = async () => {
    try {
      const response = await categoryApi.checkAdvanceStage(category.id)
      setAdvanceCheck(response.data)
    } catch (err) {
      console.error('段階チェックエラー:', err)
    }
  }

  const handleAdvanceStage = async () => {
    if (!confirm('次の段階に進みますか？')) return

    try {
      setIsAdvancing(true)
      await categoryApi.advanceStage(category.id)
      alert('次の段階に進みました')
      onStageAdvanced?.()
    } catch (err: any) {
      alert(err.response?.data?.detail || '段階移行に失敗しました')
    } finally {
      setIsAdvancing(false)
    }
  }

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
            <span>エントリー数: {category.entry_count || 0}</span>
            <span>表示順: {category.order}</span>
            {category.max_votes_per_judge && (
              <span>最大投票数: {category.max_votes_per_judge}</span>
            )}
          </div>

          {/* 段階審査情報 */}
          {category.enable_stages && (
            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                    段階審査: {category.current_stage} / {category.stage_count}
                  </p>
                  {category.stage_settings?.[String(category.current_stage)] && (
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      {category.stage_settings[String(category.current_stage)].name} (投票数: {category.stage_settings[String(category.current_stage)].max_votes})
                    </p>
                  )}
                </div>

                {isOwner && category.current_stage < category.stage_count && (
                  <div className="flex gap-2">
                    <button
                      onClick={checkAdvance}
                      className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    >
                      条件確認
                    </button>
                    <button
                      onClick={handleAdvanceStage}
                      disabled={isAdvancing || !!(advanceCheck && advanceCheck.can_advance === false)}
                      className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {isAdvancing ? '処理中...' : (
                        <>
                          次へ進む
                          <ArrowRightIcon className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {advanceCheck && (
                <p className={`text-xs mt-2 ${advanceCheck.can_advance ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {advanceCheck.message}
                </p>
              )}
            </div>
          )}
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
