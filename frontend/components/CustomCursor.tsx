import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [label, setLabel] = useState('');

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const updateLabel = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorLabel = target.getAttribute('data-cursor');
      setLabel(cursorLabel || '');
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', updateLabel);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', updateLabel);
    };
  }, []);

  return (
    <div
      className={cn(
        'fixed pointer-events-none z-50 transition-opacity duration-200',
        label ? 'opacity-100' : 'opacity-0'
      )}
      style={{ left: position.x + 12, top: position.y + 12 }}
    >
      <div className="w-4 h-4 bg-primary rounded-full mix-blend-multiply" />
      {label && (
        <span className="ml-2 text-sm text-primary bg-background/80 px-2 py-1 rounded">
          {label}
        </span>
      )}
    </div>
  );
}
