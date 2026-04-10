'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { entryApi } from '@/lib/api'
import { Entry } from '@/lib/types'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { CustomIcon } from '@/components/ui/custom-icon'

export default function PendingEntriesPage() {
  const { user, isLoading: loading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  // 未認証またはモデレーター権限がない場合はリダイレクト
  useEffect(() => {
    if (!loading && (!user || (!user.is_moderator && !user.is_staff))) {
      router.push('/')
    }
  }, [user, loading, router])

  const { data: entries, isLoading } = useQuery({
    queryKey: ['pending-entries'],
    queryFn: async () => {
      const response = await entryApi.getPending()
      return response.data.results as Entry[]
    },
    enabled: !!user && (user.is_moderator || user.is_staff),
    staleTime: 30 * 1000, // 30秒
    refetchInterval: 60 * 1000, // 1分ごとに自動更新
  })

  // 承認
  const approveMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return await entryApi.approve(entryId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-entries'] })
      setSuccessMessage('エントリーを承認しました')
      setErrorMessage(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      const message = error.response?.data?.detail || '承認に失敗しました'
      setErrorMessage(message)
      setSuccessMessage(null)
      setTimeout(() => setErrorMessage(null), 5000)
    },
  })

  // 非承認
  const rejectMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return await entryApi.reject(entryId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-entries'] })
      setSuccessMessage('エントリーを非承認にしました')
      setErrorMessage(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      const message = error.response?.data?.detail || '非承認に失敗しました'
      setErrorMessage(message)
      setSuccessMessage(null)
      setTimeout(() => setErrorMessage(null), 5000)
    },
  })

  /** TanStack Table のカラム定義 */
  const columns = useMemo<ColumnDef<Entry, unknown>[]>(
    () => [
      {
        id: 'thumbnail',
        header: '',
        cell: ({ row }) => {
          const entry = row.original
          return entry.thumbnail ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              <Image
                src={entry.thumbnail}
                alt={entry.title}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-lg">
              📷
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: 'title',
        header: 'タイトル',
        cell: ({ row }) => (
          <div>
            <Link
              href={`/entries/${row.original.id}`}
              className="font-medium text-foreground hover:text-purple-600 hover:underline dark:hover:text-purple-400"
            >
              {row.original.title}
            </Link>
            {row.original.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {row.original.description}
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'author',
        header: '投稿者',
        accessorFn: (row: Entry) =>
          row.author?.username ?? (row.twitter_username ? `@${row.twitter_username}` : '不明'),
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">👤 {getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'contest_title',
        header: 'コンテスト',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <CustomIcon name="contest" size={16} />
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: 'tags',
        header: 'タグ',
        cell: ({ row }) =>
          row.original.tags ? (
            <div className="flex flex-wrap gap-1">
              {row.original.tags
                .split(',')
                .slice(0, 3)
                .map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                  >
                    #{tag.trim()}
                  </span>
                ))}
            </div>
          ) : null,
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => {
          const entry = row.original
          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => approveMutation.mutate(entry.id)}
                disabled={approveMutation.isPending}
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
              >
                {approveMutation.isPending ? '...' : '✓ 承認'}
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => rejectMutation.mutate(entry.id)}
                disabled={rejectMutation.isPending}
                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                {rejectMutation.isPending ? '...' : '✕ 拒否'}
              </Button>
            </div>
          )
        },
        enableSorting: false,
      },
    ],
    [approveMutation, rejectMutation]
  )

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user || (!user.is_moderator && !user.is_staff)) {
    return null
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8 animate-fadeInUp">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          📋 承認待ちエントリー
        </h1>
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
          ユーザーから投稿されたエントリーの承認・非承認を行います
        </p>
      </div>

      {/* メッセージ */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg animate-fadeInUp">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg animate-fadeInUp">
          {errorMessage}
        </div>
      )}

      {/* テーブル */}
      <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        {entries && entries.length > 0 ? (
          <div className="space-y-4">
            {/* 検索 */}
            <div className="flex items-center gap-3">
              <input
                type="search"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="🔍 タイトルで検索..."
                className="max-w-xs rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <span className="text-sm text-muted-foreground">
                {entries.length} 件の承認待ち
              </span>
            </div>

            <DataTable
              columns={columns}
              data={entries}
              searchValue={searchKeyword}
              searchColumnId="title"
              pageSize={15}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-800">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              承認待ちのエントリーはありません
            </h3>
            <p className="text-gray-600 dark:text-gray-400">すべてのエントリーが承認済みです</p>
          </div>
        )}
      </div>
    </div>
  )
}
