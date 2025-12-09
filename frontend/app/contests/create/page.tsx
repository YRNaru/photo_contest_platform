'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { contestApi, userApi } from '@/lib/api';
import { ContestFormInput } from '@/components/contest/ContestFormInput';
import { DateTimeInput } from '@/components/contest/DateTimeInput';
import { TwitterSettings } from '@/components/contest/TwitterSettings';
import { JudgeSelector } from '@/components/contest/JudgeSelector';
import { JudgingTypeSelector } from '@/components/contest/JudgingTypeSelector';
import { JudgingType } from '@/types/judging';

export default function CreateContestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
    max_entries_per_user: '10',
    max_images_per_entry: '100',
    judging_type: 'vote' as JudgingType,
    max_votes_per_judge: 3,
    auto_approve_entries: false,
    twitter_hashtag: '',
    twitter_auto_fetch: false,
    twitter_auto_approve: false,
    require_twitter_account: false,
  });
  
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<string[]>([]);
  const [creatorAsJudge, setCreatorAsJudge] = useState(false);
  const [unlimitedEntries, setUnlimitedEntries] = useState(false);
  const [unlimitedImages, setUnlimitedImages] = useState(false);

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
      // 無制限の場合は0を送信
      data.append('max_entries_per_user', unlimitedEntries ? '0' : formData.max_entries_per_user);
      data.append('max_images_per_entry', unlimitedImages ? '0' : formData.max_images_per_entry);
      data.append('auto_approve_entries', formData.auto_approve_entries.toString());
      data.append('judging_type', formData.judging_type);
      data.append('max_votes_per_judge', formData.max_votes_per_judge.toString());
      
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
      data.append('require_twitter_account', formData.require_twitter_account.toString());
      
      // バナー画像
      if (bannerImage) {
        data.append('banner_image', bannerImage);
      }

      const response = await contestApi.createContest(data);
      const createdContest = response.data;
      
      console.log('作成されたコンテスト:', createdContest);
      
      // 審査員を追加（コンテスト作成後）
      const slug = createdContest.slug;
      if (slug) {
        try {
          // 主催者自身を審査員に追加
          if (creatorAsJudge) {
            const meResponse = await userApi.me();
            const currentUser = meResponse.data;
            await contestApi.addJudge(slug, currentUser.id);
            console.log('主催者を審査員として追加しました');
          }
          
          // 選択された審査員を追加
          for (const judgeId of selectedJudgeIds) {
            await contestApi.addJudge(slug, judgeId);
            console.log(`審査員(ID: ${judgeId})を追加しました`);
          }
        } catch (judgeErr: any) {
          console.error('審査員の追加中にエラーが発生:', judgeErr);
          // 審査員追加に失敗してもコンテストは作成されているので、警告として表示
          const judgeError = judgeErr.response?.data?.detail || '一部の審査員の追加に失敗しました。コンテスト詳細ページから手動で追加できます。';
          setError(judgeError);
        }
        
        // キャッシュをクリア
        queryClient.invalidateQueries({ queryKey: ['contests'] });
        queryClient.invalidateQueries({ queryKey: ['contest', slug] });
        queryClient.removeQueries({ queryKey: ['users'] });
        queryClient.removeQueries({ queryKey: ['current-user'] });
        
        router.push(`/contests/${slug}`);
      } else {
        // slugがない場合はコンテスト一覧へ
        queryClient.invalidateQueries({ queryKey: ['contests'] });
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

        {/* 審査方式選択 */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            審査方式
          </h2>
          <JudgingTypeSelector
            judgingType={formData.judging_type}
            onJudgingTypeChange={(type) => setFormData({ ...formData, judging_type: type })}
            maxVotesPerJudge={formData.max_votes_per_judge}
            onMaxVotesChange={(value) => setFormData({ ...formData, max_votes_per_judge: value })}
          />
        </div>

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
          requireTwitterAccount={formData.require_twitter_account}
          onHashtagChange={(value) => setFormData({ ...formData, twitter_hashtag: value })}
          onAutoFetchChange={(value) => setFormData({ ...formData, twitter_auto_fetch: value })}
          onAutoApproveChange={(value) => setFormData({ ...formData, twitter_auto_approve: value })}
          onRequireTwitterAccountChange={(value) => setFormData({ ...formData, require_twitter_account: value })}
        />

        {/* 審査員設定 */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            審査員設定
          </h2>
          <JudgeSelector
            selectedJudgeIds={selectedJudgeIds}
            onJudgesChange={setSelectedJudgeIds}
            creatorAsJudge={creatorAsJudge}
            onCreatorAsJudgeChange={setCreatorAsJudge}
          />
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
