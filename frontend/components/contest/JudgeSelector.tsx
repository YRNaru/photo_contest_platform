'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/lib/api'
import { User } from '@/lib/types'
import Image from 'next/image'
import { CustomIcon } from '../ui/custom-icon'

interface JudgeSelectorProps {
  selectedJudgeIds: string[]
  onJudgesChange: (judgeIds: string[]) => void
  creatorAsJudge: boolean
  onCreatorAsJudgeChange: (value: boolean) => void
}

export function JudgeSelector({
  selectedJudgeIds,
  onJudgesChange,
  creatorAsJudge,
  onCreatorAsJudgeChange,
}: JudgeSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 現在のユーザー情報を取得
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await userApi.me()
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  })

  // ユーザー一覧を取得
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.getUsers()
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2分間キャッシュ
  })

  // 主催者（現在のユーザー）を除外し、検索フィルタを適用
  const filteredUsers = useMemo(() => {
    const allUsers = usersData?.results || []
    let users = allUsers.filter((user: User) => user.id !== currentUser?.id)

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      users = users.filter(
        (user: User) =>
          user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      )
    }

    return users
  }, [usersData?.results, currentUser, searchQuery])

  const handleAddJudge = (userId: string) => {
    if (!selectedJudgeIds.includes(userId)) {
      onJudgesChange([...selectedJudgeIds, userId])
    }
  }

  const handleRemoveJudge = (userId: string) => {
    onJudgesChange(selectedJudgeIds.filter(id => id !== userId))
  }

  return (
    <div className="space-y-4">
      {/* 主催者自身を審査員にするオプション */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={creatorAsJudge}
            onChange={e => onCreatorAsJudgeChange(e.target.checked)}
            className="mt-1 mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-bold text-purple-900 dark:text-purple-300 block">
              主催者自身も審査する
            </span>
            <span className="text-sm text-purple-700 dark:text-purple-400">
              コンテスト作成後、あなたが審査員として自動的に追加されます
            </span>
          </div>
        </label>
      </div>

      {/* 審査員選択セクション */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <CustomIcon name="judge" size={24} />
            <span className="font-bold text-gray-900 dark:text-gray-100">審査員を選択</span>
            {selectedJudgeIds.length > 0 && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                {selectedJudgeIds.length}人選択中
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="bg-white dark:bg-gray-900">
            {/* 検索ボックス */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="ユーザー名またはメールアドレスで検索..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* ユーザーリスト */}
            <div className="max-h-64 overflow-y-auto p-4">
              {isLoading ? (
                <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                  読み込み中...
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-2">
                  {filteredUsers.map((user: User) => {
                    const isSelected = selectedJudgeIds.includes(user.id)
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {user.avatar_url ? (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                              <Image
                                src={user.avatar_url}
                                alt={user.username}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {user.username}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          </div>
                          {user.is_judge && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded">
                              審査員
                            </span>
                          )}
                        </div>
                        {isSelected ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveJudge(user.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
                          >
                            削除
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddJudge(user.id)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors"
                          >
                            追加
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                  {searchQuery ? '検索結果が見つかりません' : 'ユーザーが見つかりません'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 選択された審査員の表示 */}
      {selectedJudgeIds.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
            選択された審査員 ({selectedJudgeIds.length}人)
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedJudgeIds.map(judgeId => {
              const allUsers = usersData?.results || []
              const judge = allUsers.find((u: User) => u.id === judgeId)
              if (!judge) return null
              return (
                <span
                  key={judgeId}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-full text-sm"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {judge.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveJudge(judgeId)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-bold"
                  >
                    ✕
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
