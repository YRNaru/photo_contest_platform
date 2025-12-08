import Link from "next/link";
import { ContestList } from "@/components/ContestList";

export default function HomePage() {
  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <section className="text-center py-8 sm:py-12 lg:py-16 mb-8 sm:mb-12 lg:mb-16 animate-fadeInUp">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient leading-tight">
          VRChat フォトコンテスト
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 lg:mb-10 font-semibold px-4">
          ✨ あなたの最高の一枚を投稿しよう ✨
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
          <Link
            href="/contests"
            className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 sm:hover:scale-110 transform-gpu flex items-center justify-center gap-2"
          >
            <span className="text-xl sm:text-2xl group-hover:scale-125 transition-transform">🏆</span>
            コンテスト一覧
          </Link>
          <Link
            href="/submit"
            className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 sm:hover:scale-110 transform-gpu flex items-center justify-center gap-2"
          >
            <span className="text-xl sm:text-2xl group-hover:scale-125 transition-transform">📸</span>
            作品を投稿
          </Link>
          <Link
            href="/features"
            className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 sm:hover:scale-110 transform-gpu flex items-center justify-center gap-2"
          >
            <span className="text-xl sm:text-2xl group-hover:scale-125 transition-transform">✨</span>
            機能一覧
          </Link>
        </div>
      </section>

      <section className="mb-8 sm:mb-12 lg:mb-16 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6 sm:mb-8 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent px-2">
          🔥 開催中のコンテスト
        </h2>
        <ContestList />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 py-8 sm:py-12 lg:py-16 animate-fadeInUp px-2" style={{ animationDelay: '200ms' }}>
        <div className="group text-center p-6 sm:p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl sm:rounded-2xl border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:scale-105 transform-gpu hover:shadow-xl">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 group-hover:scale-125 transition-transform duration-300">📸</div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">簡単投稿</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            写真をアップロードして、タイトルと説明を入力するだけ
          </p>
        </div>
        <div className="group text-center p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl sm:rounded-2xl border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:scale-105 transform-gpu hover:shadow-xl">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 group-hover:scale-125 transition-transform duration-300">⭐</div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">投票機能</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            気に入った作品に投票して、お気に入りをシェア
          </p>
        </div>
        <div className="group text-center p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl sm:rounded-2xl border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 hover:scale-105 transform-gpu hover:shadow-xl sm:col-span-2 lg:col-span-1">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 group-hover:scale-125 transition-transform duration-300">🏆</div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">審査員スコア</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            プロの審査員による評価で公平な審査
          </p>
        </div>
      </section>
    </div>
  );
}

