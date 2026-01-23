'use client'

import { FaGoogle, FaTwitter } from 'react-icons/fa'
import { useState } from 'react'
import { getBackendBaseUrl } from '@/lib/backend-url'

interface LoginButtonProps {
  variant?: 'default' | 'sidebar'
}

export function LoginButton({ variant = 'default' }: LoginButtonProps) {
  const [showOptions, setShowOptions] = useState(false)

  const handleGoogleLogin = () => {
    // Google OAuth2フローを開始
    const backendUrl = getBackendBaseUrl()
    window.location.href = `${backendUrl}/accounts/google/login/`
  }

  const handleTwitterLogin = () => {
    // Twitter OAuth2フローを開始
    const backendUrl = getBackendBaseUrl()
    window.location.href = `${backendUrl}/accounts/twitter_oauth2/login/`
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-3">
        {/* 本番環境ではGoogleログインを非表示 */}
        {process.env.NODE_ENV !== 'production' && (
          <button
            onClick={handleGoogleLogin}
            className="group flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white hover:shadow-2xl hover:scale-105 font-bold transform-gpu transition-all duration-300"
          >
            <FaGoogle className="text-2xl group-hover:scale-125 transition-transform duration-300" />
            <span>Googleでログイン</span>
          </button>
        )}

        <button
          onClick={handleTwitterLogin}
          className="group flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white hover:shadow-2xl hover:scale-105 font-bold transform-gpu transition-all duration-300"
        >
          <FaTwitter className="text-2xl group-hover:scale-125 transition-transform duration-300" />
          <span>Twitterでログイン</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
      >
        ログイン
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* 本番環境ではGoogleログインを非表示 */}
          {process.env.NODE_ENV !== 'production' && (
            <button
              onClick={() => {
                handleGoogleLogin()
                setShowOptions(false)
              }}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-900 dark:text-gray-100"
            >
              <FaGoogle className="text-red-500" />
              <span>Googleでログイン</span>
            </button>
          )}

          <button
            onClick={() => {
              handleTwitterLogin()
              setShowOptions(false)
            }}
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-900 dark:text-gray-100"
          >
            <FaTwitter className="text-blue-400" />
            <span>Twitterでログイン</span>
          </button>
        </div>
      )}
    </div>
  )
}
