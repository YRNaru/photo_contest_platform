import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="block min-w-0 max-w-full truncate group">
      <span className="font-display hidden text-base font-black uppercase tracking-[0.1em] text-foreground transition-colors duration-300 group-hover:text-primary sm:text-lg md:inline">
        VRC Contest
      </span>
      <span className="font-display text-base font-black uppercase tracking-[0.1em] text-foreground transition-colors duration-300 group-hover:text-primary md:hidden">
        VRC.
      </span>
    </Link>
  )
}
