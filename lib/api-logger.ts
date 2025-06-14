import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

export interface LogContext {
  requestId: string
  method: string
  path: string
  timestamp: Date
  userId?: string
}

export class ApiLogger {
  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static logRequest(request: NextRequest, userId?: string): LogContext {
    const context: LogContext = {
      requestId: this.generateRequestId(),
      method: request.method,
      path: request.nextUrl.pathname,
      timestamp: new Date(),
      userId
    }

    logger.info(`API Request: ${context.method} ${context.path}`, {
      requestId: context.requestId,
      userId: context.userId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    return context
  }

  static logResponse(
    context: LogContext, 
    response: NextResponse,
    message: string
  ): void {
    const duration = Date.now() - context.timestamp.getTime()
    const status = response.status

    const logData = {
      requestId: context.requestId,
      method: context.method,
      path: context.path,
      status,
      duration: `${duration}ms`,
      userId: context.userId,
      message
    }

    if (status >= 500) {
      logger.error(`API Response: ${message}`, logData)
    } else if (status >= 400) {
      logger.warn(`API Response: ${message}`, logData)
    } else {
      logger.info(`API Response: ${message}`, logData)
    }
  }

  static logError(
    context: LogContext,
    error: Error,
    additionalData?: Record<string, any>
  ): void {
    const duration = Date.now() - context.timestamp.getTime()

    logger.error(`API Error: ${error.message}`, {
      requestId: context.requestId,
      method: context.method,
      path: context.path,
      duration: `${duration}ms`,
      userId: context.userId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...additionalData
    })
  }
}