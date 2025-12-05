import Link from "next/link";
import { ContestList } from "@/components/ContestList";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-12 mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          VRChat フォトコンテスト
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          あなたの最高の一枚を投稿しよう
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/contests"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            コンテスト一覧
          </Link>
          <Link
            href="/submit"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition"
          >
            作品を投稿
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">開催中のコンテスト</h2>
        <ContestList />
      </section>

      <section className="grid md:grid-cols-3 gap-8 py-12">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">📸</div>
          <h3 className="text-xl font-semibold mb-2">簡単投稿</h3>
          <p className="text-muted-foreground">
            写真をアップロードして、タイトルと説明を入力するだけ
          </p>
        </div>
        <div className="text-center p-6">
          <div className="text-4xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold mb-2">投票機能</h3>
          <p className="text-muted-foreground">
            気に入った作品に投票して、お気に入りをシェア
          </p>
        </div>
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold mb-2">審査員スコア</h3>
          <p className="text-muted-foreground">
            プロの審査員による評価で公平な審査
          </p>
        </div>
      </section>
    </div>
  );
}

