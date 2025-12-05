"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { LoginButton } from "./LoginButton";
import { UserMenu } from "./UserMenu";

export function Header() {
  const { isAuthenticated, loadUser } = useAuth();

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
          <Link href="/contests" className="hover:text-primary transition">
            コンテスト
          </Link>
          <Link href="/submit" className="hover:text-primary transition">
            投稿
          </Link>

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

