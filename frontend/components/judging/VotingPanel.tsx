'use client'

import { useState, useEffect } from 'react'
import { Category, Vote } from '@/types/judging'
import { categoryApi, voteApi } from '@/lib/api'
import { VotingStatusDisplay } from './VotingStatusDisplay'
import { VotingEntryCard } from './VotingEntryCard'

interface VotingPanelProps {
  contestSlug: string
  contestId: number
  entries: any[]
  maxVotesPerJudge: number
  isJudge: boolean
  onVoteChange?: () => void
}

export function VotingPanel({
  contestSlug,
  contestId,
  entries,
  maxVotesPerJudge,
  isJudge,
  onVoteChange,
}: VotingPanelProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [myVotes, setMyVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingEntry, setVotingEntry] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [contestId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [votesRes, categoriesRes] = await Promise.all([
        voteApi.getMyVotes(),
        categoryApi.getCategories(contestId),
      ])
      
      // ページネーション対応: results配列がある場合はそれを使用、なければdata自体を使用
      const votesData = Array.isArray(votesRes.data) ? votesRes.data : votesRes.data.results || []
      setMyVotes(votesData)
      
      const categoriesData = Array.isArray(categoriesRes.data) 
        ? categoriesRes.data 
        : categoriesRes.data.results || []
      setCategories(categoriesData)
      
      setError(null)
    } catch (err: any) {
      console.error('投票データの読み込みエラー:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRemainingVotes = () => {
    const categoryVotes = myVotes.filter(
      v => (selectedCategory === null && v.category === null) || v.category === selectedCategory
    )
    const maxVotes = selectedCategory
      ? categories.find(c => c.id === selectedCategory)?.max_votes_per_judge || maxVotesPerJudge
      : maxVotesPerJudge
    return maxVotes - categoryVotes.length
  }

  const hasVoted = (entryId: string) => {
    return myVotes.some(
      v =>
        v.entry === entryId &&
        ((selectedCategory === null && v.category === null) || v.category === selectedCategory)
    )
  }

  const handleVote = async (entryId: string) => {
    if (!isJudge) {
      setError('投票権限がありません')
      return
    }

    if (getRemainingVotes() <= 0) {
      setError('投票上限に達しています')
      return
    }

    try {
      setVotingEntry(entryId)
      setError(null)

      await voteApi.createVote({
        entry: entryId,
        category: selectedCategory,
      })

      await loadData()
      onVoteChange?.()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '投票に失敗しました'
      setError(errorMsg)
      console.error(err)
    } finally {
      setVotingEntry(null)
    }
  }

  const handleUnvote = async (entryId: string) => {
    const vote = myVotes.find(
      v =>
        v.entry === entryId &&
        ((selectedCategory === null && v.category === null) || v.category === selectedCategory)
    )

    if (!vote) return

    try {
      setVotingEntry(entryId)
      setError(null)

      await voteApi.deleteVote(vote.id)

      await loadData()
      onVoteChange?.()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '投票取り消しに失敗しました'
      setError(errorMsg)
      console.error(err)
    } finally {
      setVotingEntry(null)
    }
  }

  if (!isJudge) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">審査員のみ投票できます</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>
  }

  const remainingVotes = getRemainingVotes()

  return (
    <div className="space-y-6">
      {/* 賞選択 */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            投票する賞を選択
          </label>
          <select
            value={selectedCategory || ''}
            onChange={e => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">全体</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            賞を選択すると、その賞への投票として記録されます
          </p>
        </div>
      )}

      {/* 投票状況 */}
      <VotingStatusDisplay
        remainingVotes={remainingVotes}
        selectedCategoryName={
          selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : '全体'
        }
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* エントリー一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map(entry => (
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
  )
}
