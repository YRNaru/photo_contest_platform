'use client';

import { useState, useEffect } from 'react';
import { JudgingCriteria, Category, CreateJudgingCriteriaRequest } from '@/types/judging';
import { judgingCriteriaApi, categoryApi } from '@/lib/api';
import { PlusIcon } from '@heroicons/react/24/outline';
import { JudgingCriteriaForm } from './JudgingCriteriaForm';
import { JudgingCriteriaItem } from './JudgingCriteriaItem';
import { CategoryFilter } from './CategoryFilter';
import { ScoreTotalDisplay } from './ScoreTotalDisplay';

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
          formData={formData}
          isEditing={!!editingCriterion}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          onChange={(data) => setFormData({ ...formData, ...data })}
        />
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
            <JudgingCriteriaItem
              key={criterion.id}
              criterion={criterion}
              isOwner={isOwner}
              onEdit={() => handleEdit(criterion)}
              onDelete={() => handleDelete(criterion.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

