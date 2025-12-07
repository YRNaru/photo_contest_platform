"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contestApi, userApi } from "@/lib/api";
import { User } from "@/lib/types";

interface JudgeManagerProps {
  contestSlug: string;
  isOwner: boolean;
}

export default function JudgeManager({ contestSlug, isOwner }: JudgeManagerProps) {
  const queryClient = useQueryClient();
  const [isAddingJudge, setIsAddingJudge] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 審査員一覧を取得
  const { data: judges, isLoading: judgesLoading } = useQuery({
    queryKey: ["judges", contestSlug],
    queryFn: async () => {
      const response = await contestApi.getJudges(contestSlug);
      return response.data as User[];
    },
    enabled: isOwner,
  });

  // ユーザー一覧を取得（審査員追加用）
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await userApi.getUsers();
      return response.data.results as User[];
    },
    enabled: isAddingJudge,
  });

  // 審査員を追加
  const addJudgeMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await contestApi.addJudge(contestSlug, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judges", contestSlug] });
      queryClient.invalidateQueries({ queryKey: ["contest", contestSlug] });
      setSuccessMessage("審査員を追加しました");
      setErrorMessage(null);
      setIsAddingJudge(false);
      setSelectedUserId("");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "審査員の追加に失敗しました";
      setErrorMessage(message);
      setSuccessMessage(null);
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // 審査員を削除
  const removeJudgeMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await contestApi.removeJudge(contestSlug, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judges", contestSlug] });
      queryClient.invalidateQueries({ queryKey: ["contest", contestSlug] });
      setSuccessMessage("審査員を削除しました");
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "審査員の削除に失敗しました";
      setErrorMessage(message);
      setSuccessMessage(null);
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  if (!isOwner) {
    return null;
  }

  if (judgesLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-800">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-purple-500/10 p-6 mb-6 border border-gray-200 dark:border-gray-800 animate-fadeInUp">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          👨‍⚖️ 審査員管理
        </h2>
        {!isAddingJudge && (
          <button
            onClick={() => setIsAddingJudge(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-lg transition-colors"
          >
            ➕ 審査員を追加
          </button>
        )}
      </div>

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* 審査員追加フォーム */}
      {isAddingJudge && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-3">審査員を追加</h3>
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">ユーザーを選択...</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (selectedUserId) {
                  addJudgeMutation.mutate(selectedUserId);
                }
              }}
              disabled={!selectedUserId || addJudgeMutation.isPending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors"
            >
              {addJudgeMutation.isPending ? "追加中..." : "追加"}
            </button>
            <button
              onClick={() => {
                setIsAddingJudge(false);
                setSelectedUserId("");
              }}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold text-sm rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 審査員一覧 */}
      <div className="space-y-3">
        {judges && judges.length > 0 ? (
          judges.map((judge) => (
            <div
              key={judge.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                {judge.avatar_url ? (
                  <img
                    src={judge.avatar_url}
                    alt={judge.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {judge.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{judge.username}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{judge.email}</p>
                </div>
              </div>
              <button
                onClick={() => removeJudgeMutation.mutate(judge.id)}
                disabled={removeJudgeMutation.isPending}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors"
              >
                削除
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">
            まだ審査員が登録されていません
          </p>
        )}
      </div>
    </div>
  );
}
