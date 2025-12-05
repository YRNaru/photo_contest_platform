"use client";

import { useQuery } from "@tanstack/react-query";
import { contestApi } from "@/lib/api";
import { EntryCard } from "./EntryCard";
import { useState } from "react";

interface EntryGridProps {
  contestSlug: string;
}

export function EntryGrid({ contestSlug }: EntryGridProps) {
  const [ordering, setOrdering] = useState("-created_at");

  const { data, isLoading, error } = useQuery({
    queryKey: ["contest-entries", contestSlug, ordering],
    queryFn: async () => {
      const response = await contestApi.getContestEntries(contestSlug, { ordering });
      return response.data.results || response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">エントリーの読み込みに失敗しました</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">まだ投稿がありません</p>
      </div>
    );
  }

  return (
    <div>
      {/* ソート */}
      <div className="flex justify-end mb-6">
        <select
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="-created_at">新着順</option>
          <option value="created_at">古い順</option>
          <option value="-vote_count">人気順</option>
        </select>
      </div>

      {/* グリッド */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((entry: any) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

