"use client";

import { useState } from "react";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

// ジャンル別のタグ定義
const TAG_CATEGORIES = {
  "撮影スタイル": [
    "ポートレート",
    "風景",
    "スナップ",
    "ツーショット",
    "グループ",
    "セルフィー",
  ],
  "雰囲気": [
    "かわいい",
    "かっこいい",
    "おもしろい",
    "幻想的",
    "リアル",
    "アート",
  ],
  "使用アバター": [
    "しなの",
    "まめひなた",
    "桔梗",
    "萌",
    "セレスティア",
    "リーファ",
    "ライム",
    "オリジナル",
  ],
  "テーマ": [
    "ファッション",
    "VRChat",
    "ワールド",
    "イベント",
    "季節",
    "日常",
  ],
};

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [customTag, setCustomTag] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag]);
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="space-y-4">
      {/* ジャンル別タグ選択 */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
          ジャンルからタグを選択
        </h3>
        {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
          <div key={category} className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 flex items-center justify-between transition-colors"
            >
              <span className="font-semibold text-gray-900 dark:text-gray-100">{category}</span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  expandedCategory === category ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {expandedCategory === category && (
              <div className="p-3 bg-white dark:bg-gray-900">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-purple-600 text-white shadow-md"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* カスタムタグ追加 */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2">
          カスタムタグを追加
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomTag();
              }
            }}
            placeholder="カスタムタグを入力..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={handleAddCustomTag}
            disabled={!customTag.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            追加
          </button>
        </div>
      </div>

      {/* 選択されたタグ */}
      {selectedTags.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2">
            選択されたタグ ({selectedTags.length})
          </h3>
          <div className="flex flex-wrap gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 rounded-full text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
