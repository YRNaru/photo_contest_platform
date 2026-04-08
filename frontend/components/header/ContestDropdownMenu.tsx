'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ContestDropdownMenuProps {
  isAuthenticated: boolean
}

export function ContestDropdownMenu({ isAuthenticated }: ContestDropdownMenuProps) {
  const router = useRouter()

  return (
    <div className="relative hidden shrink-0 md:block">
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
          コンテスト
          <ChevronDown className="size-4 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem onClick={() => router.push('/contests')}>すべてのコンテスト</DropdownMenuItem>
          {isAuthenticated && (
            <>
              <DropdownMenuItem onClick={() => router.push('/my-contests')}>マイコンテスト</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/judging-contests')}>
                審査中のコンテスト
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push('/contests/create')}
                className="text-primary font-medium"
              >
                + 新しいコンテストを作成
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
