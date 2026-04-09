import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

const glowBlobVariants = cva(
  'absolute rounded-full blur-3xl animate-pulse-slow pointer-events-none',
  {
    variants: {
      color: {
        purple: 'bg-purple-500 dark:bg-purple-600',
        pink: 'bg-pink-500 dark:bg-pink-600',
        cyan: 'bg-cyan-500 dark:bg-cyan-600',
        blue: 'bg-blue-500 dark:bg-blue-600',
      },
    },
    defaultVariants: {
      color: 'purple',
    },
  }
)

export interface GlowBlobProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof glowBlobVariants> {}

export function GlowBlob({ className, color, ...props }: GlowBlobProps) {
  return (
    <div
      className={cn(glowBlobVariants({ color }), className)}
      {...props}
    />
  )
}
