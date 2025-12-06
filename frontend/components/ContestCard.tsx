import Link from "next/link";
import Image from "next/image";
import { formatDate, getPhaseLabel, getPhaseColor } from "@/lib/utils";

interface Contest {
  slug: string;
  title: string;
  description: string;
  banner_image?: string;
  start_at: string;
  end_at: string;
  phase: string;
  entry_count: number;
}

export function ContestCard({ contest }: { contest: Contest }) {
  return (
    <Link href={`/contests/${contest.slug}`}>
      <div className="group bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-purple-500/10 overflow-hidden hover:shadow-2xl dark:hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 transform-gpu border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-600">
        {contest.banner_image ? (
          <div className="relative h-40 sm:h-48 lg:h-56 w-full overflow-hidden">
            <Image
              src={contest.banner_image}
              alt={contest.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="h-40 sm:h-48 lg:h-56 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 dark:from-purple-600 dark:via-pink-600 dark:to-purple-700 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-300 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>
            <span className="text-white text-5xl sm:text-6xl lg:text-7xl relative z-10 group-hover:scale-110 transition-transform duration-300">📸</span>
          </div>
        )}

        <div className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold text-white shadow-md ${getPhaseColor(contest.phase)}`}>
              {getPhaseLabel(contest.phase)}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <span className="text-purple-600 dark:text-purple-400">📸</span>
              {contest.entry_count} 件
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
            {contest.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {contest.description}
          </p>

          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span className="text-green-600 dark:text-green-400">🟢</span>
              <span className="font-semibold">開始:</span>
              <span className="truncate">{formatDate(contest.start_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span className="text-red-600 dark:text-red-400">🔴</span>
              <span className="font-semibold">終了:</span>
              <span className="truncate">{formatDate(contest.end_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

