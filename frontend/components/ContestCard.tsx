import Link from "next/link";
import { ContestBanner } from "./card/ContestBanner";
import { PhaseBadge } from "./card/PhaseBadge";
import { ContestDates } from "./card/ContestDates";

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

interface ContestCardProps {
  contest: Contest;
  priority?: boolean;
}

export function ContestCard({ contest, priority = false }: ContestCardProps) {
  return (
    <Link href={`/contests/${contest.slug}`}>
      <div className="group bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-purple-500/10 overflow-hidden hover:shadow-2xl dark:hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 transform-gpu border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-600">
        <ContestBanner 
          bannerImage={contest.banner_image}
          title={contest.title}
          priority={priority}
        />

        <div className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <PhaseBadge phase={contest.phase} />
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

          <ContestDates startAt={contest.start_at} endAt={contest.end_at} />
        </div>
      </div>
    </Link>
  );
}

