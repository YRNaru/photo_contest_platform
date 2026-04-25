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
    <div className="relative my-0 overflow-hidden border-y border-zinc-200/80 py-4 dark:border-white/6" aria-hidden>
      {/* アクセントラインアニメーション */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-500/40 to-transparent dark:via-[#CDFF50]/30" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-500/40 to-transparent dark:via-[#CDFF50]/30" />

      <div className="flex w-max animate-marquee">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 whitespace-nowrap px-6 font-display text-sm font-bold uppercase tracking-[0.05em] text-zinc-600 sm:text-base dark:text-[#55555F]"
          >
            {item}
            <span className="inline-block size-1.5 flex-shrink-0 rounded-full bg-lime-500 dark:bg-[#CDFF50]" />
          </span>
        ))}
      </div>
    </div>
  )
}
