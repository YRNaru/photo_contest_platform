import Image from "next/image";

interface ContestBannerProps {
  bannerImage?: string;
  title: string;
  priority?: boolean;
}

export function ContestBanner({ bannerImage, title, priority = false }: ContestBannerProps) {
  if (bannerImage) {
    return (
      <div className="relative h-40 sm:h-48 lg:h-56 w-full overflow-hidden">
        <Image
          src={bannerImage}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          unoptimized
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className="h-40 sm:h-48 lg:h-56 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 dark:from-purple-600 dark:via-pink-600 dark:to-purple-700 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-300 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
      <span className="text-white text-5xl sm:text-6xl lg:text-7xl relative z-10 group-hover:scale-110 transition-transform duration-300">📸</span>
    </div>
  );
}

