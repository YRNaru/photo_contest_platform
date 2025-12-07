"use client";

import { useState, useEffect, useRef } from "react";

// Twitterウィジェットの型定義
declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => void;
        createTweet: (
          tweetId: string,
          targetElement: HTMLElement,
          options?: any
        ) => Promise<HTMLElement | undefined>;
      };
      ready?: (callback: () => void) => void;
    };
  }
}

interface TwitterSettingsProps {
  hashtag: string;
  autoFetch: boolean;
  autoApprove: boolean;
  onHashtagChange: (value: string) => void;
  onAutoFetchChange: (value: boolean) => void;
  onAutoApproveChange: (value: boolean) => void;
}

export function TwitterSettings({
  hashtag,
  autoFetch,
  autoApprove,
  onHashtagChange,
  onAutoFetchChange,
  onAutoApproveChange
}: TwitterSettingsProps) {
  const [tweetUrl, setTweetUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const tweetContainerRef = useRef<HTMLDivElement>(null);

  // Twitter埋め込みスクリプトを読み込む（一度だけ）
  useEffect(() => {
    // 既にスクリプトが存在する場合はスキップ
    if (document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);

    // クリーンアップでは削除しない（他のコンポーネントが使用する可能性があるため）
  }, []);

  // プレビュー表示時にツイートを埋め込む
  useEffect(() => {
    if (!showPreview || !tweetUrl || !tweetContainerRef.current) {
      return;
    }

    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) {
      setLoadError(true);
      return;
    }

    setIsLoading(true);
    setLoadError(false);

    // コンテナをクリア
    tweetContainerRef.current.innerHTML = "";

    // Twitterウィジェットの準備ができるまで待つ
    const loadTweet = () => {
      if (window.twttr?.widgets?.createTweet && tweetContainerRef.current) {
        window.twttr.widgets
          .createTweet(tweetId, tweetContainerRef.current, {
            theme: "light",
            align: "center",
          })
          .then((element) => {
            setIsLoading(false);
            if (!element) {
              setLoadError(true);
            }
          })
          .catch(() => {
            setIsLoading(false);
            setLoadError(true);
          });
      } else {
        // ウィジェットがまだ読み込まれていない場合、少し待ってから再試行
        setTimeout(loadTweet, 100);
      }
    };

    // Twitterウィジェットが利用可能になるまで待つ
    if (window.twttr?.ready) {
      window.twttr.ready(loadTweet);
    } else {
      // twttr.readyがまだ利用できない場合
      setTimeout(loadTweet, 500);
    }
  }, [showPreview, tweetUrl]);

  const extractTweetId = (url: string): string | null => {
    // twitter.com と x.com の両方に対応
    const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleShowPreview = () => {
    if (tweetUrl && extractTweetId(tweetUrl)) {
      setShowPreview(true);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setLoadError(false);
  };
  return (
    <div className="border-t pt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Twitter連携設定</h2>

      {/* コンテスト宣伝ツイートの埋め込み */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          コンテスト宣伝ツイート（任意）
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          コンテストの宣伝ツイートのURLを入力してください。コンテストページに埋め込んで表示されます。
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={tweetUrl}
            onChange={(e) => {
              setTweetUrl(e.target.value);
              setLoadError(false);
            }}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: https://twitter.com/user/status/1234567890 または https://x.com/user/status/1234567890"
          />
          <button
            type="button"
            onClick={handleShowPreview}
            disabled={!tweetUrl}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            プレビュー
          </button>
        </div>
        
        {/* エラーメッセージ */}
        {loadError && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded text-sm">
            ツイートの読み込みに失敗しました。URLが正しいか確認してください。
          </div>
        )}
        
        {/* ツイートプレビュー */}
        {showPreview && (
          <div className="mt-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">プレビュー</h3>
              <button
                type="button"
                onClick={handleClosePreview}
                className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                ✕ 閉じる
              </button>
            </div>
            
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">読み込み中...</span>
              </div>
            )}
            
            <div ref={tweetContainerRef} className="flex justify-center min-h-[200px]"></div>
          </div>
        )}
      </div>

            {/* Twitterハッシュタグ */}
            <div className="mt-8">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Twitterハッシュタグ
          {autoFetch && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={hashtag}
          onChange={(e) => onHashtagChange(e.target.value)}
          required={autoFetch}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: フォトコンテスト（#は不要）"
        />
        {autoFetch && !hashtag && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Twitter自動取得を有効にする場合、ハッシュタグは必須です
          </p>
        )}
      </div>

      {/* 自動取得設定 */}
      <div className="mt-8 space-y-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoFetch}
              onChange={(e) => onAutoFetchChange(e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter自動取得を有効にする</span>
          </label>
          <p className="text-xs text-gray-600 dark:text-gray-400 ml-6 mt-1">
            設定したハッシュタグを15分おきに取得します。
          </p>
        </div>

        {/* Twitter自動取得が有効な場合のみ表示 */}
        {autoFetch && (
          <div className="ml-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => onAutoApproveChange(e.target.checked)}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter投稿を自動承認する</span>
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 ml-6 mt-1">
              応募された写真を自動で承認します
            </p>
          </div>
        )}
      </div>


    </div>
  );
}

