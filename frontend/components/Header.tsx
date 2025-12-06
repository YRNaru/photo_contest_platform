"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { LoginButton } from "./LoginButton";
import { UserMenu } from "./UserMenu";

export function Header() {
  const { isAuthenticated, loadUser } = useAuth();
  const [isContestMenuOpen, setIsContestMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          VRChat Photo Contest
        </Link>

        <nav className="flex items-center gap-6">
          {/* コンテストドロップダウン */}
          <div className="relative">
            <button 
              onClick={() => setIsContestMenuOpen(!isContestMenuOpen)}
              className="hover:text-primary transition flex items-center gap-1"
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
                
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-20">
                  <Link 
                    href="/contests" 
                    className="block px-4 py-2 hover:bg-gray-100 transition"
                    onClick={() => setIsContestMenuOpen(false)}
                  >
                    すべてのコンテスト
                  </Link>
                  {isAuthenticated && (
                    <>
                      <Link 
                        href="/my-contests" 
                        className="block px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setIsContestMenuOpen(false)}
                      >
                        マイコンテスト
                      </Link>
                      <hr className="my-2" />
                      <Link 
                        href="/contests/create" 
                        className="block px-4 py-2 hover:bg-gray-100 transition text-blue-600 font-semibold"
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

          {isAuthenticated && (
            <Link href="/submit" className="hover:text-primary transition">
              投稿
            </Link>
          )}

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <LoginButton />
          )}
        </nav>
      </div>
    </header>
  );
}

