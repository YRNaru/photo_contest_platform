import Image from 'next/image'
import { CustomIcon } from '@/components/ui/custom-icon'

interface ContestBannerProps {
  bannerImage?: string
  title: string
  priority?: boolean
}

export function ContestBanner({ bannerImage, title, priority = false }: ContestBannerProps) {
  if (bannerImage) {
    return (
      <div className="relative h-44 w-full overflow-hidden sm:h-52">
        <div className="absolute inset-0 bg-[#111116]" />
        <Image
          src={bannerImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          unoptimized
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F]/60 via-[#0B0B0F]/10 to-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-[#111116] sm:h-52">
      {/* グリッドパターン（ポートフォリオのhero-bg-glow参照） */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* アクセントグロー */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(205,255,80,0.06),transparent_70%)] group-hover:opacity-150 transition-opacity duration-500" />

      <div className="relative z-10 transition-all duration-500 group-hover:scale-110">
        <span className="text-[#55555F] group-hover:text-[#CDFF50] transition-colors duration-500">
          <CustomIcon name="camera" size={64} />
        </span>
      </div>
    </div>
  )
}
