'use client'

import { ReactNode } from 'react'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface LoadingWrapperProps {
  isLoading: boolean
  error?: Error | null
  isEmpty?: boolean
  skeleton?: ReactNode
  emptyMessage?: string
  emptyIcon?: ReactNode
  onRetry?: () => void
  children: ReactNode
}

export function LoadingWrapper({
  isLoading,
  error,
  isEmpty = false,
  skeleton,
  emptyMessage = 'No data found',
  emptyIcon,
  onRetry,
  children
}: LoadingWrapperProps) {
  // Show skeleton or spinner while loading
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>
    }
    
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message || 'An unexpected error occurred'}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-4 w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
        {emptyIcon || (
          <div className="rounded-full bg-muted p-3 mb-4">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <p className="text-muted-foreground">{emptyMessage}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>
    )
  }

  // Show children when loaded successfully
  return <>{children}</>
}

// Inline loading component for smaller areas
export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  )
}

// Full page loader
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}