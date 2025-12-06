import { getPhaseLabel, getPhaseColor } from "@/lib/utils";

interface PhaseBadgeProps {
  phase: string;
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  return (
    <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold text-white shadow-md ${getPhaseColor(phase)}`}>
      {getPhaseLabel(phase)}
    </span>
  );
}

