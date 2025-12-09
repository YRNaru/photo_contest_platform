'use client';

interface ContestBasicInfoFormProps {
  title: string;
  description: string;
  slug: string;
  bannerImage: File | null;
  currentBannerImage?: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onBannerImageChange: (file: File | null) => void;
}

export function ContestBasicInfoForm({
  title,
  description,
  slug,
  bannerImage,
  currentBannerImage,
  onTitleChange,
  onDescriptionChange,
  onBannerImageChange,
}: ContestBasicInfoFormProps) {
  return (
    <div className="space-y-6">
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

      <div>
        <label className="block text-sm font-medium mb-2">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          placeholder="夏のフォトコンテスト2024"
          className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          説明
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          placeholder="コンテストの説明を入力してください"
          className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      {/* 現在のバナー画像を表示 */}
      {currentBannerImage && !bannerImage && (
        <div>
          <label className="block text-sm font-medium mb-2">現在のバナー画像</label>
          <img
            src={currentBannerImage}
            alt="現在のバナー"
            className="max-w-full h-auto rounded-lg mb-2"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          {currentBannerImage ? "新しいバナー画像（変更する場合のみ）" : "バナー画像"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onBannerImageChange(e.target.files?.[0] || null)}
          className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
    </div>
  );
}

