/**
 * Enhanced logger utility with better error handling and production support
 * Replaces console.log throughout the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  source?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isDebugEnabled = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true'
  private logQueue: LogEntry[] = []
  private maxQueueSize = 100

  private log(level: LogLevel, message: string, context?: LogContext, source?: string) {
    // Skip debug logs in production unless explicitly enabled
    if (!this.isDevelopment && level === 'debug' && !this.isDebugEnabled) {
      return
    }

    const timestamp = new Date().toISOString()
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      context: this.sanitizeContext(context),
      source
    }

    // Development logging with color coding
    if (this.isDevelopment) {
      const color = this.getConsoleColor(level)
      const prefix = `[${timestamp}] ${level.toUpperCase()}${source ? ` [${source}]` : ''}:`
      
      if (typeof window !== 'undefined') {
        // Browser environment
        console.log(
          `%c${prefix}`,
          `color: ${color}; font-weight: bold;`,
          message,
          context || ''
        )
      } else {
        // Node.js environment
        const colorCode = this.getAnsiColor(level)
        console.log(`${colorCode}${prefix}\x1b[0m`, message, context || '')
      }
    }

    // Production logging
    if (!this.isDevelopment && level !== 'debug') {
      this.queueLog(logEntry)
      
      // Log errors to console even in production for debugging
      if (level === 'error') {
        console.error(`[${timestamp}] ERROR:`, message, context || '')
      }
    }
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined

    try {
      // Remove sensitive information
      const sanitized = JSON.parse(JSON.stringify(context, (key, value) => {
        if (typeof key === 'string') {
          const lowerKey = key.toLowerCase()
          if (
            lowerKey.includes('password') ||
            lowerKey.includes('token') ||
            lowerKey.includes('secret') ||
            lowerKey.includes('api_key') ||
            lowerKey.includes('apikey') ||
            lowerKey.includes('auth')
          ) {
            return '[REDACTED]'
          }
        }
        
        // Limit string length to prevent huge logs
        if (typeof value === 'string' && value.length > 1000) {
          return value.substring(0, 1000) + '... [truncated]'
        }
        
        return value
      }))
      
      return sanitized
    } catch (error) {
      return { error: 'Failed to sanitize context' }
    }
  }

  private getConsoleColor(level: LogLevel): string {
    switch (level) {
      case 'debug': return '#06b6d4' // Cyan
      case 'info': return '#10b981'  // Green
      case 'warn': return '#f59e0b'  // Yellow
      case 'error': return '#ef4444' // Red
    }
  }

  private getAnsiColor(level: LogLevel): string {
    switch (level) {
      case 'debug': return '\x1b[36m' // Cyan
      case 'info': return '\x1b[32m'  // Green
      case 'warn': return '\x1b[33m'  // Yellow
      case 'error': return '\x1b[31m' // Red
    }
  }

  private queueLog(logEntry: LogEntry) {
    // Add to queue
    this.logQueue.push(logEntry)
    
    // Maintain queue size
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue.shift()
    }
    
    // In a real application, you would batch send these to a logging service
    this.sendToLoggingService([logEntry])
  }

  private async sendToLoggingService(logs: LogEntry[]) {
    // TODO: Implement actual logging service integration
    // Examples:
    // - Sentry for error tracking
    // - LogRocket for session replay
    // - Datadog/New Relic for APM
    // - Custom backend endpoint
    
    // For now, store critical errors in sessionStorage for debugging
    if (typeof window !== 'undefined') {
      const criticalLogs = logs.filter(log => log.level === 'error' || log.level === 'warn')
      if (criticalLogs.length > 0) {
        try {
          const stored = sessionStorage.getItem('app_logs') || '[]'
          const existing = JSON.parse(stored)
          const updated = [...existing, ...criticalLogs].slice(-50) // Keep last 50
          sessionStorage.setItem('app_logs', JSON.stringify(updated))
        } catch {
          // Ignore storage errors
        }
      }
    }
  }

  // Public methods
  debug(message: string, context?: LogContext, source?: string) {
    this.log('debug', message, context, source)
  }

  info(message: string, context?: LogContext, source?: string) {
    this.log('info', message, context, source)
  }

  warn(message: string, context?: LogContext, source?: string) {
    this.log('warn', message, context, source)
  }

  error(message: string, error?: Error | unknown, context?: LogContext, source?: string) {
    const errorContext: LogContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        name: error.name,
      } : error,
    }
    this.log('error', message, errorContext, source)
  }

  // Performance monitoring
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label)
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }

  // Grouping for better organization
  group(label: string) {
    if (this.isDevelopment && typeof console.group === 'function') {
      console.group(label)
    }
  }

  groupEnd() {
    if (this.isDevelopment && typeof console.groupEnd === 'function') {
      console.groupEnd()
    }
  }

  // Get queued logs (useful for error reporting)
  getQueuedLogs(): LogEntry[] {
    return [...this.logQueue]
  }

  // Clear queued logs
  clearQueue() {
    this.logQueue = []
  }
}

// Export singleton instance
export const logger = new Logger()

// Helper functions for common use cases
export function logApiError(
  endpoint: string,
  error: unknown,
  context?: LogContext
) {
  logger.error(`API Error: ${endpoint}`, error, context, 'API')
}

export function logDatabaseError(
  operation: string,
  error: unknown,
  context?: LogContext
) {
  logger.error(`Database Error: ${operation}`, error, context, 'Database')
}

export function logAuthError(
  operation: string,
  error: unknown,
  context?: LogContext
) {
  logger.error(`Auth Error: ${operation}`, error, context, 'Auth')
}

// Business event logging
export function logBusiness(
  message: string,
  context: string,
  data?: LogContext
) {
  logger.info(message, data, context)
}

// Generic error logging
export function logError(
  error: Error | unknown,
  context: string,
  data?: LogContext
) {
  logger.error(`Error in ${context}`, error, data, context)
}

// Export for testing
export { Logger }