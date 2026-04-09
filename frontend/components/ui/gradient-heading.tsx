import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ElementType, HTMLAttributes } from 'react'

const gradientHeadingVariants = cva(
  'font-black bg-clip-text text-transparent',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400',
        cyber: 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400',
        pink: 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 animate-gradient',
      },
      size: {
        default: 'text-3xl sm:text-4xl lg:text-5xl',
        sm: 'text-2xl sm:text-3xl',
        lg: 'text-4xl sm:text-5xl lg:text-6xl',
        hero: 'text-[clamp(2.25rem,6vw,5rem)]',
      },
    },
    defaultVariants: {
      variant: 'cyber',
      size: 'default',
    },
  }
)

export interface GradientHeadingProps 
  extends Omit<HTMLAttributes<HTMLHeadingElement>, 'color'>, 
    VariantProps<typeof gradientHeadingVariants> {
  as?: ElementType
}

export function GradientHeading({
  className,
  variant,
  size,
  as: Component = 'h1',
  ...props
}: GradientHeadingProps) {
  return (
    <Component
      className={cn(gradientHeadingVariants({ variant, size }), className)}
      {...props}
    />
  )
}
