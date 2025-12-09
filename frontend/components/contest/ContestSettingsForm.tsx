'use client';

interface ContestSettingsFormProps {
  isPublic: boolean;
  autoApproveEntries: boolean;
  onIsPublicChange: (value: boolean) => void;
  onAutoApproveChange: (value: boolean) => void;
}

export function ContestSettingsForm({
  isPublic,
  autoApproveEntries,
  onIsPublicChange,
  onAutoApproveChange,
}: ContestSettingsFormProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => onIsPublicChange(e.target.checked)}
          className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">公開する</span>
      </label>
      
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={autoApproveEntries}
          onChange={(e) => onAutoApproveChange(e.target.checked)}
          className="mr-2 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">投稿を自動承認する</span>
      </label>
      <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
        有効にすると、ユーザーが投稿した作品が自動的に承認されます
      </p>
    </div>
  );
}

