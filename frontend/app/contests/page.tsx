'use client';

import { ContestList } from "@/components/ContestList";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function ContestsPage() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">コンテスト一覧</h1>
        {isAuthenticated && (
          <Link
            href="/contests/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            + 新しいコンテストを作成
          </Link>
        )}
      </div>
      <ContestList />
    </div>
  );
}

