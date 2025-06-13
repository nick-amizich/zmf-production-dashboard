import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { ZMFThemeProvider } from '@/lib/themes/theme-context'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'ZMF Production System',
  description: 'Premium Headphone Manufacturing Control',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ZMFThemeProvider defaultTheme="zmf">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster position="top-right" richColors />
            </QueryProvider>
          </ThemeProvider>
        </ZMFThemeProvider>
      </body>
    </html>
  )
}
