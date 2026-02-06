'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckIcon } from '@heroicons/react/24/solid'

interface VotingEntryCardProps {
  entry: any
  voted: boolean
  isVoting: boolean
  remainingVotes: number
  isViewed?: boolean
  onVote: () => void
  onUnvote: () => void
}

export function VotingEntryCard({
  entry,
  voted,
  isVoting,
  remainingVotes,
  isViewed = false,
  onVote,
  onUnvote,
}: VotingEntryCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition-all ${
        voted ? 'border-purple-600 shadow-lg' : 'border-gray-200 dark:border-gray-700'
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
            unoptimized
          />
          {voted && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white p-2 rounded-full">
              <CheckIcon className="w-6 h-6" />
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{entry.title}</h3>
          {isViewed && (
            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
              ✓ 閲覧済み
            </span>
          )}
        </div>
        {entry.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {entry.description}
          </p>
        )}

        {/* 詳細リンク */}
        <Link
          href={`/entries/${entry.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-purple-600 dark:text-purple-400 hover:underline mb-4"
        >
          詳細を見る →
        </Link>

        {voted ? (
          <button
            onClick={onUnvote}
            disabled={isVoting}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {isVoting ? '処理中...' : '投票を取り消す'}
          </button>
        ) : (
          <button
            onClick={onVote}
            disabled={remainingVotes <= 0 || isVoting}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVoting ? '投票中...' : '投票する'}
          </button>
        )}
      </div>
    </div>
  )
}
