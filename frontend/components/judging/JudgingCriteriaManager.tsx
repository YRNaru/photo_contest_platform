'use client';

import { useState, useEffect } from 'react';
import { JudgingCriteria, Category, CreateJudgingCriteriaRequest } from '@/types/judging';
import { judgingCriteriaApi, categoryApi } from '@/lib/api';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface JudgingCriteriaManagerProps {
  contestId: number;
  isOwner: boolean;
}

export function JudgingCriteriaManager({ contestId, isOwner }: JudgingCriteriaManagerProps) {
  const [criteria, setCriteria] = useState<JudgingCriteria[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<JudgingCriteria | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_score: 10,
    order: 0,
    category_id: '',
  });

  useEffect(() => {
    loadData();
  }, [contestId, selectedCategoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [criteriaRes, categoriesRes] = await Promise.all([
        judgingCriteriaApi.getCriteria(contestId, selectedCategoryFilter || undefined),
        categoryApi.getCategories(contestId),
      ]);
      setCriteria(criteriaRes.data);
      setCategories(categoriesRes.data);
      setError(null);
    } catch (err: any) {
      setError('審査基準の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data: CreateJudgingCriteriaRequest = {
        contest: contestId,
        name: formData.name,
        description: formData.description,
        max_score: formData.max_score,
        order: formData.order,
        category: formData.category_id ? parseInt(formData.category_id) : null,
      };

      if (editingCriterion) {
        await judgingCriteriaApi.updateCriterion(editingCriterion.id, data);
      } else {
        await judgingCriteriaApi.createCriterion(data);
      }

      await loadData();
      resetForm();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '審査基準の保存に失敗しました';
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この審査基準を削除しますか？')) return;

    try {
      await judgingCriteriaApi.deleteCriterion(id);
      await loadData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '審査基準の削除に失敗しました';
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleEdit = (criterion: JudgingCriteria) => {
    setEditingCriterion(criterion);
    setFormData({
      name: criterion.name,
      description: criterion.description,
      max_score: criterion.max_score,
      order: criterion.order,
      category_id: criterion.category?.toString() || '',
    });
    setIsAddingCriterion(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      max_score: 10,
      order: criteria.length,
      category_id: '',
    });
    setEditingCriterion(null);
    setIsAddingCriterion(false);
  };

  const getTotalMaxScore = () => {
    return criteria
      .filter(c => !selectedCategoryFilter || c.category === selectedCategoryFilter)
      .reduce((sum, c) => sum + c.max_score, 0);
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            審査基準管理
          </h2>
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

      {/* 部門フィルター */}
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            部門でフィルター
          </label>
          <select
            value={selectedCategoryFilter || ''}
            onChange={(e) => setSelectedCategoryFilter(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">全部門</option>
            <option value="0">全部門共通</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 審査基準追加/編集フォーム */}
      {isAddingCriterion && isOwner && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {editingCriterion ? '審査基準を編集' : '新しい審査基準を追加'}
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
              評価項目名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) || 1 })}
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
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                部門
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">全部門共通</option>
                {categories.map((cat) => (
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
              {editingCriterion ? '更新' : '追加'}
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

      {/* 合計点数表示 */}
      {criteria.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              合計最大点数
            </span>
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
        <div className="grid gap-4">
          {criteria.map((criterion) => (
            <div
              key={criterion.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {criterion.description}
                    </p>
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

                {isOwner && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(criterion)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(criterion.id)}
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

