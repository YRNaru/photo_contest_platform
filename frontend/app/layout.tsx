import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SidebarProvider } from "@/lib/sidebar-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Header } from "@/components/Header";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VRChat フォトコンテスト",
  description: "VRChatのフォトコンテストプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white dark:bg-black transition-colors duration-300`} suppressHydrationWarning>
        <Providers>
          <ThemeProvider>
            <SidebarProvider>
              <div className="flex flex-col min-h-screen bg-white dark:bg-black">
                <Header />
                <div className="flex flex-1 bg-white dark:bg-black transition-colors duration-300">
                  <LeftSidebar />
                  <main className="flex-1 min-w-0 bg-white dark:bg-black">
                    {children}
                  </main>
                  <RightSidebar />
                </div>
                <Footer />
              </div>
            </SidebarProvider>
          </ThemeProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

