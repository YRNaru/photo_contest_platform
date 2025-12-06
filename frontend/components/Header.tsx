"use client";

import { useAuth } from "@/lib/auth";
import { useSidebar } from "@/lib/sidebar-context";
import { useTheme } from "@/lib/theme-context";
import { useEffect } from "react";
import { LoginButton } from "./LoginButton";
import { UserMenu } from "./UserMenu";
import { Logo } from "./header/Logo";
import { SidebarToggleButton } from "./header/SidebarToggleButton";
import { ThemeToggleButton } from "./header/ThemeToggleButton";
import { ContestDropdownMenu } from "./header/ContestDropdownMenu";
import { SubmitDropdownMenu } from "./header/SubmitDropdownMenu";

export function Header() {
  const { isAuthenticated, loadUser } = useAuth();
  const { isLeftOpen, isRightOpen, toggleLeft, toggleRight } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <header className="bg-white/95 dark:bg-black backdrop-blur-xl border-b-2 border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center animate-fadeInUp">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarToggleButton isOpen={isLeftOpen} onClick={toggleLeft} variant="left" />
          <Logo />
        </div>

        <nav className="flex items-center gap-3 sm:gap-4 md:gap-6">
          <ContestDropdownMenu isAuthenticated={isAuthenticated} />
          {isAuthenticated && <SubmitDropdownMenu />}
          <ThemeToggleButton theme={theme} onClick={toggleTheme} />
          <div className="hidden md:block">
            {isAuthenticated ? <UserMenu /> : <LoginButton />}
          </div>
          <SidebarToggleButton isOpen={isRightOpen} onClick={toggleRight} variant="right" />
        </nav>
      </div>
    </header>
  );
}

