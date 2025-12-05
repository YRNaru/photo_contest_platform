import Link from "next/link";
import Image from "next/image";
import { FaHeart, FaEye } from "react-icons/fa";

interface Entry {
  id: string;
  title: string;
  author: {
    username: string;
  };
  vote_count: number;
  view_count: number;
  thumbnail?: string;
}

export function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link href={`/entries/${entry.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <div className="relative h-64 w-full bg-gray-100">
          {entry.thumbnail ? (
            <Image
              src={entry.thumbnail}
              alt={entry.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-6xl">📷</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold mb-2 line-clamp-2">{entry.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            by {entry.author.username}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FaHeart className="text-red-500" />
              <span>{entry.vote_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaEye />
              <span>{entry.view_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

