import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ScrollProgress() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
      setScroll(scrolled);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={cn('fixed top-0 left-0 h-1 bg-primary/60 z-40 w-full')}
         style={{ width: `${scroll}%` }}
    />
  );
}
