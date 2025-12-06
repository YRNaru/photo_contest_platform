"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useSidebar } from "@/lib/sidebar-context";

export function LeftSidebar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { isLeftOpen } = useSidebar();

  const menuItems = [
    { href: "/", label: "ホーム", icon: "🏠" },
    { href: "/contests", label: "コンテスト", icon: "🏆" },
    ...(isAuthenticated
      ? [
          { href: "/my-contests", label: "マイコンテスト", icon: "📋" },
          { href: "/submit", label: "写真を投稿", icon: "📸" },
          { href: "/my-entries", label: "マイ投稿", icon: "📷" },
          { href: "/profile", label: "プロフィール", icon: "👤" },
        ]
      : []),
  ];

  return (
    <aside
      className={`bg-gray-50 dark:bg-black border-r-2 border-gray-200 dark:border-gray-800 min-h-[calc(100vh-4rem)] sticky top-16 overflow-hidden transition-all duration-700 ease-in-out shadow-sm z-40 ${
        isLeftOpen ? "w-80 opacity-100" : "w-0 opacity-0"
      }`}
    >
      <nav
        className={`p-5 space-y-2 transition-all duration-700 delay-150 ${
          isLeftOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <div className="mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
          <h2 className="text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent uppercase tracking-wider px-3 animate-pulse-slow">
            ✨ メニュー
          </h2>
        </div>
        
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu animate-fadeInLeft ${
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white font-bold shadow-xl glow-purple"
                  : "hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 text-gray-700 dark:text-gray-100 hover:text-purple-700 dark:hover:text-white"
              }`}
            >
              <span className={`text-2xl transition-transform duration-300 ${isActive ? 'animate-float' : 'group-hover:scale-125'}`}>
                {item.icon}
              </span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}

        {isAuthenticated && (
          <>
            <div className="my-6 border-t-2 border-gray-200 dark:border-gray-700" />
            
            <div className="space-y-3 animate-fadeInUp">
              <Link
                href="/contests/create"
                className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 dark:from-purple-500 dark:via-purple-400 dark:to-pink-500 animate-gradient text-white hover:shadow-2xl transition-all duration-300 hover:scale-110 font-bold transform-gpu glow-purple"
              >
                <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">➕</span>
                <span>新規コンテスト作成</span>
              </Link>
              
              <Link
                href="/submit"
                className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 dark:from-pink-500 dark:via-pink-400 dark:to-purple-500 animate-gradient text-white hover:shadow-2xl transition-all duration-300 hover:scale-110 font-bold transform-gpu glow-pink"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">📸</span>
                <span>コンテストに投稿する</span>
              </Link>
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
