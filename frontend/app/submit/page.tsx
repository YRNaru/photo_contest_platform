"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { contestApi, entryApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useDropzone } from "react-dropzone";
import { FaUpload, FaTimes } from "react-icons/fa";

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestSlug = searchParams.get("contest");
  const { isAuthenticated } = useAuth();

  const [selectedContest, setSelectedContest] = useState(contestSlug || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");

  // コンテスト一覧取得
  const { data: contests } = useQuery({
    queryKey: ["contests"],
    queryFn: async () => {
      const response = await contestApi.getContests();
      return response.data.results || response.data;
    },
  });

  // 選択されたコンテストの詳細を取得
  const { data: contestDetail } = useQuery({
    queryKey: ["contest", selectedContest],
    queryFn: async () => {
      if (!selectedContest) return null;
      const response = await contestApi.getContest(selectedContest);
      return response.data;
    },
    enabled: !!selectedContest,
  });

  // ユーザーの既存エントリーを取得
  const { data: userEntries } = useQuery({
    queryKey: ["user-entries", selectedContest],
    queryFn: async () => {
      if (!selectedContest || !isAuthenticated) return [];
      const response = await entryApi.getEntries({ contest: selectedContest });
      const allEntries = response.data.results || response.data;
      // 現在のユーザーのエントリーのみフィルター（クライアント側で）
      return allEntries;
    },
    enabled: !!selectedContest && isAuthenticated,
  });

  // ドロップゾーン
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      if (images.length + acceptedFiles.length > 5) {
        setError("画像は最大5枚までアップロードできます");
        return;
      }
      setImages([...images, ...acceptedFiles]);
      setError("");
    },
  });

  // 投稿mutation
  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await entryApi.createEntry(formData);
      return response.data;
    },
    onSuccess: (data) => {
      router.push(`/entries/${data.id}`);
    },
    onError: (error: any) => {
      console.error('投稿エラー:', error);
      console.error('エラーレスポンス:', error.response?.data);
      console.error('エラーステータス:', error.response?.status);
      console.error('エラーヘッダー:', error.response?.headers);
      
      // non_field_errorsの中身を詳細に表示
      if (error.response?.data?.non_field_errors) {
        console.error('non_field_errors 詳細:', error.response.data.non_field_errors);
        error.response.data.non_field_errors.forEach((err: any, index: number) => {
          console.error(`  [${index}]:`, err);
        });
      }
      
      // エラーメッセージを整形
      let errorMessage = '投稿に失敗しました。';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.non_field_errors) {
          errorMessage = Array.isArray(error.response.data.non_field_errors) 
            ? error.response.data.non_field_errors.join('\n')
            : error.response.data.non_field_errors;
        } else {
          // フィールドごとのエラーを表示
          const errors = Object.entries(error.response.data).map(([field, messages]: [string, any]) => {
            const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
            return `${fieldName}${Array.isArray(messages) ? messages.join(', ') : messages}`;
          }).join('\n');
          errorMessage = errors || JSON.stringify(error.response.data);
        }
      }
      setError(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // デバッグ: 認証状態を確認
    console.log('認証状態:', isAuthenticated);
    console.log('アクセストークン:', localStorage.getItem('access_token') ? '存在する' : '存在しない');

    if (!isAuthenticated) {
      setError("ログインしてください");
      return;
    }

    if (!selectedContest) {
      setError("コンテストを選択してください");
      return;
    }

    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }

    if (images.length === 0) {
      setError("画像を1枚以上アップロードしてください");
      return;
    }

    const formData = new FormData();
    formData.append("contest", selectedContest);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags);
    images.forEach((image) => {
      formData.append("images", image);
    });

    // デバッグ: FormDataの内容を確認
    console.log('送信するFormData:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, value.name, value.type, value.size, 'bytes');
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    submitMutation.mutate(formData);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700">
          <span className="text-7xl mb-6 block">🔒</span>
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            ログインが必要です
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            作品を投稿するにはGoogleアカウントでログインしてください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-fadeInUp">
        📸 作品を投稿
      </h1>

      {/* 投稿制限の警告 */}
      {contestDetail && userEntries && (
        <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-xl animate-fadeInUp" style={{ animationDelay: '50ms' }}>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
            💡 このコンテストへの投稿可能数: <span className="text-lg">{contestDetail.max_entries_per_user}</span>件
            {userEntries.length > 0 && (
              <span className="ml-2 text-blue-700 dark:text-blue-300">
                （現在 <span className="font-bold text-lg">{userEntries.length}</span>件投稿済み）
              </span>
            )}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        {/* コンテスト選択 */}
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-gray-100">
            🏆 コンテスト <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            value={selectedContest}
            onChange={(e) => setSelectedContest(e.target.value)}
            className="w-full px-5 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-purple-400 dark:hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
            required
          >
            <option value="">選択してください</option>
            {contests?.map((contest: any) => (
              <option key={contest.slug} value={contest.slug}>
                {contest.title}
              </option>
            ))}
          </select>
        </div>

        {/* タイトル */}
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-gray-100">
            ✏️ タイトル <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-purple-400 dark:hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
            placeholder="作品のタイトルを入力"
            required
          />
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-gray-100">
            📝 説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-purple-400 dark:hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all h-32 resize-none"
            placeholder="作品の説明を入力"
          />
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-gray-100">
            🏷️ タグ（カンマ区切り）
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-5 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-purple-400 dark:hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
            placeholder="VRChat, しなの, ツーショット"
          />
        </div>

        {/* 画像アップロード */}
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-gray-100">
            📷 画像（最大5枚） <span className="text-red-500 dark:text-red-400">*</span>
          </label>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              isDragActive 
                ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 scale-105" 
                : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-purple-400 dark:hover:border-purple-600"
            }`}
          >
            <input {...getInputProps()} />
            <FaUpload className="mx-auto text-6xl text-purple-500 dark:text-purple-400 mb-6 animate-float" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {isDragActive
                ? "✨ ここにドロップしてください"
                : "クリックまたはドラッグ＆ドロップで画像をアップロード"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              PNG, JPG, JPEG, WEBP対応
            </p>
          </div>

          {/* プレビュー */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              {images.map((file, index) => (
                <div key={index} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all hover:scale-110 transform-gpu shadow-lg"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="p-5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-2 border-red-300 dark:border-red-700 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <pre className="whitespace-pre-wrap text-sm font-semibold text-red-700 dark:text-red-300 flex-1">{error}</pre>
            </div>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
        >
          {submitMutation.isPending ? (
            <>
              <span className="animate-spin">⏳</span>
              投稿中...
            </>
          ) : (
            <>
              <span className="text-2xl">🚀</span>
              投稿する
            </>
          )}
        </button>
      </form>
    </div>
  );
}

