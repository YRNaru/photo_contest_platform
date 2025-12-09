interface ThemeToggleButtonProps {
  theme: string
  onClick: () => void
}

export function ThemeToggleButton({ theme, onClick }: ThemeToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group relative p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 dark:from-indigo-500 dark:to-purple-600 hover:shadow-xl transition-all duration-300 hover:scale-110 transform-gpu"
      title={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
    >
      {theme === 'light' ? (
        <svg
          className="w-4 sm:w-5 h-4 sm:h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 sm:w-5 h-4 sm:h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  )
}
