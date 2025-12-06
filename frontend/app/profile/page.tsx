'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { User, SocialAccount } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // URLパラメータからトークンを取得（ログイン直後の場合）
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // トークンをlocalStorageに保存
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          
          // URLからパラメータを削除（クリーンなURLに）
          window.history.replaceState({}, '', '/profile');
        }
        
        // トークンがあるか確認
        const storedToken = localStorage.getItem('access_token');
        if (!storedToken) {
          console.error('トークンがありません。ログインページにリダイレクトします。');
          router.push('/');
          return;
        }
        
        // ユーザー情報を取得
        const response = await userApi.me();
        setUser(response.data);
      } catch (err: any) {
        console.error('プロフィール取得エラー:', err);
        
        // ネットワークエラーの場合
        if (err.message === 'Network Error') {
          setError('バックエンドに接続できません。サーバーが起動しているか確認してください。');
        } else if (err.response?.status === 401) {
          // 未認証の場合はトークンを削除してホームにリダイレクト
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          router.push('/');
        } else {
          setError('プロフィール情報の取得に失敗しました');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      // トークンを削除
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // バックエンドのログアウトエンドポイントを呼ぶ
      window.location.href = 'http://localhost:18000/accounts/logout/';
    } catch (err) {
      console.error('ログアウトエラー:', err);
    }
  };

  const getTwitterAccount = (): SocialAccount | undefined => {
    return user?.social_accounts?.find(acc => acc.provider === 'twitter_oauth2');
  };

  const getGoogleAccount = (): SocialAccount | undefined => {
    return user?.social_accounts?.find(acc => acc.provider === 'google');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-red-600 text-center">{error || 'ユーザー情報が見つかりません'}</div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const twitterAccount = getTwitterAccount();
  const googleAccount = getGoogleAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-t-3xl p-10 text-center shadow-xl">
          <h1 className="text-4xl font-bold mb-2">👤 プロフィール</h1>
          <p className="text-purple-100 text-lg">VRChat Photo Contest Platform</p>
        </div>

        {/* コンテンツ */}
        <div className="bg-white rounded-b-3xl shadow-2xl p-8">
          {/* 基本情報 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-6 pb-3 border-b-2 border-gray-200">
              基本情報
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 font-semibold mb-1">ユーザー名</span>
                <span className="text-gray-900 text-lg">{user.username}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 font-semibold mb-1">メールアドレス</span>
                <span className="text-gray-900 text-lg">{user.email}</span>
              </div>
              {(user.first_name || user.last_name) && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 font-semibold mb-1">名前</span>
                  <span className="text-gray-900 text-lg">{user.first_name} {user.last_name}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 font-semibold mb-1">権限</span>
                <div className="flex gap-2 mt-1">
                  {user.is_superuser && (
                    <span className="px-4 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-semibold">
                      🔑 スーパーユーザー
                    </span>
                  )}
                  {!user.is_superuser && user.is_staff && (
                    <span className="px-4 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
                      ⚙️ スタッフ
                    </span>
                  )}
                  {!user.is_superuser && !user.is_staff && (
                    <span className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
                      👤 一般ユーザー
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          {(user.entry_count !== undefined || user.vote_count !== undefined) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-6 pb-3 border-b-2 border-gray-200">
                統計情報
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {user.entry_count !== undefined && (
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-700">{user.entry_count}</div>
                    <div className="text-gray-600 mt-1">エントリー数</div>
                  </div>
                )}
                {user.vote_count !== undefined && (
                  <div className="bg-indigo-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-indigo-700">{user.vote_count}</div>
                    <div className="text-gray-600 mt-1">投票数</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ソーシャルアカウント連携 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-6 pb-3 border-b-2 border-gray-200">
              ソーシャルアカウント連携
            </h2>

            {twitterAccount && (
              <div className="bg-gray-50 border-2 border-blue-400 rounded-2xl p-6 mb-4">
                <div className="flex items-center mb-4">
                  {twitterAccount.profile_image_url ? (
                    <img
                      src={twitterAccount.profile_image_url}
                      alt="Twitter"
                      className="w-12 h-12 rounded-full mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-4">
                      𝕏
                    </div>
                  )}
                  <div className="text-xl font-semibold text-blue-500">Twitter (X)</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 font-semibold">ユーザー名: </span>
                    <span className="text-gray-900">@{twitterAccount.username}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">User ID: </span>
                    <span className="text-gray-900">{twitterAccount.uid}</span>
                  </div>
                </div>
              </div>
            )}

            {googleAccount && (
              <div className="bg-gray-50 border-2 border-red-400 rounded-2xl p-6 mb-4">
                <div className="flex items-center mb-4">
                  {googleAccount.picture ? (
                    <img
                      src={googleAccount.picture}
                      alt="Google"
                      className="w-12 h-12 rounded-full mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold mr-4">
                      G
                    </div>
                  )}
                  <div className="text-xl font-semibold text-red-500">Google</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {googleAccount.name && (
                    <div>
                      <span className="text-gray-600 font-semibold">名前: </span>
                      <span className="text-gray-900">{googleAccount.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 font-semibold">User ID: </span>
                    <span className="text-gray-900">{googleAccount.uid}</span>
                  </div>
                </div>
              </div>
            )}

            {!twitterAccount && !googleAccount && (
              <div className="text-center py-8 text-gray-500 italic">
                まだソーシャルアカウントが連携されていません。
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-4">
            {user.is_staff && (
              <a
                href="http://localhost:18000/admin/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg text-center"
              >
                ⚙️ 管理画面へ
              </a>
            )}

            {!twitterAccount && (
              <a
                href="http://localhost:18000/accounts/twitter_oauth2/login/"
                className="flex-1 min-w-[200px] bg-white border-2 border-blue-500 text-blue-500 py-3 px-6 rounded-xl font-semibold hover:bg-blue-50 transition shadow text-center"
              >
                🐦 Twitter を連携
              </a>
            )}

            {!googleAccount && (
              <a
                href="http://localhost:18000/accounts/google/login/"
                className="flex-1 min-w-[200px] bg-white border-2 border-red-500 text-red-500 py-3 px-6 rounded-xl font-semibold hover:bg-red-50 transition shadow text-center"
              >
                🔵 Google を連携
              </a>
            )}

            <button
              onClick={handleLogout}
              className="flex-1 min-w-[200px] bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 transition shadow-lg"
            >
              🚪 ログアウト
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

