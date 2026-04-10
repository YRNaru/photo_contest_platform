'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

/** アイコンの種類 */
export type IconType = 'calendar' | 'home' | 'contest' | 'features' | 'my-contests' | 'camera' | 'sort-new' | 'sort-old' | 'sort-hot' | 'sort-trend' | 'notice' | 'support' | 'star'

interface CustomIconProps {
  /** アイコンの種類 */
  name: IconType
  className?: string
  size?: number | 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * ユーザー提供のカスタムアイコンを表示するコンポーネント
 */
export function CustomIcon({ name, className, size = 'md' }: CustomIconProps) {
  const sizeMap = {
    sm: 24, // 20 -> 24
    md: 40, // 32 -> 40
    lg: 56, // 44 -> 56
    xl: 72, // 60 -> 72
  }

  const dimension = typeof size === 'number' ? size : sizeMap[size]

  const iconPathMap: Record<IconType, string> = {
    calendar: '/icons/calendar-custom.png',
    home: '/icons/home-custom.png',
    contest: '/icons/contest-custom.png',
    features: '/icons/features-custom.png',
    'my-contests': '/icons/my-contests-custom.png',
    camera: '/icons/camera-custom.png',
    'sort-new': '/icons/sort-new-custom.png',
    'sort-old': '/icons/sort-old-custom.png',
    'sort-hot': '/icons/sort-hot-custom.png',
    'sort-trend': '/icons/sort-trend-custom.png',
    notice: '/icons/notice-custom.png',
    support: '/icons/support-custom.png',
    star: '/icons/star-custom.png',
  }

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
        className
      )}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src={iconPathMap[name]}
        alt={name}
        width={dimension}
        height={dimension}
        className="object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] dark:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
      />
    </div>
  )
}
