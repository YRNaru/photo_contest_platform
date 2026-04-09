'use client'

import { useState, useEffect, useCallback } from 'react'
import { JudgingCriteria, Category, CreateJudgingCriteriaRequest } from '@/types/judging'
import { judgingCriteriaApi, categoryApi } from '@/lib/api'
import { PlusIcon } from '@heroicons/react/24/outline'
import { JudgingCriteriaForm, CriteriaFormValues } from './JudgingCriteriaForm'
import { JudgingCriteriaItem } from './JudgingCriteriaItem'
import { CategoryFilter } from './CategoryFilter'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'

interface JudgingCriteriaManagerProps {
  contestId: number
  isOwner: boolean
}

export function JudgingCriteriaManager({ contestId, isOwner }: JudgingCriteriaManagerProps) {
  const [criteria, setCriteria] = useState<JudgingCriteria[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingCriterion, setIsAddingCriterion] = useState(false)
  const [editingCriterion, setEditingCriterion] = useState<JudgingCriteria | null>(null)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null)

  const [initialData, setInitialData] = useState<CriteriaFormValues>({
    name: '',
    description: '',
    max_score: 10,
    order: 0,
    category_id: '',
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [criteriaRes, categoriesRes] = await Promise.all([
        judgingCriteriaApi.getCriteria(contestId, selectedCategoryFilter || undefined),
        categoryApi.getCategories(contestId),
      ])
      // ページネーション対応
      const criteriaData = Array.isArray(criteriaRes.data) ? criteriaRes.data : criteriaRes.data.results || []
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.results || []
      setCriteria(criteriaData)
      setCategories(categoriesData)
      setError(null)
    } catch (err: unknown) {
      setError('審査基準の読み込みに失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [contestId, selectedCategoryFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  /** ドラッグ&ドロップ完了時に並び順を更新 */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = criteria.findIndex(c => c.id === active.id)
    const newIndex = criteria.findIndex(c => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    // 楽観的更新: UIを先に更新してからAPIを呼ぶ
    const reordered = arrayMove(criteria, oldIndex, newIndex)
    setCriteria(reordered)

    // 各審査基準の order を更新
    try {
      await Promise.all(
        reordered.map((criterion, index) =>
          judgingCriteriaApi.updateCriterion(criterion.id, { order: index } as Record<string, unknown>)
        )
      )
    } catch (err: unknown) {
      console.error('並び替え保存エラー:', err)
      setError('並び順の保存に失敗しました。ページを再読み込みしてください。')
      // 失敗した場合は元の状態に戻す
      await loadData()
    }
  }

  const handleSubmit = async (values: CriteriaFormValues) => {
    try {
      const data: CreateJudgingCriteriaRequest = {
        contest: contestId,
        name: values.name,
        description: values.description || '',
        max_score: values.max_score,
        order: values.order,
        category: values.category_id ? parseInt(values.category_id) : null,
      }

      if (editingCriterion) {
        await judgingCriteriaApi.updateCriterion(editingCriterion.id, data as unknown as Record<string, unknown>)
      } else {
        await judgingCriteriaApi.createCriterion(data as unknown as Record<string, unknown>)
      }

      await loadData()
      resetForm()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      const errorMsg = error.response?.data?.detail || '審査基準の保存に失敗しました'
      setError(errorMsg)
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この審査基準を削除しますか？')) return

    try {
      await judgingCriteriaApi.deleteCriterion(id)
      await loadData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      const errorMsg = error.response?.data?.detail || '審査基準の削除に失敗しました'
      setError(errorMsg)
      console.error(err)
    }
  }

  const handleEdit = (criterion: JudgingCriteria) => {
    setEditingCriterion(criterion)
    setInitialData({
      name: criterion.name,
      description: criterion.description,
      max_score: criterion.max_score,
      order: criterion.order,
      category_id: criterion.category?.toString() || '',
    })
    setIsAddingCriterion(true)
  }

  const resetForm = () => {
    setInitialData({
      name: '',
      description: '',
      max_score: 10,
      order: criteria.length,
      category_id: '',
    })
    setEditingCriterion(null)
    setIsAddingCriterion(false)
  }

  const getTotalMaxScore = () => {
    return criteria
      .filter(c => !selectedCategoryFilter || c.category === selectedCategoryFilter)
      .reduce((sum, c) => sum + c.max_score, 0)
  }

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">審査基準管理</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            点数方式の評価項目を設定します
          </p>
        </div>
        {isOwner && !isAddingCriterion && (
          <button
            onClick={() => setIsAddingCriterion(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <PlusIcon className="w-5 h-5" />
            審査基準を追加
          </button>
        )}
      </div>

      {/* 賞フィルター */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategoryFilter}
        onCategoryChange={setSelectedCategoryFilter}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 審査基準追加/編集フォーム */}
      {isAddingCriterion && isOwner && (
        <JudgingCriteriaForm
          initialData={initialData}
          isEditing={!!editingCriterion}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {/* 合計点数表示 */}
      {criteria.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">合計最大点数</span>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {getTotalMaxScore()} 点
            </span>
          </div>
        </div>
      )}

      {/* 審査基準一覧 */}
      {criteria.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>審査基準がまだ作成されていません</p>
          {isOwner && (
            <p className="text-sm mt-2">点数方式を使用する場合は、審査基準を作成してください</p>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={criteria.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {criteria.map(criterion => (
                <JudgingCriteriaItem
                  key={criterion.id}
                  criterion={criterion}
                  isOwner={isOwner}
                  onEdit={() => handleEdit(criterion)}
                  onDelete={() => handleDelete(criterion.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
