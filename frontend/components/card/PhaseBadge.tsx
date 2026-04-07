import { getPhaseLabel, getPhaseColor, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface PhaseBadgeProps {
  phase: string
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  return (
    <Badge
      className={cn(
        'border-0 px-2 py-1 text-xs font-bold text-white shadow-sm sm:px-3 sm:py-1.5',
        getPhaseColor(phase)
      )}
    >
      {getPhaseLabel(phase)}
    </Badge>
  )
}
