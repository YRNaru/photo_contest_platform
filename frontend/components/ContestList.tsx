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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">コンテストの読み込みに失敗しました</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">現在開催中のコンテストはありません</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((contest: any) => (
        <ContestCard key={contest.slug} contest={contest} />
      ))}
    </div>
  );
}

