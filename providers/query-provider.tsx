'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { logger } from '@/lib/logger'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time of 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache time of 10 minutes (formerly cacheTime, now gcTime)
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times with exponential backoff
            retry: (failureCount, error) => {
              if (failureCount >= 3) return false
              
              // Don't retry on 4xx errors (client errors)
              if (error instanceof Error) {
                const message = error.message.toLowerCase()
                if (message.includes('unauthorized') || 
                    message.includes('forbidden') ||
                    message.includes('not found')) {
                  return false
                }
              }
              
              // Exponential backoff
              logger.debug(`Retrying query, attempt ${failureCount + 1}`)
              
              return true
            },
            retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
            // Refetch on window focus in production
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Network error handling
            networkMode: 'online',
          },
          mutations: {
            // Retry mutations once
            retry: 1,
            retryDelay: 1000,
            // Log mutation errors
            onError: (error) => {
              logger.error('Mutation error', error)
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}