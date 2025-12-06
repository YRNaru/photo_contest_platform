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
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">ログインが必要です</h1>
          <p className="text-muted-foreground">
            作品を投稿するにはGoogleアカウントでログインしてください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">作品を投稿</h1>

      {/* 投稿制限の警告 */}
      {contestDetail && userEntries && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            このコンテストへの投稿可能数: {contestDetail.max_entries_per_user}件
            {userEntries.length > 0 && (
              <span className="ml-2">
                （現在 {userEntries.length}件投稿済み）
              </span>
            )}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* コンテスト選択 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            コンテスト <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedContest}
            onChange={(e) => setSelectedContest(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
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
          <label className="block text-sm font-medium mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="作品のタイトルを入力"
            required
          />
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-medium mb-2">説明</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg h-32"
            placeholder="作品の説明を入力"
          />
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium mb-2">
            タグ（カンマ区切り）
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="VRChat, しなの, ツーショット"
          />
        </div>

        {/* 画像アップロード */}
        <div>
          <label className="block text-sm font-medium mb-2">
            画像（最大5枚） <span className="text-red-500">*</span>
          </label>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-muted-foreground">
              {isDragActive
                ? "ここにドロップしてください"
                : "クリックまたはドラッグ＆ドロップで画像をアップロード"}
            </p>
          </div>

          {/* プレビュー */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
        >
          {submitMutation.isPending ? "投稿中..." : "投稿する"}
        </button>
      </form>
    </div>
  );
}

