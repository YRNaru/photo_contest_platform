"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { contestApi, entryApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ContestSelect } from "@/components/submit/ContestSelect";
import { EntryLimitInfo } from "@/components/submit/EntryLimitInfo";
import { FormInput } from "@/components/submit/FormInput";
import { ImageUploadSection } from "@/components/submit/ImageUploadSection";
import { ErrorDisplay } from "@/components/submit/ErrorDisplay";
import { SubmitButton } from "@/components/submit/SubmitButton";
import { TagSelector } from "@/components/submit/TagSelector";

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestSlug = searchParams.get("contest");
  const { isAuthenticated } = useAuth();

  const [selectedContest, setSelectedContest] = useState(contestSlug || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  // 画像追加ハンドラー
  const handleImagesAdd = (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > 5) {
      setError("画像は最大5枚までアップロードできます");
      return;
    }
    setImages([...images, ...acceptedFiles]);
    setError("");
  };

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
    formData.append("tags", selectedTags.join(", "));
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

      {contestDetail && userEntries && (
        <EntryLimitInfo 
          maxEntriesPerUser={contestDetail.max_entries_per_user}
          currentEntriesCount={userEntries.length}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <ContestSelect
          value={selectedContest}
          onChange={setSelectedContest}
          contests={contests}
        />

        <FormInput
          label="タイトル"
          icon="✏️"
          required
          value={title}
          onChange={setTitle}
          placeholder="作品のタイトルを入力"
        />

        <FormInput
          label="説明"
          icon="📝"
          value={description}
          onChange={setDescription}
          placeholder="作品の説明を入力"
          multiline
        />

        {/* タグ選択 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-purple-500/10 p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏷️</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              タグ
            </h2>
          </div>
          <TagSelector selectedTags={selectedTags} onTagsChange={setSelectedTags} />
        </div>

        <ImageUploadSection
          images={images}
          onImagesAdd={handleImagesAdd}
          onImageRemove={removeImage}
          maxImages={5}
        />

        <ErrorDisplay error={error} />
        <SubmitButton isSubmitting={submitMutation.isPending} />
      </form>
    </div>
  );
}

