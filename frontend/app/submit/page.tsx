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
      setError(error.response?.data?.detail || "投稿に失敗しました");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
            {error}
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

