'use client'

import { JudgingType } from '@/types/judging'

interface JudgingTypeSelectorProps {
  judgingType: JudgingType
  onJudgingTypeChange: (type: JudgingType) => void
  maxVotesPerJudge: number
  onMaxVotesChange: (value: number) => void
}

export function JudgingTypeSelector({
  judgingType,
  onJudgingTypeChange,
  maxVotesPerJudge,
  onMaxVotesChange,
}: JudgingTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          審査方式
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 投票方式 */}
          <button
            type="button"
            onClick={() => onJudgingTypeChange('vote')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              judgingType === 'vote'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
            }`}
          >
            <div className="flex items-start">
              <div
                className={`mt-1 mr-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  judgingType === 'vote' ? 'border-purple-600' : 'border-gray-400'
                }`}
              >
                {judgingType === 'vote' && (
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">投票方式</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  審査員が気に入った作品に投票します。シンプルで分かりやすい方式です。
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-500 mt-2 space-y-1">
                  <li>✓ 審査員ごとに投票数を制限</li>
                  <li>✓ 部門ごとに投票</li>
                  <li>✓ 投票数でランキング表示</li>
                </ul>
              </div>
            </div>
          </button>

          {/* 点数方式 */}
          <button
            type="button"
            onClick={() => onJudgingTypeChange('score')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              judgingType === 'score'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
            }`}
          >
            <div className="flex items-start">
              <div
                className={`mt-1 mr-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  judgingType === 'score' ? 'border-purple-600' : 'border-gray-400'
                }`}
              >
                {judgingType === 'score' && (
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">点数方式</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  審査基準に基づいて各項目に点数をつけます。詳細な評価が可能です。
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-500 mt-2 space-y-1">
                  <li>✓ 審査基準（評価項目）を設定</li>
                  <li>✓ 各基準に点数を配分</li>
                  <li>✓ 総合点でランキング表示</li>
                </ul>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 投票方式の場合の設定 */}
      {judgingType === 'vote' && (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            審査員あたり最大投票数
          </label>
          <input
            type="number"
            min="1"
            value={maxVotesPerJudge}
            onChange={e => onMaxVotesChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            各審査員が投票できる作品の数を設定します（部門ごとに個別設定も可能）
          </p>
        </div>
      )}

      {/* 点数方式の場合の説明 */}
      {judgingType === 'score' && (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>次のステップ：</strong>{' '}
            コンテスト作成後、部門管理画面で審査基準（評価項目）を設定してください。
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            例：構図（10点）、色彩（10点）、独創性（10点）など
          </p>
        </div>
      )}
    </div>
  )
}
