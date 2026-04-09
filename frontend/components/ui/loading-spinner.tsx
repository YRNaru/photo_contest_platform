import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

const loadingSpinnerVariants = cva(
  'inline-block animate-spin rounded-full',
  {
    variants: {
      color: {
        primary: 'border-purple-600',
        white: 'border-white',
        cyan: 'border-cyan-400',
        pink: 'border-pink-500',
      },
      size: {
        sm: 'h-4 w-4 border-t-2 border-b-2',
        md: 'h-8 w-8 border-t-2 border-b-2',
        lg: 'h-16 w-16 border-t-4 border-b-4',
      },
    },
    defaultVariants: {
      color: 'primary',
      size: 'md',
    },
  }
)

export interface LoadingSpinnerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof loadingSpinnerVariants> {}

export function LoadingSpinner({
  className,
  color,
  size,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(loadingSpinnerVariants({ color, size }), className)}
      {...props}
    />
  )
}
