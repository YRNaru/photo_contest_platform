'use client';

import { useQuery } from '@tanstack/react-query';
import { contestApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ContestCard } from '@/components/ContestCard';
import Link from 'next/link';

export default function MyContestsPage() {
  const { user, isAuthenticated } = useAuth();

  const { data: contests, isLoading, error } = useQuery({
    queryKey: ['my-contests'],
    queryFn: async () => {
      const response = await contestApi.getMyContests();
      return response.data.results || response.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">ログインが必要です</h1>
          <p className="text-muted-foreground">
            自分のコンテストを表示するにはログインしてください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">マイコンテスト</h1>
        <Link
          href="/contests/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + 新しいコンテストを作成
        </Link>
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">コンテストの読み込みに失敗しました</p>
        </div>
      )}

      {!isLoading && !error && (!contests || contests.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-6">
            まだコンテストを作成していません
          </p>
          <Link
            href="/contests/create"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            最初のコンテストを作成
          </Link>
        </div>
      )}

      {!isLoading && !error && contests && contests.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest: any) => (
            <div key={contest.slug} className="relative">
              <ContestCard contest={contest} />
              {/* 編集ボタン */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Link
                  href={`/contests/${contest.slug}/edit`}
                  className="px-3 py-1 bg-white rounded shadow hover:bg-gray-100 text-sm"
                >
                  編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
