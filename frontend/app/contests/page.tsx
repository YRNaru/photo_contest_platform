import { ContestList } from "@/components/ContestList";

export default function ContestsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">コンテスト一覧</h1>
      <ContestList />
    </div>
  );
}

