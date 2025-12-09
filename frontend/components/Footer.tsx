'use client'

import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 mt-auto overflow-hidden border-t dark:border-gray-800">
      {/* 背景装飾 */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 dark:bg-purple-600 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 dark:bg-pink-600 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 animate-fadeInUp">
          {/* サイト情報 */}
          <div className="animate-fadeInLeft">
            <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 dark:from-purple-300 dark:via-pink-300 dark:to-purple-300 animate-gradient bg-clip-text text-transparent mb-4 animate-float">
              VRChat Photo Contest
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
              VRChatのフォトコンテストプラットフォーム。 あなたの最高の瞬間を共有しましょう。✨
            </p>
          </div>

          {/* クイックリンク */}
          <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <h4 className="font-bold text-white dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="text-purple-400 dark:text-purple-300">⚡</span>
              クイックリンク
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/contests"
                  className="group flex items-center gap-2 hover:text-purple-400 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  コンテスト一覧
                </Link>
              </li>
              <li>
                <Link
                  href="/calendar"
                  className="group flex items-center gap-2 hover:text-purple-400 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  カレンダー
                </Link>
              </li>
              <li>
                <Link
                  href="/contests/create"
                  className="group flex items-center gap-2 hover:text-purple-400 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  コンテスト作成
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="group flex items-center gap-2 hover:text-purple-400 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  写真を投稿
                </Link>
              </li>
              <li>
                <Link
                  href="/my-entries"
                  className="group flex items-center gap-2 hover:text-purple-400 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  マイ投稿
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="group flex items-center gap-2 hover:text-purple-400 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  マイページ
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <h4 className="font-bold text-white dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="text-pink-400 dark:text-pink-300">💬</span>
              サポート
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/features"
                  className="group flex items-center gap-2 hover:text-pink-400 dark:hover:text-pink-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-pink-400 dark:bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  機能一覧
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="group flex items-center gap-2 hover:text-pink-400 dark:hover:text-pink-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-pink-400 dark:bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="group flex items-center gap-2 hover:text-pink-400 dark:hover:text-pink-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-pink-400 dark:bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  ガイドライン
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="group flex items-center gap-2 hover:text-pink-400 dark:hover:text-pink-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-pink-400 dark:bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  よくある質問
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="group flex items-center gap-2 hover:text-pink-400 dark:hover:text-pink-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-pink-400 dark:bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div className="animate-fadeInRight">
            <h4 className="font-bold text-white dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="text-blue-400 dark:text-blue-300">📜</span>
              法的情報
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="group flex items-center gap-2 hover:text-blue-400 dark:hover:text-blue-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 dark:bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="group flex items-center gap-2 hover:text-blue-400 dark:hover:text-blue-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 dark:bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="group flex items-center gap-2 hover:text-blue-400 dark:hover:text-blue-300 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 dark:bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Cookieポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-gray-700 dark:border-gray-800 opacity-30" />

        {/* コピーライト */}
        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 animate-fadeInUp text-center md:text-left"
          style={{ animationDelay: '300ms' }}
        >
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-600 font-medium">
            © {currentYear} VRChat Photo Contest Platform. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-125 transform-gpu"
            >
              <svg
                className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-gray-400 hover:text-pink-400 transition-all duration-300 hover:scale-125 transform-gpu"
            >
              <svg
                className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-125 transform-gpu"
            >
              <svg
                className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
