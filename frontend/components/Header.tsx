"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useSidebar } from "@/lib/sidebar-context";
import { useTheme } from "@/lib/theme-context";
import { useEffect, useState } from "react";
import { LoginButton } from "./LoginButton";
import { UserMenu } from "./UserMenu";

export function Header() {
  const { isAuthenticated, loadUser } = useAuth();
  const { isLeftOpen, isRightOpen, toggleLeft, toggleRight } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [isContestMenuOpen, setIsContestMenuOpen] = useState(false);
  const [isSubmitMenuOpen, setIsSubmitMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <header className="bg-white/95 dark:bg-black backdrop-blur-xl border-b-2 border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center animate-fadeInUp">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* 左サイドバートグル */}
          <button
            onClick={toggleLeft}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold transition-all hover:scale-110 hover:shadow-xl hover:glow-purple transform-gpu duration-300"
            title={isLeftOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <svg
              className={`w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-300 ${isLeftOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isLeftOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span className="text-xs sm:text-sm hidden md:inline">
              {isLeftOpen ? "閉じる" : "メニュー"}
            </span>
          </button>

          <Link href="/" className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 animate-gradient bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
            <span className="hidden sm:inline">VRChat Photo Contest</span>
            <span className="sm:hidden">VRC Photo</span>
          </Link>
        </div>

        <nav className="flex items-center gap-3 sm:gap-4 md:gap-6">
          {/* コンテストドロップダウン（デスクトップのみ） */}
          <div className="relative hidden md:block">
            <button 
              onClick={() => setIsContestMenuOpen(!isContestMenuOpen)}
              className="hover:text-primary dark:text-white dark:hover:text-purple-400 transition flex items-center gap-1 font-semibold text-sm lg:text-base"
            >
              コンテスト
              <svg 
                className={`w-4 h-4 transition-transform ${isContestMenuOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isContestMenuOpen && (
              <>
                {/* 背景クリックで閉じる */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsContestMenuOpen(false)}
                />
                
                <div className="absolute top-full left-0 mt-2 w-48 glass dark:bg-gray-950 rounded-xl shadow-2xl border border-white/20 dark:border-gray-700 py-2 z-20 animate-fadeInUp">
                  <Link 
                    href="/contests" 
                    className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/50 dark:text-gray-100 transition rounded-lg mx-2"
                    onClick={() => setIsContestMenuOpen(false)}
                  >
                    すべてのコンテスト
                  </Link>
                  {isAuthenticated && (
                    <>
                      <Link 
                        href="/my-contests" 
                        className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/50 dark:text-gray-100 transition rounded-lg mx-2"
                        onClick={() => setIsContestMenuOpen(false)}
                      >
                        マイコンテスト
                      </Link>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <Link 
                        href="/contests/create" 
                        className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition rounded-lg mx-2 text-purple-600 dark:text-purple-300 font-semibold"
                        onClick={() => setIsContestMenuOpen(false)}
                      >
                        + 新しいコンテストを作成
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 投稿ドロップダウン（デスクトップのみ） */}
          {isAuthenticated && (
            <div className="relative hidden md:block">
              <button 
                onClick={() => setIsSubmitMenuOpen(!isSubmitMenuOpen)}
                className="hover:text-primary dark:text-white dark:hover:text-purple-400 transition flex items-center gap-1 font-semibold text-sm lg:text-base"
              >
                投稿
                <svg 
                  className={`w-4 h-4 transition-transform ${isSubmitMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isSubmitMenuOpen && (
                <>
                  {/* 背景クリックで閉じる */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsSubmitMenuOpen(false)}
                  />
                  
                  <div className="absolute top-full left-0 mt-2 w-48 glass dark:bg-gray-950 rounded-xl shadow-2xl border border-white/20 dark:border-gray-700 py-2 z-20 animate-fadeInUp">
                    <Link 
                      href="/submit" 
                      className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/50 dark:text-gray-100 transition rounded-lg mx-2"
                      onClick={() => setIsSubmitMenuOpen(false)}
                    >
                      📸 写真を投稿
                    </Link>
                    <Link 
                      href="/my-entries" 
                      className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/50 dark:text-gray-100 transition rounded-lg mx-2"
                      onClick={() => setIsSubmitMenuOpen(false)}
                    >
                      📷 マイ投稿
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ダークモードトグル */}
          <button
            onClick={toggleTheme}
            className="group relative p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 dark:from-indigo-500 dark:to-purple-600 hover:shadow-xl transition-all duration-300 hover:scale-110 transform-gpu"
            title={theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
          >
            {theme === "light" ? (
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          <div className="hidden md:block">
            {isAuthenticated ? <UserMenu /> : <LoginButton />}
          </div>

          {/* 右サイドバートグル */}
          <button
            onClick={toggleRight}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold transition-all hover:scale-110 hover:shadow-xl hover:glow-pink transform-gpu duration-300"
            title={isRightOpen ? "サイドパネルを閉じる" : "サイドパネルを開く"}
          >
            <span className="text-xs sm:text-sm hidden md:inline">
              {isRightOpen ? "閉じる" : "パネル"}
            </span>
            <svg
              className={`w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-300 ${isRightOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isRightOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2m4-12h2a2 2 0 012 2v10a2 2 0 01-2 2h-2m-4-12v12m0 0l3-3m-3 3l-3-3" />
              )}
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}

