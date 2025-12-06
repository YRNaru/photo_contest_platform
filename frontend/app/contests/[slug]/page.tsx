"use client";

import { useQuery } from "@tanstack/react-query";
import { contestApi } from "@/lib/api";
import { useParams } from "next/navigation";
import { formatDate, getPhaseLabel, getPhaseColor } from "@/lib/utils";
import { EntryGrid } from "@/components/EntryGrid";
import Link from "next/link";

export default function ContestDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: contest, isLoading } = useQuery({
    queryKey: ["contest", slug],
    queryFn: async () => {
      const response = await contestApi.getContest(slug);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500 dark:text-red-400">コンテストが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-purple-500/10 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-800 animate-fadeInUp">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-white shadow-md ${getPhaseColor(contest.phase)}`}>
            {getPhaseLabel(contest.phase)}
          </span>
          {contest.phase === "submission" && (
            <Link
              href={`/submit?contest=${slug}`}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu text-center"
            >
              ✨ 作品を投稿
            </Link>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight">
          {contest.title}
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">{contest.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-sm">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
            <span className="font-bold text-purple-900 dark:text-purple-300 block mb-1">📅 応募期間</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatDate(contest.start_at)} 〜 {formatDate(contest.end_at)}
            </span>
          </div>
          {contest.voting_end_at && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">🗳️ 投票終了</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(contest.voting_end_at)}</span>
            </div>
          )}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-800">
            <span className="font-bold text-green-900 dark:text-green-300 block mb-1">📸 応募数</span>
            <span className="text-2xl font-black text-gray-700 dark:text-gray-100">{contest.entry_count} <span className="text-sm font-normal">件</span></span>
          </div>
        </div>
      </div>

      {/* エントリー一覧 */}
      <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <h2 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          🎨 投稿作品
        </h2>
        <EntryGrid contestSlug={slug} />
      </div>
    </div>
  );
}

