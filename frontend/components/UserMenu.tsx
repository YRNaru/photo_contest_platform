"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <span className="font-medium">{user.username}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <FaUser />
            <span>プロフィール</span>
          </Link>
          
          {user.is_moderator && (
            <Link
              href="/admin/moderation"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <FaCog />
              <span>モデレーション</span>
            </Link>
          )}

          <hr className="my-2" />

          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
          >
            <FaSignOutAlt />
            <span>ログアウト</span>
          </button>
        </div>
      )}
    </div>
  );
}

