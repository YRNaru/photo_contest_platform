"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSidebar } from "@/lib/sidebar-context";

interface TrendingContest {
  id: number;
  title: string;
  entry_count: number;
}

export function RightSidebar() {
  const [trending, setTrending] = useState<TrendingContest[]>([]);
  const { isRightOpen } = useSidebar();

  useEffect(() => {
    // ここでは仮のデータを表示しています
    // 実際にはAPIから取得することができます
    setTrending([
      { id: 1, title: "春のフォトコンテスト", entry_count: 125 },
      { id: 2, title: "ポートレート写真大会", entry_count: 98 },
      { id: 3, title: "夜景フォトコン", entry_count: 87 },
    ]);
  }, []);

  return (
    <aside
      className={`bg-gray-50 dark:bg-black border-l-2 border-gray-200 dark:border-gray-800 min-h-[calc(100vh-4rem)] sticky top-16 overflow-hidden transition-all duration-700 ease-in-out shadow-sm z-40 ${
        isRightOpen ? "w-96 opacity-100" : "w-0 opacity-0"
      }`}
    >
      <div
        className={`p-5 space-y-6 w-96 transition-all duration-700 delay-150 ${
          isRightOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        {/* トレンディングコンテスト */}
        <div className="animate-fadeInRight">
          <h2 className="text-sm font-bold bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-300 dark:to-pink-300 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <span className="text-2xl animate-pulse-slow">🔥</span>
            人気のコンテスト
          </h2>
          <div className="space-y-3">
            {trending.map((contest, index) => (
              <Link
                key={contest.id}
                href={`/contests/${contest.id}`}
                style={{ animationDelay: `${index * 100}ms` }}
                className="group block p-4 rounded-xl bg-white dark:bg-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-xl transform-gpu animate-fadeInRight"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent group-hover:scale-125 transition-transform duration-300">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors">
                      {contest.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse-slow"></span>
                      {contest.entry_count} 件の投稿
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-gray-200 dark:border-gray-700" />

        {/* お知らせ */}
        <div className="animate-fadeInRight" style={{ animationDelay: '200ms' }}>
          <h2 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <span className="text-2xl">📢</span>
            お知らせ
          </h2>
          <div className="space-y-3">
            <div className="group p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 border-2 border-blue-200 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu">
              <p className="text-xs text-blue-900 dark:text-blue-100 font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-600 dark:bg-blue-300 rounded-full animate-pulse-slow"></span>
                新機能リリース
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-2">
                投票機能が追加されました
              </p>
            </div>
            <div className="group p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 border-2 border-green-200 dark:border-green-600 hover:border-green-400 dark:hover:border-green-400 hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu">
              <p className="text-xs text-green-900 dark:text-green-100 font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-600 dark:bg-green-300 rounded-full animate-pulse-slow"></span>
                メンテナンス完了
              </p>
              <p className="text-xs text-green-700 dark:text-green-200 mt-2">
                サーバーメンテナンスが完了しました
              </p>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 dark:border-gray-700" />

        {/* サポート情報 */}
        <div className="animate-fadeInRight" style={{ animationDelay: '300ms' }}>
          <h2 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            サポート
          </h2>
          <div className="space-y-2 text-sm">
            <Link
              href="/help"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              ヘルプセンター
            </Link>
            <Link
              href="/guidelines"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              ガイドライン
            </Link>
            <Link
              href="/faq"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              よくある質問
            </Link>
            <Link
              href="/contact"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-300 hover:translate-x-2 font-semibold"
            >
              <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
