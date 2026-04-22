'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function SubmitDropdownMenu() {
  const router = useRouter()

  return (
    <div className="relative hidden shrink-0 md:block">
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-base font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
          投稿
          <ChevronDown className="size-[1.125rem] opacity-70 sm:size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => router.push('/submit')}>写真を投稿</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/my-entries')}>マイ投稿</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
