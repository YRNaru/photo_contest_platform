import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

const statCardVariants = cva(
  'group relative overflow-hidden p-5 rounded-2xl border backdrop-blur-md transition-all duration-500',
  {
    variants: {
      color: {
        purple: 'bg-white/10 border-purple-500/30 dark:bg-black/40 dark:border-purple-500/20 hover:border-purple-500/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:-translate-y-1',
        yellow: 'bg-white/10 border-yellow-500/30 dark:bg-black/40 dark:border-yellow-500/20 hover:border-yellow-500/60 hover:shadow-[0_0_25px_rgba(234,179,8,0.25)] hover:-translate-y-1',
        blue: 'bg-white/10 border-cyan-500/30 dark:bg-black/40 dark:border-cyan-500/20 hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:-translate-y-1',
        green: 'bg-white/10 border-emerald-500/30 dark:bg-black/40 dark:border-emerald-500/20 hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:-translate-y-1',
      },
    },
    defaultVariants: {
      color: 'purple',
    },
  }
)

const glowVariants = cva(
  'absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl transition-all duration-500',
  {
    variants: {
      color: {
        purple: 'bg-purple-500/20 group-hover:bg-purple-500/30',
        yellow: 'bg-yellow-500/20 group-hover:bg-yellow-500/30',
        blue: 'bg-cyan-500/20 group-hover:bg-cyan-500/30',
        green: 'bg-emerald-500/20 group-hover:bg-emerald-500/30',
      },
    },
    defaultVariants: { color: 'purple' },
  }
)

const titleVariants = cva('relative z-10 text-sm font-semibold tracking-wide mb-1.5 transition-colors duration-300', {
  variants: {
    color: {
      purple: 'text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300',
      yellow: 'text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-300',
      blue: 'text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-300',
      green: 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300',
    },
  },
  defaultVariants: { color: 'purple' },
})

const valueVariants = cva('relative z-10 text-3xl font-black tracking-tight drop-shadow-sm', {
  variants: {
    color: {
      purple: 'text-foreground',
      yellow: 'text-foreground',
      blue: 'text-foreground',
      green: 'text-foreground',
    },
  },
  defaultVariants: { color: 'purple' },
})

export interface StatCardProps extends VariantProps<typeof statCardVariants> {
  title: string
  value: ReactNode
  unit?: string
  className?: string
}

export function StatCard({ title, value, unit, color, className }: StatCardProps) {
  return (
    <div className={cn(statCardVariants({ color }), className)}>
      <div className={glowVariants({ color })} />
      <div className={titleVariants({ color })}>{title}</div>
      <div className={valueVariants({ color })}>
        {value}
        {unit && <span className="text-sm font-bold opacity-70 ml-1.5">{unit}</span>}
      </div>
    </div>
  )
}
