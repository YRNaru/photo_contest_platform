'use client';

import { useState, useEffect } from 'react';
import { Category, Vote } from '@/types/judging';
import { categoryApi, voteApi } from '@/lib/api';
import { CheckIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface VotingPanelProps {
  contestSlug: string;
  entries: any[];
  maxVotesPerJudge: number;
  isJudge: boolean;
  onVoteChange?: () => void;
}

export function VotingPanel({
  contestSlug,
  entries,
  maxVotesPerJudge,
  isJudge,
  onVoteChange,
}: VotingPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [myVotes, setMyVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingEntry, setVotingEntry] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [votesRes] = await Promise.all([
        voteApi.getMyVotes(),
      ]);
      setMyVotes(votesRes.data);
      setError(null);
    } catch (err: any) {
      console.error('投票データの読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingVotes = () => {
    const categoryVotes = myVotes.filter(v => 
      (selectedCategory === null && v.category === null) ||
      (v.category === selectedCategory)
    );
    const maxVotes = selectedCategory
      ? categories.find(c => c.id === selectedCategory)?.max_votes_per_judge || maxVotesPerJudge
      : maxVotesPerJudge;
    return maxVotes - categoryVotes.length;
  };

  const hasVoted = (entryId: string) => {
    return myVotes.some(v => 
      v.entry === entryId && 
      ((selectedCategory === null && v.category === null) || v.category === selectedCategory)
    );
  };

  const handleVote = async (entryId: string) => {
    if (!isJudge) {
      setError('投票権限がありません');
      return;
    }

    if (getRemainingVotes() <= 0) {
      setError('投票上限に達しています');
      return;
    }

    try {
      setVotingEntry(entryId);
      setError(null);
      
      await voteApi.createVote({
        entry: entryId,
        category: selectedCategory,
      });

      await loadData();
      onVoteChange?.();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '投票に失敗しました';
      setError(errorMsg);
      console.error(err);
    } finally {
      setVotingEntry(null);
    }
  };

  const handleUnvote = async (entryId: string) => {
    const vote = myVotes.find(v => 
      v.entry === entryId && 
      ((selectedCategory === null && v.category === null) || v.category === selectedCategory)
    );

    if (!vote) return;

    try {
      setVotingEntry(entryId);
      setError(null);
      
      await voteApi.deleteVote(vote.id);

      await loadData();
      onVoteChange?.();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '投票取り消しに失敗しました';
      setError(errorMsg);
      console.error(err);
    } finally {
      setVotingEntry(null);
    }
  };

  if (!isJudge) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          審査員のみ投票できます
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  const remainingVotes = getRemainingVotes();

  return (
    <div className="space-y-6">
      {/* 投票状況 */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              投票状況
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : '全体'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {remainingVotes}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              残り投票数
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* エントリー一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => {
          const voted = hasVoted(entry.id);
          const isVoting = votingEntry === entry.id;
          
          return (
            <div
              key={entry.id}
              className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition-all ${
                voted
                  ? 'border-purple-600 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* サムネイル */}
              {entry.thumbnail && (
                <div className="relative h-48 bg-gray-100 dark:bg-gray-900">
                  <Image
                    src={entry.thumbnail}
                    alt={entry.title}
                    fill
                    className="object-cover"
                  />
                  {voted && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white p-2 rounded-full">
                      <CheckIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {entry.title}
                </h3>
                {entry.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {entry.description}
                  </p>
                )}

                {voted ? (
                  <button
                    onClick={() => handleUnvote(entry.id)}
                    disabled={isVoting}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {isVoting ? '処理中...' : '投票を取り消す'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleVote(entry.id)}
                    disabled={remainingVotes <= 0 || isVoting}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVoting ? '投票中...' : '投票する'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>エントリーがありません</p>
        </div>
      )}
    </div>
  );
}

