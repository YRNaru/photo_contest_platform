'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { contestApi } from '@/lib/api';
import { ContestFormInput } from '@/components/contest/ContestFormInput';
import { DateTimeInput } from '@/components/contest/DateTimeInput';
import { TwitterSettings } from '@/components/contest/TwitterSettings';

export default function CreateContestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // デバッグ用: ユーザー情報を確認
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    console.log('アクセストークン:', token ? '存在する' : '存在しない');
  }
  
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    voting_end_at: '',
    is_public: true,
    max_entries_per_user: '1',
    max_images_per_entry: '5',
    twitter_hashtag: '',
    twitter_auto_fetch: false,
    twitter_auto_approve: false,
  });
  
  const [bannerImage, setBannerImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      
      // 必須フィールド
      data.append('slug', formData.slug);
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
      data.append('max_entries_per_user', formData.max_entries_per_user);
      data.append('max_images_per_entry', formData.max_images_per_entry);
      
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
      
      // バナー画像
      if (bannerImage) {
        data.append('banner_image', bannerImage);
      }

      const response = await contestApi.createContest(data);
      const createdContest = response.data;
      
      console.log('作成されたコンテスト:', createdContest);
      
      // 作成したコンテストの詳細ページにリダイレクト
      if (createdContest.slug) {
        router.push(`/contests/${createdContest.slug}`);
      } else {
        // slugがない場合はコンテスト一覧へ
        router.push('/contests');
      }
    } catch (err: any) {
      console.error('コンテスト作成エラー:', err);
      console.error('エラーレスポンス:', err.response?.data);
      
      // エラーメッセージを整形
      let errorMessage = 'コンテストの作成に失敗しました。';
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">新しいコンテストを作成</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <ContestFormInput
          label="スラッグ（URL用）"
          value={formData.slug}
          onChange={(value) => setFormData({ ...formData, slug: value })}
          required
          placeholder="summer-photo-2024"
          helperText="英数字とハイフンのみ使用可能"
        />

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

        <ContestFormInput
          label="バナー画像"
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
          <ContestFormInput
            label="ユーザーあたり最大応募数"
            value={formData.max_entries_per_user}
            onChange={(value) => setFormData({ ...formData, max_entries_per_user: value })}
            type="number"
            min="1"
          />

          <ContestFormInput
            label="エントリーあたり最大画像数"
            value={formData.max_images_per_entry}
            onChange={(value) => setFormData({ ...formData, max_images_per_entry: value })}
            type="number"
            min="1"
            max="10"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium">公開する</span>
          </label>
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
            {loading ? '作成中...' : 'コンテストを作成'}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
