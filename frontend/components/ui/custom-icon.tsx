'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

/** アイコンの種類 */
export type IconType = 'calendar' | 'home' | 'contest' | 'features' | 'my-contests' | 'camera' | 'sort-new' | 'sort-old' | 'sort-hot' | 'sort-trend' | 'notice' | 'support' | 'star' | 'user' | 'shield' | 'chat' | 'rocket' | 'search' | 'plus' | 'edit' | 'warning' | 'key' | 'settings' | 'tag' | 'question' | 'hint' | 'link' | 'rule' | 'logout' | 'judge' | 'vote' | 'trash' | 'overview' | 'mobile' | 'twitter' | 'check' | 'wait' | 'description' | 'entries' | 'stats' | 'discord' | 'github' | 'google'

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
    sm: 24,
    md: 40,
    lg: 56,
    xl: 72,
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
    user: '/icons/user-custom.png',
    shield: '/icons/shield-custom.png',
    chat: '/icons/chat-custom.png',
    rocket: '/icons/rocket-custom.png',
    search: '/icons/search-custom.png',
    plus: '/icons/plus-custom.png',
    edit: '/icons/edit-custom.png',
    warning: '/icons/warning-custom.png',
    key: '/icons/key-custom.png',
    settings: '/icons/settings-custom.png',
    tag: '/icons/tag-custom.png',
    question: '/icons/question-custom.png',
    hint: '/icons/hint-custom.png',
    link: '/icons/link-custom.png',
    rule: '/icons/rule-custom.png',
    logout: '/icons/logout-custom.png',
    judge: '/icons/judge-custom.png',
    vote: '/icons/vote-custom.png',
    trash: '/icons/trash-custom.png',
    overview: '/icons/overview-custom.png',
    mobile: '/icons/mobile-custom.png',
    twitter: '/icons/twitter-custom.png',
    check: '/icons/check-custom.png',
    wait: '/icons/wait-custom.png',
    description: '/icons/description-custom.png',
    entries: '/icons/entries-custom.png',
    stats: '/icons/stats-custom.png',
    discord: '/icons/discord-custom.png',
    github: '/icons/github-custom.png',
    google: '/icons/google-custom.png',
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
        className="object-contain"
      />
    </div>
  )
}
