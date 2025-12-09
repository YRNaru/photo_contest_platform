import Link from 'next/link'

export function Logo() {
  return (
    <Link
      href="/"
      className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 animate-gradient bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 truncate max-w-[150px] sm:max-w-[200px] md:max-w-none"
    >
      <span className="hidden sm:inline">VRChat Photo Contest</span>
      <span className="sm:hidden">VRC Photo</span>
    </Link>
  )
}
