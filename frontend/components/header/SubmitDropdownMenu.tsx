"use client";

import Link from "next/link";
import { useState } from "react";

export function SubmitDropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative hidden md:block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-primary dark:text-white dark:hover:text-purple-400 transition flex items-center gap-1 font-semibold text-sm lg:text-base"
      >
        投稿
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* 背景クリックで閉じる */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 mt-2 w-48 glass dark:bg-gray-950 rounded-xl shadow-2xl border border-white/20 dark:border-gray-700 py-2 z-20 animate-fadeInUp">
            <Link
              href="/submit"
              className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/50 dark:text-gray-100 transition rounded-lg mx-2"
              onClick={() => setIsOpen(false)}
            >
              📸 写真を投稿
            </Link>
            <Link
              href="/my-entries"
              className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/50 dark:text-gray-100 transition rounded-lg mx-2"
              onClick={() => setIsOpen(false)}
            >
              📷 マイ投稿
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

