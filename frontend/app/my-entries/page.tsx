'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { entryApi } from '@/lib/api';
import { Entry } from '@/lib/types';
import { FaImage, FaHeart, FaEye } from 'react-icons/fa';
import Link from 'next/link';

export default function MyEntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyEntries = async () => {
      try {
        // トークンがあるか確認
        const storedToken = localStorage.getItem('access_token');
        if (!storedToken) {
          console.error('トークンがありません。ログインページにリダイレクトします。');
          router.push('/');
          return;
        }

        // 現在のユーザー情報を取得してからエントリーを取得
        const userResponse = await fetch('http://localhost:18000/api/users/me/', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }

        const userData = await userResponse.json();
        
        // ユーザーIDでエントリーをフィルタリング
        const response = await entryApi.getEntries({ author: userData.id });
        setEntries(response.data.results || response.data);
      } catch (err: any) {
        console.error('投稿取得エラー:', err);
        
        if (err.message === 'Network Error') {
          setError('バックエンドに接続できません。サーバーが起動しているか確認してください。');
        } else if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          router.push('/');
        } else {
          setError('投稿の取得に失敗しました');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyEntries();
  }, [router]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md border-2 border-gray-200 dark:border-gray-800 animate-fadeInUp">
          <div className="text-7xl mb-6 text-center">⚠️</div>
          <div className="text-red-600 dark:text-red-400 text-center font-semibold text-lg mb-6">
            {error}
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

  return (
    <div className="min-h-screen bg-white dark:bg-black py-6 sm:py-8 lg:py-12 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-t-2xl sm:rounded-t-3xl p-6 sm:p-8 lg:p-10 text-center shadow-xl animate-fadeInUp">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">📸 マイ投稿</h1>
          <p className="text-purple-100 text-base sm:text-lg">あなたが投稿した作品一覧</p>
        </div>

        {/* コンテンツ */}
        <div className="bg-white dark:bg-gray-900 rounded-b-2xl sm:rounded-b-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
          {entries.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 animate-fadeInUp">
              <span className="text-7xl mb-4 block opacity-50">📸</span>
              <p className="text-gray-500 dark:text-gray-400 italic text-lg mb-4">まだ投稿がありません</p>
              <Link
                href="/submit"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                📷 新しい投稿を作成
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{entries.length}</span>
                  <span className="ml-2">件の投稿</span>
                </div>
                <Link
                  href="/submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  ➕ 新しい投稿
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
                {entries.map((entry, index) => (
                  <Link
                    key={entry.id}
                    href={`/entries/${entry.id}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 animate-fadeInUp"
                  >
                    {/* サムネイル */}
                    <div className="relative w-full aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 overflow-hidden">
                      {entry.thumbnail ? (
                        <img
                          src={entry.thumbnail}
                          alt={entry.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaImage className="text-6xl text-gray-400 dark:text-gray-600" />
                        </div>
                      )}
                      {/* 承認ステータス */}
                      {!entry.approved && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ⏳ 承認待ち
                        </div>
                      )}
                      {entry.approved && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ✓ 承認済み
                        </div>
                      )}
                    </div>

                    {/* 情報 */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {entry.title}
                      </h3>
                      
                      {entry.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {entry.description}
                        </p>
                      )}

                      {/* 統計 */}
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <FaHeart className="text-red-500" />
                            {entry.vote_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaEye className="text-blue-500" />
                            {entry.view_count}
                          </span>
                        </div>
                      </div>

                      {/* 日付 */}
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

