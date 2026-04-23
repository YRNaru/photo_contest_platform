'use client'

/** マーキーストリップ — ポートフォリオのmarquee-sectionから移植 */
export function MarqueeStrip() {
  const items = [
    'Photo Contest',
    'VRChat',
    'Community',
    'Photography',
    'Metaverse',
    'Art Direction',
    'Digital Art',
    'Virtual World',
  ]

  return (
    <div className="relative overflow-hidden py-4 border-y border-white/6 my-0" aria-hidden>
      {/* アクセントラインアニメーション */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CDFF50]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CDFF50]/30 to-transparent" />

      <div className="flex w-max animate-marquee">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 px-6 font-display font-bold text-sm sm:text-base uppercase tracking-[0.05em] text-[#55555F] whitespace-nowrap"
          >
            {item}
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#CDFF50] flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  )
}
