'use client';

import { useState, useEffect } from 'react';
import { Category, CreateCategoryRequest } from '@/types/judging';
import { categoryApi } from '@/lib/api';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CategoryManagerProps {
  contestId: number;
  contestSlug: string;
  isOwner: boolean;
}

export function CategoryManager({ contestId, contestSlug, isOwner }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    max_votes_per_judge: '',
  });

  useEffect(() => {
    loadCategories();
  }, [contestId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getCategories(contestId);
      setCategories(response.data);
      setError(null);
    } catch (err: any) {
      setError('部門の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data: CreateCategoryRequest = {
        contest: contestId,
        name: formData.name,
        description: formData.description,
        order: formData.order,
        max_votes_per_judge: formData.max_votes_per_judge
          ? parseInt(formData.max_votes_per_judge)
          : null,
      };

      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, data);
      } else {
        await categoryApi.createCategory(data);
      }

      await loadCategories();
      resetForm();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '部門の保存に失敗しました';
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この部門を削除しますか？')) return;

    try {
      await categoryApi.deleteCategory(id);
      await loadCategories();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '部門の削除に失敗しました';
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      order: category.order,
      max_votes_per_judge: category.max_votes_per_judge?.toString() || '',
    });
    setIsAddingCategory(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      order: categories.length,
      max_votes_per_judge: '',
    });
    setEditingCategory(null);
    setIsAddingCategory(false);
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          部門管理
        </h2>
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
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {editingCategory ? '部門を編集' : '新しい部門を追加'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, max_votes_per_judge: e.target.value })}
                placeholder="コンテスト設定を使用"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                未設定の場合、コンテストの設定を使用
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {editingCategory ? '更新' : '追加'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              キャンセル
            </button>
          </div>
        </form>
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
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {category.description}
                    </p>
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
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

