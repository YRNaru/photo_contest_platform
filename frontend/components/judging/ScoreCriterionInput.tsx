'use client'

interface ScoreCriterionInputProps {
  criterionId: number
  criterionName: string
  criterionDescription?: string
  maxScore: number
  currentScore: number
  currentComment: string
  onScoreChange: (score: number) => void
  onCommentChange: (comment: string) => void
}

export function ScoreCriterionInput({
  criterionId: _criterionId,
  criterionName,
  criterionDescription,
  maxScore,
  currentScore,
  currentComment,
  onScoreChange,
  onCommentChange,
}: ScoreCriterionInputProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {criterionName}
          </h3>
          <span className="text-sm text-gray-500">最大 {maxScore} 点</span>
        </div>
        {criterionDescription && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{criterionDescription}</p>
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
            max={maxScore}
            step="0.5"
            value={currentScore}
            onChange={e => onScoreChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            min="0"
            max={maxScore}
            step="0.5"
            value={currentScore}
            onChange={e => onScoreChange(parseFloat(e.target.value) || 0)}
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
          onChange={e => onCommentChange(e.target.value)}
          rows={2}
          placeholder="この項目についてのコメント"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
    </div>
  )
}
