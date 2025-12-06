'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { User, SocialAccount } from '@/lib/types';
import { FaUpload, FaCheck } from 'react-icons/fa';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // プレビュー表示
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // アップロード
      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await userApi.updateProfile(formData);
      setUser(response.data);
      setUploadSuccess(true);
      
      // 成功メッセージを3秒後に消す
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error('アバターアップロードエラー:', err);
      alert('アイコンのアップロードに失敗しました');
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSetTwitterIcon = async () => {
    if (!twitterAccount?.profile_image_url) {
      alert('Twitterアイコンが見つかりません');
      return;
    }
    
    setUploading(true);
    setUploadSuccess(false);
    try {
      const response = await userApi.setTwitterIcon();
      setUser(response.data);
      setAvatarPreview(null);
      setUploadSuccess(true);
      
      // 成功メッセージを3秒後に消す
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error('Twitterアイコン設定エラー:', err);
      alert('Twitterアイコンの設定に失敗しました');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-bounce">⏳</div>
          <div className="text-gray-900 dark:text-gray-100 text-xl font-bold">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md border-2 border-gray-200 dark:border-gray-800 animate-fadeInUp">
          <div className="text-7xl mb-6 text-center">⚠️</div>
          <div className="text-red-600 dark:text-red-400 text-center font-semibold text-lg mb-6">
            {error || 'ユーザー情報が見つかりません'}
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            🏠 ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const twitterAccount = getTwitterAccount();
  const googleAccount = getGoogleAccount();

  return (
    <div className="min-h-screen bg-white dark:bg-black py-6 sm:py-8 lg:py-12 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-t-2xl sm:rounded-t-3xl p-6 sm:p-8 lg:p-10 text-center shadow-xl animate-fadeInUp">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">👤 プロフィール</h1>
          <p className="text-purple-100 text-base sm:text-lg">VRChat Photo Contest Platform</p>
        </div>

        {/* コンテンツ */}
        <div className="bg-white dark:bg-gray-900 rounded-b-2xl sm:rounded-b-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
          {/* プロフィール画像設定 */}
          <div className="mb-8 animate-fadeInUp">
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
              📸 プロフィール画像
            </h2>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* アバター表示 */}
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-purple-500 dark:border-purple-600 shadow-xl group-hover:scale-105 transition-transform duration-300">
                  {avatarPreview || user.avatar_url ? (
                    <img
                      src={avatarPreview || user.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center text-white text-6xl sm:text-7xl lg:text-8xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin text-white text-4xl">⏳</div>
                  </div>
                )}
                {uploadSuccess && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg animate-fadeInUp">
                    <FaCheck size={20} />
                  </div>
                )}
              </div>

              {/* アップロードボタン */}
              <div className="flex-1 w-full space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaUpload className="text-xl" />
                  <span>{uploading ? 'アップロード中...' : '画像をアップロード'}</span>
                </button>

                {twitterAccount?.profile_image_url && (
                  <button
                    onClick={handleSetTwitterIcon}
                    disabled={uploading}
                    className="w-full flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img
                      src={twitterAccount.profile_image_url}
                      alt="Twitter"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-lg"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-black text-base sm:text-lg">Twitterアイコンを使用</div>
                      <div className="text-xs text-blue-100">@{twitterAccount.username}</div>
                    </div>
                  </button>
                )}

                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                  推奨サイズ: 512x512px 以上 | 形式: JPG, PNG, WEBP
                </p>
              </div>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
              ℹ️ 基本情報
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
                <span className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-bold mb-2 block">👤 ユーザー名</span>
                <span className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold">{user.username}</span>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-bold mb-2 block">📧 メールアドレス</span>
                <span className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold truncate block">{user.email}</span>
              </div>
              {(user.first_name || user.last_name) && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-800">
                  <span className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-bold mb-2 block">🏷️ 名前</span>
                  <span className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold">{user.first_name} {user.last_name}</span>
                </div>
              )}
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <span className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 font-bold mb-2 block">⭐ 権限</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.is_superuser && (
                    <span className="px-3 sm:px-4 py-1 bg-yellow-400 text-gray-900 rounded-full text-xs sm:text-sm font-semibold">
                      🔑 スーパーユーザー
                    </span>
                  )}
                  {!user.is_superuser && user.is_staff && (
                    <span className="px-3 sm:px-4 py-1 bg-green-500 text-white rounded-full text-xs sm:text-sm font-semibold">
                      ⚙️ スタッフ
                    </span>
                  )}
                  {!user.is_superuser && !user.is_staff && (
                    <span className="px-3 sm:px-4 py-1 bg-blue-500 text-white rounded-full text-xs sm:text-sm font-semibold">
                      👤 一般ユーザー
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          {(user.entry_count !== undefined || user.vote_count !== undefined) && (
            <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                📊 統計情報
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {user.entry_count !== undefined && (
                  <div className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-4 sm:p-6 lg:p-8 text-center border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:scale-105 transition-all duration-300 hover:shadow-xl">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-purple-700 dark:text-purple-400 group-hover:scale-110 transition-transform">{user.entry_count}</div>
                    <div className="text-gray-700 dark:text-gray-300 mt-2 font-semibold text-sm sm:text-base">📸 エントリー数</div>
                  </div>
                )}
                {user.vote_count !== undefined && (
                  <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-4 sm:p-6 lg:p-8 text-center border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:scale-105 transition-all duration-300 hover:shadow-xl">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-indigo-700 dark:text-indigo-400 group-hover:scale-110 transition-transform">{user.vote_count}</div>
                    <div className="text-gray-700 dark:text-gray-300 mt-2 font-semibold text-sm sm:text-base">⭐ 投票数</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ソーシャルアカウント連携 */}
          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
              🔗 ソーシャルアカウント連携
            </h2>

            {twitterAccount && (
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-2xl p-4 sm:p-6 mb-4 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center mb-4">
                  {twitterAccount.profile_image_url ? (
                    <img
                      src={twitterAccount.profile_image_url}
                      alt="Twitter"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mr-4 border-2 border-blue-400 shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl mr-4 shadow-lg">
                      𝕏
                    </div>
                  )}
                  <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400">Twitter (X)</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">ユーザー名:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold">@{twitterAccount.username}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">User ID:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">{twitterAccount.uid}</span>
                  </div>
                </div>
              </div>
            )}

            {googleAccount && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-2 border-red-400 dark:border-red-600 rounded-2xl p-4 sm:p-6 mb-4 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center mb-4">
                  {googleAccount.picture ? (
                    <img
                      src={googleAccount.picture}
                      alt="Google"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mr-4 border-2 border-red-400 shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-2xl mr-4 shadow-lg">
                      G
                    </div>
                  )}
                  <div className="text-lg sm:text-xl font-black text-red-600 dark:text-red-400">Google</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {googleAccount.name && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 dark:text-gray-400 font-semibold">名前:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-bold">{googleAccount.name}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">User ID:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">{googleAccount.uid}</span>
                  </div>
                </div>
              </div>
            )}

            {!twitterAccount && !googleAccount && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <span className="text-5xl mb-4 block opacity-50">🔗</span>
                <p className="text-gray-500 dark:text-gray-400 italic text-sm sm:text-base">まだソーシャルアカウントが連携されていません。</p>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeInUp" style={{ animationDelay: '250ms' }}>
            {user.is_staff && (
              <a
                href="http://localhost:18000/admin/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 sm:py-4 px-6 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl text-center flex items-center justify-center gap-2"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">⚙️</span>
                管理画面へ
              </a>
            )}

            {!twitterAccount && (
              <a
                href="http://localhost:18000/accounts/twitter_oauth2/login/"
                className="group bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400 py-3 sm:py-4 px-6 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">𝕏</span>
                Twitter を連携
              </a>
            )}

            {!googleAccount && (
              <a
                href="http://localhost:18000/accounts/google/login/"
                className="group bg-white dark:bg-gray-800 border-2 border-red-500 dark:border-red-600 text-red-600 dark:text-red-400 py-3 sm:py-4 px-6 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">🔵</span>
                Google を連携
              </a>
            )}

            <button
              onClick={handleLogout}
              className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 sm:py-4 px-6 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 sm:col-span-2"
            >
              <span className="text-xl group-hover:scale-125 transition-transform">🚪</span>
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

