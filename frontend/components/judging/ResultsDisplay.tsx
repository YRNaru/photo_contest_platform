'use client';

import { useState, useEffect } from 'react';
import { Category, JudgeScore, Vote } from '@/types/judging';
import { categoryApi, judgeScoreApi, voteApi } from '@/lib/api';
import { TrophyIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

interface ResultsDisplayProps {
  contestSlug: string;
  contestId: number;
  judgingType: 'vote' | 'score';
  entries: any[];
  isOwner: boolean;
}

interface EntryWithScore extends any {
  totalScore?: number;
  voteCount?: number;
  rank?: number;
}

export function ResultsDisplay({
  contestSlug,
  contestId,
  judgingType,
  entries,
  isOwner,
}: ResultsDisplayProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [rankedEntries, setRankedEntries] = useState<EntryWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [contestId, selectedCategory, judgingType]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 部門を読み込み
      const categoriesRes = await categoryApi.getCategories(contestId);
      setCategories(categoriesRes.data);

      // 結果を計算
      if (judgingType === 'vote') {
        await calculateVoteResults();
      } else {
        await calculateScoreResults();
      }

      setError(null);
    } catch (err: any) {
      setError('結果の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateVoteResults = async () => {
    try {
      const votesRes = await voteApi.getVotes();
      const votes: Vote[] = votesRes.data;

      // カテゴリーでフィルター
      const filteredVotes = votes.filter(v => 
        selectedCategory === null || v.category === selectedCategory
      );

      // エントリーごとの投票数を集計
      const voteCountMap: { [entryId: string]: number } = {};
      filteredVotes.forEach(vote => {
        voteCountMap[vote.entry] = (voteCountMap[vote.entry] || 0) + 1;
      });

      // エントリーにスコアを追加してソート
      const entriesWithScores: EntryWithScore[] = entries.map(entry => ({
        ...entry,
        voteCount: voteCountMap[entry.id] || 0,
      }));

      entriesWithScores.sort((a, b) => b.voteCount - a.voteCount);

      // ランクを付ける
      let currentRank = 1;
      let previousVoteCount = -1;
      entriesWithScores.forEach((entry, index) => {
        if (entry.voteCount !== previousVoteCount) {
          currentRank = index + 1;
          previousVoteCount = entry.voteCount;
        }
        entry.rank = currentRank;
      });

      setRankedEntries(entriesWithScores);
    } catch (err) {
      console.error('投票結果の計算エラー:', err);
    }
  };

  const calculateScoreResults = async () => {
    try {
      const scoresRes = await judgeScoreApi.getScores();
      const scores: JudgeScore[] = scoresRes.data;

      // カテゴリーでフィルター
      const filteredScores = scores.filter(s => 
        selectedCategory === null || s.category === selectedCategory
      );

      // エントリーごとの平均スコアを計算
      const scoreMap: { [entryId: string]: { total: number; count: number } } = {};
      filteredScores.forEach(score => {
        if (!scoreMap[score.entry]) {
          scoreMap[score.entry] = { total: 0, count: 0 };
        }
        scoreMap[score.entry].total += Number(score.total_score);
        scoreMap[score.entry].count += 1;
      });

      // エントリーに平均スコアを追加してソート
      const entriesWithScores: EntryWithScore[] = entries.map(entry => {
        const scoreData = scoreMap[entry.id];
        return {
          ...entry,
          totalScore: scoreData ? scoreData.total / scoreData.count : 0,
          judgeCount: scoreData?.count || 0,
        };
      });

      entriesWithScores.sort((a, b) => b.totalScore - a.totalScore);

      // ランクを付ける
      let currentRank = 1;
      let previousScore = -1;
      entriesWithScores.forEach((entry, index) => {
        if (entry.totalScore !== previousScore) {
          currentRank = index + 1;
          previousScore = entry.totalScore;
        }
        entry.rank = currentRank;
      });

      setRankedEntries(entriesWithScores);
    } catch (err) {
      console.error('スコア結果の計算エラー:', err);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 dark:text-yellow-400';
    if (rank === 2) return 'text-gray-400 dark:text-gray-300';
    if (rank === 3) return 'text-amber-700 dark:text-amber-500';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    if (rank === 3) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          結果発表
        </h2>
      </div>

      {/* 部門選択 */}
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            部門で絞り込み
          </label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">全体</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* ランキング表示 */}
      {rankedEntries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>まだ結果がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rankedEntries.map((entry) => {
            const isTopThree = entry.rank <= 3;
            
            return (
              <div
                key={entry.id}
                className={`rounded-lg border-2 overflow-hidden transition-all ${getRankBgColor(entry.rank)} ${
                  isTopThree ? 'shadow-lg' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* ランク表示 */}
                    <div className="flex-shrink-0 text-center">
                      <div className={`text-5xl font-bold ${getRankColor(entry.rank)} mb-2`}>
                        {entry.rank <= 3 && (
                          <TrophyIcon className="w-12 h-12 mx-auto mb-2" />
                        )}
                        {entry.rank}
                        <span className="text-xl">位</span>
                      </div>
                    </div>

                    {/* サムネイル */}
                    {entry.thumbnail && (
                      <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                        <Image
                          src={entry.thumbnail}
                          alt={entry.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* 作品情報 */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/contests/${contestSlug}/entries/${entry.id}`}
                        className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        {entry.title}
                      </Link>
                      {entry.author && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          投稿者: {entry.author.username}
                        </p>
                      )}
                      {entry.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {entry.description}
                        </p>
                      )}

                      {/* スコア/投票数表示 */}
                      <div className="mt-4 flex gap-6">
                        {judgingType === 'vote' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                              {entry.voteCount}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              票
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {entry.totalScore.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                点（平均）
                              </span>
                            </div>
                            {entry.judgeCount && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                審査員数: {entry.judgeCount}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

