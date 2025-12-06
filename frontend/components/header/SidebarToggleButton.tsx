interface SidebarToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  variant: "left" | "right";
}

export function SidebarToggleButton({ isOpen, onClick, variant }: SidebarToggleButtonProps) {
  const isLeft = variant === "left";
  const colors = isLeft
    ? "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:glow-purple"
    : "from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 hover:glow-pink";

  const title = isLeft
    ? isOpen ? "メニューを閉じる" : "メニューを開く"
    : isOpen ? "サイドパネルを閉じる" : "サイドパネルを開く";

  const label = isLeft
    ? isOpen ? "閉じる" : "メニュー"
    : isOpen ? "閉じる" : "パネル";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r ${colors} text-white font-semibold transition-all hover:scale-110 hover:shadow-xl transform-gpu duration-300`}
      title={title}
    >
      {isLeft && (
        <svg
          className={`w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      )}
      <span className="text-xs sm:text-sm hidden md:inline">
        {label}
      </span>
      {!isLeft && (
        <svg
          className={`w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2m4-12h2a2 2 0 012 2v10a2 2 0 01-2 2h-2m-4-12v12m0 0l3-3m-3 3l-3-3" />
          )}
        </svg>
      )}
    </button>
  );
}

