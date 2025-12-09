'use client'

import { useState, useEffect, useCallback } from 'react'
import { JudgingCriteria, JudgeScore, CreateJudgeScoreRequest } from '@/types/judging'
import { judgingCriteriaApi, judgeScoreApi } from '@/lib/api'
import { ScoreCriterionInput } from './ScoreCriterionInput'
import { ScoreTotalDisplay } from './ScoreTotalDisplay'
import { GeneralCommentInput } from './GeneralCommentInput'
import { EntryHeader } from './EntryHeader'

interface ScoringPanelProps {
  entry: any
  contestId: number
  categoryId?: number | null
  isJudge: boolean
  onScoreSubmit?: () => void
}

export function ScoringPanel({
  entry,
  contestId,
  categoryId,
  isJudge,
  onScoreSubmit,
}: ScoringPanelProps) {
  const [criteria, setCriteria] = useState<JudgingCriteria[]>([])
  const [existingScore, setExistingScore] = useState<JudgeScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scores, setScores] = useState<{
    [criteriaId: number]: { score: number; comment: string }
  }>({})
  const [generalComment, setGeneralComment] = useState('')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const criteriaRes = await judgingCriteriaApi.getCriteria(contestId, categoryId || undefined)
      // ページネーション対応
      const criteriaData = Array.isArray(criteriaRes.data) ? criteriaRes.data : criteriaRes.data.results || []
      setCriteria(criteriaData)

      // 既存のスコアをロード
      try {
        const scoresRes = await judgeScoreApi.getMyScores()
        // ページネーション対応
        const scoresData = (Array.isArray(scoresRes.data) ? scoresRes.data : scoresRes.data.results || []) as JudgeScore[]
        const existingScore = scoresData.find(
          (s) => s.entry === entry.id && s.category === categoryId
        )

        if (existingScore) {
          setExistingScore(existingScore)
          setGeneralComment(existingScore.comment)

          // 詳細スコアを設定
          const scoreMap: { [key: number]: { score: number; comment: string } } = {}
          existingScore.detailed_scores.forEach((ds) => {
            scoreMap[ds.criteria] = {
              score: Number(ds.score),
              comment: ds.comment,
            }
          })
          setScores(scoreMap)
        }
      } catch (err) {
        // 既存スコアがなくてもOK
        console.log('既存スコアなし')
      }

      setError(null)
    } catch (err: unknown) {
      setError('審査基準の読み込みに失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [contestId, categoryId, entry.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleScoreChange = (criteriaId: number, score: number) => {
    setScores({
      ...scores,
      [criteriaId]: {
        ...scores[criteriaId],
        score,
      },
    })
  }

  const handleCommentChange = (criteriaId: number, comment: string) => {
    setScores({
      ...scores,
      [criteriaId]: {
        ...scores[criteriaId],
        comment,
      },
    })
  }

  const getTotalScore = () => {
    return criteria.reduce((sum, criterion) => {
      return sum + (scores[criterion.id]?.score || 0)
    }, 0)
  }

  const getTotalMaxScore = () => {
    return criteria.reduce((sum, criterion) => sum + criterion.max_score, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isJudge) {
      setError('審査員のみスコアを登録できます')
      return
    }

    // 全ての基準にスコアが入力されているかチェック
    const missingScores = criteria.filter(c => scores[c.id]?.score === undefined)
    if (missingScores.length > 0) {
      setError(
        `全ての評価項目に点数を入力してください（未入力: ${missingScores.map(c => c.name).join(', ')}）`
      )
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const data: CreateJudgeScoreRequest = {
        entry: entry.id,
        category: categoryId || null,
        comment: generalComment,
        detailed_scores: criteria.map(criterion => ({
          criteria: criterion.id,
          score: scores[criterion.id]?.score || 0,
          comment: scores[criterion.id]?.comment || '',
        })),
      }

      if (existingScore) {
        await judgeScoreApi.updateScore(existingScore.id, data as unknown as Record<string, unknown>)
      } else {
        await judgeScoreApi.createScore(data)
      }

      onScoreSubmit?.()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      const errorMsg = error.response?.data?.detail || 'スコアの登録に失敗しました'
      setError(errorMsg)
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isJudge) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">審査員のみスコアを登録できます</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>
  }

  if (criteria.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">審査基準が設定されていません</p>
        <p className="text-sm text-gray-500 mt-2">
          コンテスト主催者に審査基準の設定を依頼してください
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* エントリー情報 */}
      <EntryHeader title={entry.title} description={entry.description} />

      {/* 総合スコア表示 */}
      <ScoreTotalDisplay currentTotal={getTotalScore()} maxTotal={getTotalMaxScore()} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* スコア入力フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 各審査基準の点数入力 */}
        {criteria.map(criterion => (
          <ScoreCriterionInput
            key={criterion.id}
            criterionId={criterion.id}
            criterionName={criterion.name}
            criterionDescription={criterion.description}
            maxScore={criterion.max_score}
            currentScore={scores[criterion.id]?.score || 0}
            currentComment={scores[criterion.id]?.comment || ''}
            onScoreChange={score => handleScoreChange(criterion.id, score)}
            onCommentChange={comment => handleCommentChange(criterion.id, comment)}
          />
        ))}

        {/* 総評コメント */}
        <GeneralCommentInput value={generalComment} onChange={setGeneralComment} />

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
  )
}
