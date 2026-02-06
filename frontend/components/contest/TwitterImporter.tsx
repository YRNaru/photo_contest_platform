'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contestApi } from '@/lib/api'

interface TwitterImporterProps {
  contestSlug: string
}

export default function TwitterImporter({ contestSlug }: TwitterImporterProps) {
  const [tweetUrl, setTweetUrl] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const importMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await contestApi.importTweet(contestSlug, url)
      return response.data
    },
    onSuccess: () => {
      // エントリー一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['entries', contestSlug] })
      queryClient.invalidateQueries({ queryKey: ['contest', contestSlug] })
      
      // フォームをリセット
      setTweetUrl('')
      setIsOpen(false)
      
      // 成功メッセージ
      alert('ツイートから応募を作成しました！')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.response?.data?.tweet_url?.[0] || 'エラーが発生しました'
      alert(`エラー: ${errorMessage}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tweetUrl.trim()) {
      alert('ツイートURLを入力してください')
      return
    }
    importMutation.mutate(tweetUrl)
  }

  return (
    <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '25ms' }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🐦</span>
            ツイートから応募を登録
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            {isOpen ? '閉じる' : '開く'}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              過去のツイートも手動で登録できます。ツイートのURLを入力してください。
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tweet-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ツイートURL
                </label>
                <input
                  id="tweet-url"
                  type="url"
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  placeholder="https://twitter.com/username/status/1234567890"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={importMutation.isPending}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  例: https://twitter.com/username/status/1234567890 または https://x.com/username/status/1234567890
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={importMutation.isPending || !tweetUrl.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      取得中...
                    </span>
                  ) : (
                    '登録'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setTweetUrl('')}
                  disabled={importMutation.isPending}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  クリア
                </button>
              </div>
            </form>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 使い方</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Twitter/Xのツイートページを開き、URLをコピー</li>
                <li>上のフォームにURLを貼り付けて「登録」をクリック</li>
                <li>画像付きのツイートのみ登録できます</li>
                <li>既に登録済みのツイートは重複登録できません</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
