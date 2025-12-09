"use client";

import { useQuery } from "@tanstack/react-query";
import { contestApi } from "@/lib/api";
import { ContestCalendar } from "@/components/calendar/ContestCalendar";
import { Contest } from "@/lib/types";
import Link from "next/link";

export default function CalendarPage() {
  const { data: contests, isLoading, error } = useQuery({
    queryKey: ["contests"],
    queryFn: async () => {
      const response = await contestApi.getContests();
      return response.data.results || response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-6" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-300 font-semibold">
            コンテスト情報の取得に失敗しました
          </p>
        </div>
      </div>
    );
  }

  const contestList: Contest[] = contests || [];

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* ヘッダー */}
      <div className="mb-6 animate-fadeInUp">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            📅 コンテストカレンダー
          </h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            ← ホームへ
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          すべてのコンテストの開催期間をカレンダーで確認できます。
          イベントをクリックするとコンテスト詳細ページに移動します。
        </p>
      </div>

      {/* コンテスト数の表示 */}
      <div className="mb-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">
              全コンテスト
            </div>
            <div className="text-3xl font-black text-purple-900 dark:text-purple-100">
              {contestList.length}
              <span className="text-sm font-normal ml-1">件</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
              応募受付中
            </div>
            <div className="text-3xl font-black text-green-900 dark:text-green-100">
              {contestList.filter((c) => c.phase === "submission").length}
              <span className="text-sm font-normal ml-1">件</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              開催予定
            </div>
            <div className="text-3xl font-black text-blue-900 dark:text-blue-100">
              {contestList.filter((c) => c.phase === "upcoming").length}
              <span className="text-sm font-normal ml-1">件</span>
            </div>
          </div>
        </div>
      </div>

      {/* カレンダー */}
      <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
        {contestList.length > 0 ? (
          <ContestCalendar contests={contestList} />
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              まだコンテストがありません
            </p>
            <Link
              href="/contests/create"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              ✨ コンテストを作成
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

