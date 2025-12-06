'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entryApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { FaHeart, FaRegHeart, FaEye, FaCalendar, FaUser } from 'react-icons/fa';
import { useState } from 'react';

export default function EntryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // エントリー詳細取得
  const { data: entry, isLoading, error } = useQuery({
    queryKey: ['entry', id],
    queryFn: async () => {
      const response = await entryApi.getEntry(id);
      return response.data;
    },
  });

  // 投票mutation
  const voteMutation = useMutation({
    mutationFn: async () => {
      if (entry?.user_voted) {
        await entryApi.unvote(id);
      } else {
        await entryApi.vote(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entry', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">エントリーが見つかりません</h1>
          <p className="text-muted-foreground mb-6">
            このエントリーは存在しないか、削除された可能性があります。
          </p>
          <Link href="/contests" className="text-blue-600 hover:underline">
            コンテスト一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = entry.images?.[selectedImageIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* 左側: 画像 */}
        <div>
          {/* メイン画像 */}
          {currentImage && (
            <div className="mb-4">
              <img
                src={currentImage.image}
                alt={entry.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* サムネイル一覧 */}
          {entry.images && entry.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {entry.images.map((image: any, index: number) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded overflow-hidden ${
                    selectedImageIndex === index
                      ? 'ring-2 ring-blue-500'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image.thumbnail || image.image}
                    alt={`${entry.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右側: 詳細情報 */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{entry.title}</h1>

          {/* メタ情報 */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FaUser />
              <span>{entry.author?.username || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendar />
              <span>{formatDate(entry.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEye />
              <span>{entry.view_count} 閲覧</span>
            </div>
          </div>

          {/* 投票ボタン */}
          {isAuthenticated && (
            <button
              onClick={() => voteMutation.mutate()}
              disabled={voteMutation.isPending}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold mb-6 transition ${
                entry.user_voted
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {entry.user_voted ? <FaHeart /> : <FaRegHeart />}
              <span>{entry.vote_count} いいね</span>
            </button>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-lg mb-6">
              <FaHeart className="text-gray-400" />
              <span className="text-gray-600">{entry.vote_count} いいね</span>
            </div>
          )}

          {/* 説明 */}
          {entry.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">説明</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {entry.description}
              </p>
            </div>
          )}

          {/* タグ */}
          {entry.tags && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">タグ</h2>
              <div className="flex flex-wrap gap-2">
                {entry.tags.split(',').map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 承認ステータス */}
          {!entry.approved && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                このエントリーは承認待ちです。
              </p>
            </div>
          )}

          {/* コンテストリンク */}
          <div className="mt-6 pt-6 border-t">
            <Link
              href={`/contests/${entry.contest}`}
              className="text-blue-600 hover:underline"
            >
              コンテストページに戻る →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
