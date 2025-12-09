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
      setCategories(response.data)
      setError(null)
    } catch (err: any) {
      setError('部門の読み込みに失敗しました')
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
      const errorMsg = err.response?.data?.detail || '部門の保存に失敗しました'
      setError(errorMsg)
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この部門を削除しますか？')) return

    try {
      await categoryApi.deleteCategory(id)
      await loadCategories()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '部門の削除に失敗しました'
      setError(errorMsg)
      console.error(err)
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">部門管理</h2>
        {isOwner && !isAddingCategory && (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <PlusIcon className="w-5 h-5" />
            部門を追加
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 部門追加/編集フォーム */}
      {isAddingCategory && isOwner && (
        <CategoryForm
          formData={formData}
          isEditing={!!editingCategory}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          onChange={data => setFormData({ ...formData, ...data })}
        />
      )}

      {/* 部門一覧 */}
      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>部門がまだ作成されていません</p>
          {isOwner && (
            <p className="text-sm mt-2">「部門を追加」ボタンから部門を作成してください</p>
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
