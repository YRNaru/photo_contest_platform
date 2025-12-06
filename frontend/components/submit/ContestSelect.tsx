interface Contest {
  slug: string;
  title: string;
}

interface ContestSelectProps {
  value: string;
  onChange: (value: string) => void;
  contests?: Contest[];
}

export function ContestSelect({ value, onChange, contests }: ContestSelectProps) {
  return (
    <div>
      <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-gray-100">
        🏆 コンテスト <span className="text-red-500 dark:text-red-400">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-purple-400 dark:hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
        required
      >
        <option value="">選択してください</option>
        {contests?.map((contest) => (
          <option key={contest.slug} value={contest.slug}>
            {contest.title}
          </option>
        ))}
      </select>
    </div>
  );
}

