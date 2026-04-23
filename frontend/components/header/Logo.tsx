import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="block min-w-0 max-w-full truncate group">
      <span className="font-display font-black text-base sm:text-lg uppercase tracking-[0.1em] text-[#F0EDE8] group-hover:text-[#CDFF50] transition-colors duration-300 hidden md:inline">
        VRC Contest
      </span>
      <span className="font-display font-black text-base uppercase tracking-[0.1em] text-[#F0EDE8] group-hover:text-[#CDFF50] transition-colors duration-300 md:hidden">
        VRC.
      </span>
    </Link>
  )
}
