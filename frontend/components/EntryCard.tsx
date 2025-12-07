import Link from "next/link";
import Image from "next/image";
import { FaHeart, FaEye } from "react-icons/fa";

interface Entry {
  id: string;
  title: string;
  author: {
    username: string;
  } | null;
  vote_count: number;
  view_count: number;
  thumbnail?: string;
}

export function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link href={`/entries/${entry.id}`}>
      <div className="group bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-purple-500/10 overflow-hidden hover:shadow-2xl dark:hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 transform-gpu border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-600">
        <div className="relative h-48 sm:h-56 lg:h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
          {entry.thumbnail ? (
            <Image
              src={entry.thumbnail}
              alt={entry.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl opacity-50 group-hover:scale-110 transition-transform duration-500">📷</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-3 sm:p-4 lg:p-5">
          <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {entry.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 flex items-center gap-1">
            <span className="text-purple-600 dark:text-purple-400">👤</span>
            by <span className="font-semibold truncate">{entry.author?.username || "匿名ユーザー"}</span>
          </p>

          <div className="flex items-center gap-4 sm:gap-5 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300">
              <FaHeart className="text-red-500 dark:text-red-400 group-hover:scale-125 transition-transform" />
              <span className="font-semibold">{entry.vote_count}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300">
              <FaEye className="text-blue-500 dark:text-blue-400 group-hover:scale-125 transition-transform" />
              <span className="font-semibold">{entry.view_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

