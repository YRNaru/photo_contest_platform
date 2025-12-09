'use client';

import { useState, useEffect } from 'react';
import { Category, Vote } from '@/types/judging';
import { categoryApi, voteApi } from '@/lib/api';
import { VotingStatusDisplay } from './VotingStatusDisplay';
import { VotingEntryCard } from './VotingEntryCard';

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
      <VotingStatusDisplay
        remainingVotes={remainingVotes}
        selectedCategoryName={selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : '全体'}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* エントリー一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <VotingEntryCard
            key={entry.id}
            entry={entry}
            voted={hasVoted(entry.id)}
            isVoting={votingEntry === entry.id}
            remainingVotes={remainingVotes}
            onVote={() => handleVote(entry.id)}
            onUnvote={() => handleUnvote(entry.id)}
          />
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>エントリーがありません</p>
        </div>
      )}
    </div>
  );
}

