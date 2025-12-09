'use client'

import { useState, useEffect } from 'react'
import { Category, CreateCategoryRequest } from '@/types/judging'
import { categoryApi } from '@/lib/api'
import { PlusIcon } from '@heroicons/react/24/outline'
import { CategoryForm } from './CategoryForm'
import { CategoryItem } from './CategoryItem'

interface CategoryManagerProps {
  contestId: number
  contestSlug: string
  isOwner: boolean
}

export function CategoryManager({ contestId, contestSlug, isOwner }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    max_votes_per_judge: '',
  })

  useEffect(() => {
    loadCategories()
  }, [contestId])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryApi.getCategories(contestId)
      // ページネーション対応: results配列がある場合はそれを使用、なければdata自体を使用
      const categoriesData = Array.isArray(response.data) ? response.data : response.data.results || []
      setCategories(categoriesData)
      setError(null)
    } catch (err: any) {
      setError('賞の読み込みに失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data: CreateCategoryRequest = {
        contest: contestId,
        name: formData.name,
        description: formData.description,
        order: formData.order,
        max_votes_per_judge: formData.max_votes_per_judge
          ? parseInt(formData.max_votes_per_judge)
          : null,
      }

      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, data)
      } else {
        await categoryApi.createCategory(data)
      }

      await loadCategories()
      resetForm()
    } catch (err: any) {
      console.error('賞作成エラー:', err)
      console.error('エラーレスポンス:', err.response?.data)
      
      // エラーメッセージを取得
      let errorMsg = '賞の保存に失敗しました'
      if (err.response?.data) {
        if (err.response.data.detail) {
          errorMsg = err.response.data.detail
        } else if (typeof err.response.data === 'object') {
          // フィールドごとのエラーを表示
          const errors = Object.entries(err.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n')
          errorMsg = errors
        }
      }
      setError(errorMsg)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この賞を削除しますか？')) return

    try {
      await categoryApi.deleteCategory(id)
      await loadCategories()
    } catch (err: any) {
      console.error('賞削除エラー:', err)
      console.error('エラーレスポンス:', err.response?.data)
      
      let errorMsg = '賞の削除に失敗しました'
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail
      }
      setError(errorMsg)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      order: category.order,
      max_votes_per_judge: category.max_votes_per_judge?.toString() || '',
    })
    setIsAddingCategory(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      order: categories.length,
      max_votes_per_judge: '',
    })
    setEditingCategory(null)
    setIsAddingCategory(false)
  }

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">賞の管理</h2>
        {isOwner && !isAddingCategory && (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <PlusIcon className="w-5 h-5" />
            賞を追加
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 賞の追加/編集フォーム */}
      {isAddingCategory && isOwner && (
        <CategoryForm
          formData={formData}
          isEditing={!!editingCategory}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          onChange={data => setFormData({ ...formData, ...data })}
        />
      )}

      {/* 賞一覧 */}
      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>賞がまだ作成されていません</p>
          {isOwner && (
            <p className="text-sm mt-2">「賞を追加」ボタンから賞を作成してください</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map(category => (
            <CategoryItem
              key={category.id}
              category={category}
              isOwner={isOwner}
              onEdit={() => handleEdit(category)}
              onDelete={() => handleDelete(category.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
