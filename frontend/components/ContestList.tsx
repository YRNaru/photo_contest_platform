"use client";

import { useQuery } from "@tanstack/react-query";
import { contestApi } from "@/lib/api";
import { ContestCard } from "./ContestCard";

export function ContestList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["contests"],
    queryFn: async () => {
      const response = await contestApi.getContests();
      return response.data.results || response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 sm:h-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <p className="text-xl font-semibold text-red-500 dark:text-red-400">⚠️ コンテストの読み込みに失敗しました</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700">
        <span className="text-7xl mb-4 block opacity-50">🏆</span>
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">現在開催中のコンテストはありません</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">新しいコンテストをお楽しみに！</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {data.map((contest: any, index: number) => (
        <ContestCard 
          key={contest.slug} 
          contest={contest} 
          priority={index < 3}
        />
      ))}
    </div>
  );
}

