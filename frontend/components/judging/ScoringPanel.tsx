'use client';

import { useState, useEffect } from 'react';
import { JudgingCriteria, JudgeScore, CreateJudgeScoreRequest } from '@/types/judging';
import { judgingCriteriaApi, judgeScoreApi } from '@/lib/api';
import Image from 'next/image';

interface ScoringPanelProps {
  entry: any;
  contestId: number;
  categoryId?: number | null;
  isJudge: boolean;
  onScoreSubmit?: () => void;
}

export function ScoringPanel({
  entry,
  contestId,
  categoryId,
  isJudge,
  onScoreSubmit,
}: ScoringPanelProps) {
  const [criteria, setCriteria] = useState<JudgingCriteria[]>([]);
  const [existingScore, setExistingScore] = useState<JudgeScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<{ [criteriaId: number]: { score: number; comment: string } }>({});
  const [generalComment, setGeneralComment] = useState('');

  useEffect(() => {
    loadData();
  }, [contestId, categoryId, entry.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const criteriaRes = await judgingCriteriaApi.getCriteria(contestId, categoryId || undefined);
      setCriteria(criteriaRes.data);

      // 既存のスコアをロード
      try {
        const scoresRes = await judgeScoreApi.getMyScores();
        const existingScore = scoresRes.data.find(
          (s: JudgeScore) => s.entry === entry.id && s.category === categoryId
        );
        
        if (existingScore) {
          setExistingScore(existingScore);
          setGeneralComment(existingScore.comment);
          
          // 詳細スコアを設定
          const scoreMap: { [key: number]: { score: number; comment: string } } = {};
          existingScore.detailed_scores.forEach(ds => {
            scoreMap[ds.criteria] = {
              score: Number(ds.score),
              comment: ds.comment,
            };
          });
          setScores(scoreMap);
        }
      } catch (err) {
        // 既存スコアがなくてもOK
        console.log('既存スコアなし');
      }

      setError(null);
    } catch (err: any) {
      setError('審査基準の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (criteriaId: number, score: number) => {
    setScores({
      ...scores,
      [criteriaId]: {
        ...scores[criteriaId],
        score,
      },
    });
  };

  const handleCommentChange = (criteriaId: number, comment: string) => {
    setScores({
      ...scores,
      [criteriaId]: {
        ...scores[criteriaId],
        comment,
      },
    });
  };

  const getTotalScore = () => {
    return criteria.reduce((sum, criterion) => {
      return sum + (scores[criterion.id]?.score || 0);
    }, 0);
  };

  const getTotalMaxScore = () => {
    return criteria.reduce((sum, criterion) => sum + criterion.max_score, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isJudge) {
      setError('審査員のみスコアを登録できます');
      return;
    }

    // 全ての基準にスコアが入力されているかチェック
    const missingScores = criteria.filter(c => scores[c.id]?.score === undefined);
    if (missingScores.length > 0) {
      setError(`全ての評価項目に点数を入力してください（未入力: ${missingScores.map(c => c.name).join(', ')}）`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const data: CreateJudgeScoreRequest = {
        entry: entry.id,
        category: categoryId || null,
        comment: generalComment,
        detailed_scores: criteria.map(criterion => ({
          criteria: criterion.id,
          score: scores[criterion.id]?.score || 0,
          comment: scores[criterion.id]?.comment || '',
        })),
      };

      if (existingScore) {
        await judgeScoreApi.updateScore(existingScore.id, data);
      } else {
        await judgeScoreApi.createScore(data);
      }

      onScoreSubmit?.();
      alert('スコアを登録しました');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'スコアの登録に失敗しました';
      setError(errorMsg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isJudge) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          審査員のみスコアを登録できます
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (criteria.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          審査基準が設定されていません
        </p>
        <p className="text-sm text-gray-500 mt-2">
          コンテスト主催者に審査基準の設定を依頼してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* エントリー情報 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {entry.title}
          </h2>
          {entry.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {entry.description}
            </p>
          )}
        </div>
      </div>

      {/* 総合スコア表示 */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              現在の合計点
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              最大 {getTotalMaxScore()} 点
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {getTotalScore()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              点
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* スコア入力フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 各審査基準の点数入力 */}
        {criteria.map((criterion) => {
          const currentScore = scores[criterion.id]?.score || 0;
          const currentComment = scores[criterion.id]?.comment || '';
          
          return (
            <div
              key={criterion.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {criterion.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    最大 {criterion.max_score} 点
                  </span>
                </div>
                {criterion.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {criterion.description}
                  </p>
                )}
              </div>

              {/* スコア入力 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  点数 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max={criterion.max_score}
                    step="0.5"
                    value={currentScore}
                    onChange={(e) => handleScoreChange(criterion.id, parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max={criterion.max_score}
                    step="0.5"
                    value={currentScore}
                    onChange={(e) => handleScoreChange(criterion.id, parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center font-bold"
                  />
                </div>
              </div>

              {/* コメント入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  コメント（任意）
                </label>
                <textarea
                  value={currentComment}
                  onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                  rows={2}
                  placeholder="この項目についてのコメント"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          );
        })}

        {/* 総評コメント */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            総評コメント（任意）
          </label>
          <textarea
            value={generalComment}
            onChange={(e) => setGeneralComment(e.target.value)}
            rows={4}
            placeholder="作品全体についての総評"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {submitting ? '送信中...' : existingScore ? 'スコアを更新' : 'スコアを登録'}
        </button>
      </form>
    </div>
  );
}

