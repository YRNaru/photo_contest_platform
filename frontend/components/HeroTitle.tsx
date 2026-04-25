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
        'font-display font-black uppercase leading-none tracking-[-0.03em]',
        'text-[clamp(3.5rem,12vw,11rem)]',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex overflow-hidden text-zinc-900 dark:text-[#F0EDE8]">
        {word1.split('').map((char, i) => (
          <motion.span key={`w1-${i}`} variants={charVariants} className="inline-block">
            {char}
          </motion.span>
        ))}
      </div>
      {/* ライト: 塗り文字（コントラスト確保） / ダーク: アウトライン演出 */}
      <div className="flex overflow-hidden text-zinc-800 dark:text-transparent dark:[-webkit-text-stroke:1.5px_#F0EDE8]">
        {word2.split('').map((char, i) => (
          <motion.span key={`w2-${i}`} variants={charVariants} className="inline-block">
            {char}
          </motion.span>
        ))}
      </div>
    </motion.h1>
  )
}
