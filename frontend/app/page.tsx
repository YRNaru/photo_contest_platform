import Link from 'next/link'
import { ContestList } from '@/components/ContestList'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Trophy, Calendar, Camera, Sparkles } from 'lucide-react'

const heroLinkClass = cn(
  buttonVariants({ size: 'lg' }),
  'h-auto border-0 px-6 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] sm:px-8 sm:py-4 sm:text-base'
)

export default function HomePage() {
  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
      <section className="mb-8 animate-fadeInUp py-8 text-center sm:mb-12 sm:py-12 lg:mb-16 lg:py-16">
        <h1 className="mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-3xl font-black leading-tight text-transparent animate-gradient dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
          VRChat フォトコンテスト
        </h1>
        <p className="mb-6 px-4 text-base font-semibold text-muted-foreground sm:mb-8 sm:text-lg md:text-xl lg:mb-10 lg:text-2xl">
          ✨ あなたの最高の一枚を投稿しよう ✨
        </p>
        <div className="flex flex-col justify-center gap-4 px-4 sm:flex-row sm:gap-6">
          <Link
            href="/contests"
            className={cn(
              heroLinkClass,
              'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            )}
          >
            <Trophy className="size-5 sm:size-6" aria-hidden />
            コンテスト一覧
          </Link>
          <Link
            href="/calendar"
            className={cn(
              heroLinkClass,
              'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
            )}
          >
            <Calendar className="size-5 sm:size-6" aria-hidden />
            カレンダー
          </Link>
          <Link
            href="/submit"
            className={cn(
              heroLinkClass,
              'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700'
            )}
          >
            <Camera className="size-5 sm:size-6" aria-hidden />
            作品を投稿
          </Link>
          <Link
            href="/features"
            className={cn(
              heroLinkClass,
              'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
            )}
          >
            <Sparkles className="size-5 sm:size-6" aria-hidden />
            機能一覧
          </Link>
        </div>
      </section>

      <section className="mb-8 animate-fadeInUp sm:mb-12 lg:mb-16" style={{ animationDelay: '100ms' }}>
        <h2 className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text px-2 text-2xl font-black text-transparent dark:from-purple-400 dark:to-pink-400 sm:mb-8 sm:text-3xl lg:text-4xl">
          🔥 開催中のコンテスト
        </h2>
        <ContestList />
      </section>

      <section
        className="grid grid-cols-1 gap-4 px-2 py-8 animate-fadeInUp sm:grid-cols-2 sm:gap-6 sm:py-12 lg:grid-cols-3 lg:gap-8 lg:py-16"
        style={{ animationDelay: '200ms' }}
      >
        <Card className="group border-purple-200/80 bg-gradient-to-br from-purple-50/90 to-pink-50/90 transition-all duration-300 hover:border-primary/50 hover:shadow-lg dark:border-purple-900 dark:from-purple-950/40 dark:to-pink-950/40">
          <CardHeader className="text-center">
            <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110 sm:mb-6 sm:text-5xl lg:text-6xl">
              📸
            </div>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">簡単投稿</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              写真をアップロードして、タイトルと説明を入力するだけ
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="group border-blue-200/80 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 transition-all duration-300 hover:border-primary/50 hover:shadow-lg dark:border-blue-900 dark:from-blue-950/40 dark:to-indigo-950/40">
          <CardHeader className="text-center">
            <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110 sm:mb-6 sm:text-5xl lg:text-6xl">
              ⭐
            </div>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">投票機能</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              気に入った作品に投票して、お気に入りをシェア
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="group border-green-200/80 bg-gradient-to-br from-green-50/90 to-emerald-50/90 transition-all duration-300 hover:border-primary/50 hover:shadow-lg dark:border-green-900 dark:from-green-950/40 dark:to-emerald-950/40 sm:col-span-2 lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110 sm:mb-6 sm:text-5xl lg:text-6xl">
              🏆
            </div>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">審査員スコア</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              プロの審査員による評価で公平な審査
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  )
}
