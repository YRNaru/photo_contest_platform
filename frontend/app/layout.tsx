import type { Metadata, Viewport } from 'next'
import { Syne, Plus_Jakarta_Sans } from 'next/font/google'
import { preconnect, prefetchDNS } from 'react-dom'
import './globals.css'
import { Providers } from './providers'
import { SidebarProvider } from '@/lib/sidebar-context'
import { ThemeProvider } from '@/lib/theme-context'
import { Header } from '@/components/Header'
import { LeftSidebar } from '@/components/LeftSidebar'
import { RightSidebar } from '@/components/RightSidebar'
import { Footer } from '@/components/Footer'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

// ポートフォリオと同じフォント構成
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'VRChat フォトコンテスト',
  description: 'VRChatのフォトコンテストプラットフォーム — メタバースの奇跡の瞬間をシェアしよう',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  preconnect('https://api.vrchat-photocontest-platform.site', { crossOrigin: 'anonymous' });
  prefetchDNS('https://api.vrchat-photocontest-platform.site');

  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={cn('dark', syne.variable, plusJakartaSans.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className="font-body min-h-screen bg-background text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
        <Providers>
          <ThemeProvider>
            <SidebarProvider>
              <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <div className="flex flex-1 bg-background transition-colors duration-300">
                  <LeftSidebar />
                  <main className="flex-1 min-w-0 w-full max-w-full overflow-x-clip bg-background">
                    <div className="page-cq min-h-[100dvh] w-full min-w-0 max-w-full">{children}</div>
                  </main>
                  <RightSidebar />
                </div>
                <Footer />
              </div>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
