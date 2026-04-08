import type { Metadata, Viewport } from 'next'
import { Inter, Geist } from 'next/font/google'
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

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VRChat フォトコンテスト',
  description: 'VRChatのフォトコンテストプラットフォーム',
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
  return (
    <html lang="ja" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
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
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground transition-colors duration-300`}
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
                    <div className="page-cq min-h-0 w-full min-w-0 max-w-full">{children}</div>
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
