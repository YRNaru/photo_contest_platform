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
  return (
    <div className="border-t pt-6">
      <h2 className="text-xl font-bold mb-4">Twitter連携設定</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Twitterハッシュタグ
        </label>
        <input
          type="text"
          value={hashtag}
          onChange={(e) => onHashtagChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: フォトコンテスト（#は不要）"
        />
      </div>

      <div className="mt-4 space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={autoFetch}
            onChange={(e) => onAutoFetchChange(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium">Twitter自動取得を有効にする</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => onAutoApproveChange(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium">Twitter投稿を自動承認する</span>
        </label>
      </div>
    </div>
  );
}

