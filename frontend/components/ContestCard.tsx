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
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        {contest.banner_image ? (
          <div className="relative h-48 w-full">
            <Image
              src={contest.banner_image}
              alt={contest.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-white text-4xl">📸</span>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded text-xs text-white ${getPhaseColor(contest.phase)}`}>
              {getPhaseLabel(contest.phase)}
            </span>
            <span className="text-sm text-muted-foreground">
              {contest.entry_count} 件の応募
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2">{contest.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {contest.description}
          </p>

          <div className="text-sm text-muted-foreground">
            <div>開始: {formatDate(contest.start_at)}</div>
            <div>終了: {formatDate(contest.end_at)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

