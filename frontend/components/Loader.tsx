import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Loader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50 animate-fadeInUp">
      <div className="flex space-x-2 text-4xl font-bold text-primary">
        <span>Y</span>
        <span>M</span>
        <span>T</span>
        <span>.</span>
      </div>
      <div className="absolute bottom-4 w-1/2 h-2 bg-primary/20 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-primary animate-pulse-slow"></div>
      </div>
    </div>
  );
}
