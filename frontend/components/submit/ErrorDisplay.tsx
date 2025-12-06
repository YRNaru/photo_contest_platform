interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="p-5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-2 border-red-300 dark:border-red-700 rounded-xl">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <pre className="whitespace-pre-wrap text-sm font-semibold text-red-700 dark:text-red-300 flex-1">{error}</pre>
      </div>
    </div>
  );
}

