'use client'

import { useState } from 'react'
import { User } from '@/lib/types'
import { userApi } from '@/lib/api'

interface BasicInfoSectionProps {
  user: User
  onUserUpdate?: (updatedUser: User) => void
}

export function BasicInfoSection({ user, onUserUpdate }: BasicInfoSectionProps) {
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [username, setUsername] = useState(user.username)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUsernameSave = async () => {
    if (!username.trim()) {
      setError('ユーザー名は必須です')
      return
    }

    if (username === user.username) {
      setIsEditingUsername(false)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('username', username.trim())

      const response = await userApi.updateProfile(formData)
      if (onUserUpdate) {
        onUserUpdate(response.data)
      }
      setIsEditingUsername(false)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'ユーザー名の更新に失敗しました'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUsernameCancel = () => {
    setUsername(user.username)
    setIsEditingUsername(false)
    setError(null)
  }

  return (
    <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
      <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
        ℹ️ 基本情報
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
          <span className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-bold mb-2 block">
            👤 ユーザー名
          </span>
          {isEditingUsername ? (
            <div className="space-y-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUsernameSave()
                  } else if (e.key === 'Escape') {
                    handleUsernameCancel()
                  }
                }}
              />
              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleUsernameSave}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleUsernameCancel}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <span className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold">
                {user.username}
              </span>
              <button
                onClick={() => setIsEditingUsername(true)}
                className="ml-2 px-2 py-1 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                title="ユーザー名を編集"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-bold mb-2 block">
            📧 メールアドレス
          </span>
          <span className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold truncate block">
            {user.email}
          </span>
        </div>
        {(user.first_name || user.last_name) && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-800">
            <span className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-bold mb-2 block">
              🏷️ 名前
            </span>
            <span className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold">
              {user.first_name} {user.last_name}
            </span>
          </div>
        )}
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <span className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 font-bold mb-2 block">
            ⭐ 権限
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {user.is_superuser && (
              <span className="px-3 sm:px-4 py-1 bg-yellow-400 text-gray-900 rounded-full text-xs sm:text-sm font-semibold">
                🔑 スーパーユーザー
              </span>
            )}
            {!user.is_superuser && user.is_staff && (
              <span className="px-3 sm:px-4 py-1 bg-green-500 text-white rounded-full text-xs sm:text-sm font-semibold">
                ⚙️ スタッフ
              </span>
            )}
            {!user.is_superuser && !user.is_staff && (
              <span className="px-3 sm:px-4 py-1 bg-blue-500 text-white rounded-full text-xs sm:text-sm font-semibold">
                👤 一般ユーザー
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
