import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger } from '@/lib/logger'
import { 
  isUniqueConstraintError, 
  isForeignKeyError 
} from '@/lib/utils/database'

export type ApiError = {
  error: string
  code?: string
  details?: unknown
  statusCode: number
}

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Standard API error response handler
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  // Log the error
  logger.error('API Error', error)

  // Handle known error types
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        statusCode: error.statusCode
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
        statusCode: 400
      },
      { status: 400 }
    )
  }

  // Handle Supabase/PostgreSQL errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as any

    if (isUniqueConstraintError(dbError)) {
      return NextResponse.json(
        {
          error: 'This record already exists',
          code: 'UNIQUE_CONSTRAINT',
          statusCode: 409
        },
        { status: 409 }
      )
    }

    if (isForeignKeyError(dbError)) {
      return NextResponse.json(
        {
          error: 'Related record not found',
          code: 'FOREIGN_KEY_ERROR',
          statusCode: 400
        },
        { status: 400 }
      )
    }

    // Handle auth errors
    if (dbError.message?.includes('JWT')) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          code: 'AUTH_ERROR',
          statusCode: 401
        },
        { status: 401 }
      )
    }
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Log the error for debugging
  console.error('API Error:', error)
  
  return NextResponse.json(
    {
      error: isDevelopment && error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      details: isDevelopment ? {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        raw: error
      } : undefined,
      statusCode: 500
    },
    { status: 500 }
  )
}

/**
 * Wrap an API handler with error handling
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse<R | ApiError>> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Common API errors
 */
export const ApiErrors = {
  // Auth errors
  Unauthorized: () => new AppError('Unauthorized', 401, 'UNAUTHORIZED'),
  Forbidden: () => new AppError('Forbidden', 403, 'FORBIDDEN'),
  InvalidCredentials: () => new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS'),
  
  // Resource errors
  NotFound: (resource: string) => new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  AlreadyExists: (resource: string) => new AppError(`${resource} already exists`, 409, 'ALREADY_EXISTS'),
  
  // Validation errors
  ValidationFailed: (details?: unknown) => new AppError('Validation failed', 400, 'VALIDATION_ERROR', details),
  InvalidInput: (field: string) => new AppError(`Invalid input: ${field}`, 400, 'INVALID_INPUT'),
  MissingRequired: (field: string) => new AppError(`Missing required field: ${field}`, 400, 'MISSING_FIELD'),
  
  // Business logic errors
  InvalidOperation: (message: string) => new AppError(message, 400, 'INVALID_OPERATION'),
  QuotaExceeded: (resource: string) => new AppError(`Quota exceeded for ${resource}`, 429, 'QUOTA_EXCEEDED'),
  
  // Server errors
  Internal: (message = 'Internal server error', details?: unknown) => new AppError(message, 500, 'INTERNAL_ERROR', details),
  ServiceUnavailable: () => new AppError('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE'),
}

/**
 * Assert condition or throw error
 */
export function assert(condition: any, error: AppError): asserts condition {
  if (!condition) {
    throw error
  }
}

/**
 * Create a typed API response
 */
export function apiResponse<T>(
  data: T,
  status = 200,
  headers?: HeadersInit
): NextResponse<T> {
  return NextResponse.json(data, { status, headers })
}

/**
 * Create a success response with standard format
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: Record<string, any>
): NextResponse<{ success: true; message?: string; data: T; meta?: Record<string, any> }> {
  return NextResponse.json({
    success: true,
    message,
    data,
    meta
  })
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests = 60,
  windowMs = 60000
): void {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return
  }

  if (userLimit.count >= maxRequests) {
    throw new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED', {
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    })
  }

  userLimit.count++
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Every minute