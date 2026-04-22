'use client'

import { useAuth } from '@/lib/auth'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FaUser, FaSignOutAlt, FaCog, FaImage } from 'react-icons/fa'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
        {user.avatar_url ? (
          <div className="relative size-9 shrink-0 overflow-hidden rounded-full">
            <Image
              src={user.avatar_url}
              alt={user.username}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <span className="max-w-[8rem] truncate">{user.username}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        positionMethod="fixed"
        collisionAvoidance={{
          side: "flip",
          align: "none",
          fallbackAxisSide: "none",
        }}
        className="w-52"
      >
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <FaUser className="size-3.5" />
          プロフィール
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/my-entries')}>
          <FaImage className="size-3.5" />
          マイ投稿
        </DropdownMenuItem>
        {user.is_moderator && (
          <DropdownMenuItem onClick={() => router.push('/admin/moderation')}>
            <FaCog className="size-3.5" />
            モデレーション
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            logout()
          }}
        >
          <FaSignOutAlt className="size-3.5" />
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
