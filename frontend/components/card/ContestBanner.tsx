import Image from 'next/image'

interface ContestBannerProps {
  bannerImage?: string
  title: string
  priority?: boolean
}

export function ContestBanner({ bannerImage, title, priority = false }: ContestBannerProps) {
  if (bannerImage) {
    return (
      <div className="relative h-40 w-full overflow-hidden sm:h-48 lg:h-56">
        <div className="absolute inset-0 bg-slate-900" />
        <Image
          src={bannerImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:opacity-90"
          unoptimized
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />
      </div>
    )
  }

  return (
    <div className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-slate-950 sm:h-48 lg:h-56">
      {/* Cyberpunk grid fallback */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/30 via-transparent to-purple-600/30 dark:from-cyan-900/40 dark:to-purple-900/40" />
      
      {/* Glowing orbs */}
      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-2xl transition-all duration-700 group-hover:scale-[2] group-hover:bg-purple-500/30" />
      
      <span className="relative z-10 text-5xl transition-transform duration-500 group-hover:scale-125 sm:text-6xl lg:text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
        📸
      </span>
    </div>
  )
}
