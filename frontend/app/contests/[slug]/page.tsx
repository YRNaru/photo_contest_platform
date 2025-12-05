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
          <div className="h-64 bg-gray-200 rounded-lg mb-8" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">コンテストが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded text-sm text-white ${getPhaseColor(contest.phase)}`}>
            {getPhaseLabel(contest.phase)}
          </span>
          {contest.phase === "submission" && (
            <Link
              href={`/submit?contest=${slug}`}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              作品を投稿
            </Link>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4">{contest.title}</h1>
        <p className="text-lg text-muted-foreground mb-6">{contest.description}</p>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold">応募期間: </span>
            {formatDate(contest.start_at)} 〜 {formatDate(contest.end_at)}
          </div>
          {contest.voting_end_at && (
            <div>
              <span className="font-semibold">投票終了: </span>
              {formatDate(contest.voting_end_at)}
            </div>
          )}
          <div>
            <span className="font-semibold">応募数: </span>
            {contest.entry_count} 件
          </div>
        </div>
      </div>

      {/* エントリー一覧 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">投稿作品</h2>
        <EntryGrid contestSlug={slug} />
      </div>
    </div>
  );
}

