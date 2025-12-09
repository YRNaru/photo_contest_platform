'use client';

interface ContestLimitsFormProps {
  maxEntriesPerUser: string;
  maxImagesPerEntry: string;
  unlimitedEntries: boolean;
  unlimitedImages: boolean;
  onMaxEntriesChange: (value: string) => void;
  onMaxImagesChange: (value: string) => void;
  onUnlimitedEntriesChange: (value: boolean) => void;
  onUnlimitedImagesChange: (value: boolean) => void;
}

export function ContestLimitsForm({
  maxEntriesPerUser,
  maxImagesPerEntry,
  unlimitedEntries,
  unlimitedImages,
  onMaxEntriesChange,
  onMaxImagesChange,
  onUnlimitedEntriesChange,
  onUnlimitedImagesChange,
}: ContestLimitsFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ユーザーあたり最大応募数 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          ユーザーあたり最大応募数
        </label>
        <input
          type="number"
          value={maxEntriesPerUser}
          onChange={(e) => onMaxEntriesChange(e.target.value)}
          disabled={unlimitedEntries}
          min="1"
          className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 disabled:opacity-50"
        />
        <label className="flex items-center mt-2">
          <input
            type="checkbox"
            checked={unlimitedEntries}
            onChange={(e) => onUnlimitedEntriesChange(e.target.checked)}
            className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">無制限</span>
        </label>
      </div>

      {/* エントリーあたり最大画像数 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          エントリーあたり最大画像数
        </label>
        <input
          type="number"
          value={maxImagesPerEntry}
          onChange={(e) => onMaxImagesChange(e.target.value)}
          disabled={unlimitedImages}
          min="1"
          className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 disabled:opacity-50"
        />
        <label className="flex items-center mt-2">
          <input
            type="checkbox"
            checked={unlimitedImages}
            onChange={(e) => onUnlimitedImagesChange(e.target.checked)}
            className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">無制限</span>
        </label>
      </div>
    </div>
  );
}

