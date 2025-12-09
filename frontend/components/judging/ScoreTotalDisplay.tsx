'use client';

interface ScoreTotalDisplayProps {
  currentTotal: number;
  maxTotal: number;
}

export function ScoreTotalDisplay({ currentTotal, maxTotal }: ScoreTotalDisplayProps) {
  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            現在の合計点
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            最大 {maxTotal} 点
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
            {currentTotal}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            点
          </div>
        </div>
      </div>
    </div>
  );
}

