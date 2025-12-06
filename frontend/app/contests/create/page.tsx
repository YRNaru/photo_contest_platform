'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { contestApi } from '@/lib/api';

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
        <div>
          <label className="block text-sm font-medium mb-2">
            スラッグ（URL用）<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="summer-photo-2024"
          />
          <p className="text-sm text-gray-500 mt-1">
            英数字とハイフンのみ使用可能
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            タイトル<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="夏のフォトコンテスト2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">説明</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="コンテストの説明を入力してください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">バナー画像</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBannerImage(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              開始日時<span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.start_at}
              onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              終了日時<span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.end_at}
              onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">投票終了日時（任意）</label>
          <input
            type="datetime-local"
            value={formData.voting_end_at}
            onChange={(e) => setFormData({ ...formData, voting_end_at: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            未設定の場合、投票機能は無効になります
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              ユーザーあたり最大応募数
            </label>
            <input
              type="number"
              min="1"
              value={formData.max_entries_per_user}
              onChange={(e) => setFormData({ ...formData, max_entries_per_user: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              エントリーあたり最大画像数
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.max_images_per_entry}
              onChange={(e) => setFormData({ ...formData, max_images_per_entry: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Twitter連携設定</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Twitterハッシュタグ
            </label>
            <input
              type="text"
              value={formData.twitter_hashtag}
              onChange={(e) => setFormData({ ...formData, twitter_hashtag: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: フォトコンテスト（#は不要）"
            />
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.twitter_auto_fetch}
                onChange={(e) => setFormData({ ...formData, twitter_auto_fetch: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium">Twitter自動取得を有効にする</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.twitter_auto_approve}
                onChange={(e) => setFormData({ ...formData, twitter_auto_approve: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium">Twitter投稿を自動承認する</span>
            </label>
          </div>
        </div>

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
