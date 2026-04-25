'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeroTitleProps {
  className?: string
}

export function HeroTitle({ className }: HeroTitleProps) {
  const word1 = 'VRChat'
  const word2 = 'Contest'

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const charVariants = {
    hidden: { x: '-110%', opacity: 0 },
    visible: {
      x: '0%',
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 150,
      },
    },
  }

  return (
    <motion.h1
      className={cn(
        'w-full min-w-0 max-w-full',
        'font-display font-black uppercase leading-none tracking-[-0.03em]',
        // vw はビューポート基準のため、サイドバー付きの main 内では本列より巨大になり右で切れる。
        // コンテナ相対 cqi + 小さい vw 上限で1行が列幅に収まるようにする
        'text-[clamp(2rem,min(3.2vw_+_1.25rem,16cqi),6.5rem)]',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 行左からの出現用マスク（最終的な行幅は列幅内に収まる想定） */}
      <div className="flex w-full min-w-0 overflow-x-clip text-zinc-900 dark:text-[#F0EDE8]">
        {word1.split('').map((char, i) => (
          <motion.span key={`w1-${i}`} variants={charVariants} className="inline-block will-change-transform">
            {char}
          </motion.span>
        ))}
      </div>
      {/* ライト: 塗り文字 / ダーク: アウトライン演出 */}
      <div className="flex w-full min-w-0 overflow-x-clip text-zinc-800 dark:text-transparent dark:[-webkit-text-stroke:1.5px_#F0EDE8]">
        {word2.split('').map((char, i) => (
          <motion.span key={`w2-${i}`} variants={charVariants} className="inline-block will-change-transform">
            {char}
          </motion.span>
        ))}
      </div>
    </motion.h1>
  )
}
