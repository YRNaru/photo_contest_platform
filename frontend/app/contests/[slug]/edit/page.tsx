'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contestApi } from '@/lib/api';
import { ContestFormInput } from '@/components/contest/ContestFormInput';
import { DateTimeInput } from '@/components/contest/DateTimeInput';
import { TwitterSettings } from '@/components/contest/TwitterSettings';
import { Contest } from '@/lib/types';
import { useAuth } from '@/lib/auth';

export default function EditContestPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    voting_end_at: '',
    is_public: true,
    max_entries_per_user: '10',
    max_images_per_entry: '100',
    auto_approve_entries: false,
    twitter_hashtag: '',
    twitter_auto_fetch: false,
    twitter_auto_approve: false,
  });
  
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [unlimitedEntries, setUnlimitedEntries] = useState(false);
  const [unlimitedImages, setUnlimitedImages] = useState(false);

  // コンテスト情報を取得（キャッシュを使わず常に最新データを取得）
  const { data: contest, isLoading: contestLoading } = useQuery({
    queryKey: ['contest-edit', slug],
    queryFn: async () => {
      const response = await contestApi.getContest(slug);
      return response.data as Contest;
    },
    staleTime: 0,
    gcTime: 0,
  });

  // コンテスト情報が取得できたらフォームに設定
  useEffect(() => {
    if (contest) {
      // 権限チェック: 作成者またはスタッフのみ編集可能
      if (!contest.is_owner && !user?.is_staff) {
        router.push(`/contests/${slug}`);
        return;
      }

      // ISO形式の日時を datetime-local 形式に変換
      const formatDateTimeLocal = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: contest.title || '',
        description: contest.description || '',
        start_at: formatDateTimeLocal(contest.start_at),
        end_at: formatDateTimeLocal(contest.end_at),
        voting_end_at: contest.voting_end_at ? formatDateTimeLocal(contest.voting_end_at) : '',
        is_public: contest.is_public,
        max_entries_per_user: String(contest.max_entries_per_user || 10),
        max_images_per_entry: String(contest.max_images_per_entry || 100),
        auto_approve_entries: contest.auto_approve_entries || false,
        twitter_hashtag: contest.twitter_hashtag || '',
        twitter_auto_fetch: contest.twitter_auto_fetch || false,
        twitter_auto_approve: contest.twitter_auto_approve || false,
      });
      
      // 無制限フラグを設定（0の場合は無制限）
      setUnlimitedEntries(contest.max_entries_per_user === 0);
      setUnlimitedImages(contest.max_images_per_entry === 0);
    }
  }, [contest, user, slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      
      // 必須フィールド
      data.append('title', formData.title);
      data.append('description', formData.description);
      
      // datetime-localの値をISO形式に変換
      if (formData.start_at) {
        const startDate = new Date(formData.start_at);
        data.append('start_at', startDate.toISOString());
      }
      if (formData.end_at) {
        const endDate = new Date(formData.end_at);
        data.append('end_at', endDate.toISOString());
      }
      
      data.append('is_public', formData.is_public.toString());
      // 無制限の場合は0を送信
      data.append('max_entries_per_user', unlimitedEntries ? '0' : formData.max_entries_per_user);
      data.append('max_images_per_entry', unlimitedImages ? '0' : formData.max_images_per_entry);
      data.append('auto_approve_entries', formData.auto_approve_entries.toString());
      
      // オプションフィールド
      if (formData.voting_end_at) {
        const votingEndDate = new Date(formData.voting_end_at);
        data.append('voting_end_at', votingEndDate.toISOString());
      }
      if (formData.twitter_hashtag) {
        data.append('twitter_hashtag', formData.twitter_hashtag);
      }
      data.append('twitter_auto_fetch', formData.twitter_auto_fetch.toString());
      data.append('twitter_auto_approve', formData.twitter_auto_approve.toString());
      
      // バナー画像（新しい画像がアップロードされた場合のみ）
      if (bannerImage) {
        data.append('banner_image', bannerImage);
      }

      await contestApi.updateContest(slug, data);
      
      // キャッシュをクリア
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['contest', slug] });
      queryClient.invalidateQueries({ queryKey: ['contest-edit', slug] });
      queryClient.removeQueries({ queryKey: ['contest-edit', slug] });
      
      // 更新したコンテストの詳細ページにリダイレクト
      router.push(`/contests/${slug}`);
    } catch (err: any) {
      console.error('コンテスト更新エラー:', err);
      console.error('エラーレスポンス:', err.response?.data);
      
      // エラーメッセージを整形
      let errorMessage = 'コンテストの更新に失敗しました。';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else {
          // フィールドごとのエラーを表示
          const errors = Object.entries(err.response.data).map(([field, messages]: [string, any]) => {
            const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
            return `${fieldName}${Array.isArray(messages) ? messages.join(', ') : messages}`;
          }).join('\n');
          errorMessage = errors || JSON.stringify(err.response.data);
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ローディング中
  if (authLoading || contestLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // コンテストが見つからない場合
  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          コンテストが見つかりません
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">コンテストを編集</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* スラッグは表示のみ（編集不可） */}
        <div>
          <label className="block text-sm font-medium mb-2">
            スラッグ（URL用）
          </label>
          <input
            type="text"
            value={slug}
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            スラッグは編集できません
          </p>
        </div>

        <ContestFormInput
          label="タイトル"
          value={formData.title}
          onChange={(value) => setFormData({ ...formData, title: value })}
          required
          placeholder="夏のフォトコンテスト2024"
        />

        <ContestFormInput
          label="説明"
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          type="textarea"
          placeholder="コンテストの説明を入力してください"
        />

        {/* 現在のバナー画像を表示 */}
        {contest.banner_image && !bannerImage && (
          <div>
            <label className="block text-sm font-medium mb-2">現在のバナー画像</label>
            <img
              src={contest.banner_image}
              alt="現在のバナー"
              className="max-w-full h-auto rounded-lg mb-2"
            />
          </div>
        )}

        <ContestFormInput
          label={contest.banner_image ? "新しいバナー画像（変更する場合のみ）" : "バナー画像"}
          value=""
          onChange={() => {}}
          type="file"
          accept="image/*"
          onFileChange={(e) => setBannerImage(e.target.files?.[0] || null)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateTimeInput
            label="開始日時"
            value={formData.start_at}
            onChange={(value) => setFormData({ ...formData, start_at: value })}
            required
          />

          <DateTimeInput
            label="終了日時"
            value={formData.end_at}
            onChange={(value) => setFormData({ ...formData, end_at: value })}
            required
          />
        </div>

        <DateTimeInput
          label="投票終了日時（任意）"
          value={formData.voting_end_at}
          onChange={(value) => setFormData({ ...formData, voting_end_at: value })}
          helperText="未設定の場合、投票機能は無効になります"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ユーザーあたり最大応募数 */}
          <div>
            <ContestFormInput
              label="ユーザーあたり最大応募数"
              value={formData.max_entries_per_user}
              onChange={(value) => setFormData({ ...formData, max_entries_per_user: value })}
              type="number"
              disabled={unlimitedEntries}
            />
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={unlimitedEntries}
                onChange={(e) => setUnlimitedEntries(e.target.checked)}
                className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">無制限</span>
            </label>
          </div>

          {/* エントリーあたり最大画像数 */}
          <div>
            <ContestFormInput
              label="エントリーあたり最大画像数"
              value={formData.max_images_per_entry}
              onChange={(value) => setFormData({ ...formData, max_images_per_entry: value })}
              type="number"
              disabled={unlimitedImages}
            />
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={unlimitedImages}
                onChange={(e) => setUnlimitedImages(e.target.checked)}
                className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">無制限</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">公開する</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.auto_approve_entries}
              onChange={(e) => setFormData({ ...formData, auto_approve_entries: e.target.checked })}
              className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">投稿を自動承認する</span>
          </label>
          <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
            有効にすると、ユーザーが投稿した作品が自動的に承認されます
          </p>
        </div>

        <TwitterSettings
          hashtag={formData.twitter_hashtag}
          autoFetch={formData.twitter_auto_fetch}
          autoApprove={formData.twitter_auto_approve}
          onHashtagChange={(value) => setFormData({ ...formData, twitter_hashtag: value })}
          onAutoFetchChange={(value) => setFormData({ ...formData, twitter_auto_fetch: value })}
          onAutoApproveChange={(value) => setFormData({ ...formData, twitter_auto_approve: value })}
        />

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '更新中...' : 'コンテストを更新'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push(`/contests/${slug}`)}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
