interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  // Twitter連携が必要なエラーかチェック
  const requiresTwitter = error.includes('Twitterアカウントとの連携が必要') || 
                          error.includes('Twitter連携');

  return (
    <div className="p-5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-2 border-red-300 dark:border-red-700 rounded-xl">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <pre className="whitespace-pre-wrap text-sm font-semibold text-red-700 dark:text-red-300">{error}</pre>
          {requiresTwitter && (
            <div className="mt-3">
              <a 
                href="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                <span className="text-lg">𝕏</span>
                プロフィールページでX (Twitter) アカウントを連携する
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

