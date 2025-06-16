'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service like Sentry
    }
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Critical Error
              </h1>
              <p className="text-gray-600">
                A critical error occurred and the application couldn&apos;t recover.
              </p>
              {error.digest && (
                <p className="text-sm text-gray-500">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Button
                onClick={reset}
                className="w-full"
              >
                Reload Application
              </Button>
              <p className="text-xs text-gray-500">
                If this problem persists, please clear your browser cache and cookies.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}