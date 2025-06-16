'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export default function TestSetup() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const supabase = createClient()

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name)
      if (existing) {
        existing.status = status
        existing.message = message
        existing.details = details
        return [...prev]
      } else {
        return [...prev, { name, status, message, details }]
      }
    })
  }

  const runTests = async () => {
    setIsRunning(true)
    setTests([])

    // Test 1: Environment Variables
    updateTest('Environment', 'pending', 'Checking environment variables...')
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        updateTest('Environment', 'error', 'Missing environment variables')
      } else if (supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost')) {
        updateTest('Environment', 'success', 'Local Supabase configuration detected', { supabaseUrl })
      } else {
        updateTest('Environment', 'warning', 'Remote Supabase configuration', { supabaseUrl })
      }
    } catch (error) {
      updateTest('Environment', 'error', 'Failed to check environment', error)
    }

    // Test 2: Supabase Connection
    updateTest('Connection', 'pending', 'Testing Supabase connection...')
    try {
      const { data, error } = await supabase.from('headphone_models').select('count').limit(1)
      if (error) {
        updateTest('Connection', 'error', 'Connection failed', error.message)
      } else {
        updateTest('Connection', 'success', 'Successfully connected to Supabase')
      }
    } catch (error) {
      updateTest('Connection', 'error', 'Connection error', error)
    }

    // Test 3: Database Schema
    updateTest('Schema', 'pending', 'Checking database schema...')
    try {
      const tables = ['workers', 'headphone_models', 'orders', 'batches'] as const
      const results = await Promise.all(
        tables.map(async (table) => {
          const { data, error } = await supabase.from(table).select('*').limit(1)
          return { table, success: !error, error: error?.message }
        })
      )
      
      const failedTables = results.filter(r => !r.success)
      if (failedTables.length > 0) {
        updateTest('Schema', 'error', `Missing tables: ${failedTables.map(t => t.table).join(', ')}`, failedTables)
      } else {
        updateTest('Schema', 'success', 'All required tables exist')
      }
    } catch (error) {
      updateTest('Schema', 'error', 'Schema check failed', error)
    }

    // Test 4: Demo Users
    updateTest('Demo Users', 'pending', 'Checking demo users...')
    try {
      const { data: workers, error } = await supabase
        .from('workers')
        .select('name, email, role, is_active')
        .in('email', ['admin@zmf.com', 'manager@zmf.com', 'sarah@zmf.com', 'mike@zmf.com'])
      
      if (error) {
        updateTest('Demo Users', 'error', 'Failed to fetch demo users', error.message)
      } else if (!workers || workers.length === 0) {
        updateTest('Demo Users', 'error', 'No demo users found')
      } else {
        updateTest('Demo Users', 'success', `Found ${workers.length} demo users`, workers)
      }
    } catch (error) {
      updateTest('Demo Users', 'error', 'Demo users check failed', error)
    }

    // Test 5: Authentication Flow
    updateTest('Auth Flow', 'pending', 'Testing authentication...')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: worker } = await supabase
          .from('workers')
          .select('name, role, is_active')
          .eq('auth_user_id', session.user.id)
          .single()
        
        if (worker) {
          updateTest('Auth Flow', 'success', `Authenticated as ${worker.name} (${worker.role})`, worker)
        } else {
          updateTest('Auth Flow', 'warning', 'Authenticated but no worker record found')
        }
      } else {
        updateTest('Auth Flow', 'warning', 'Not currently authenticated')
      }
    } catch (error) {
      updateTest('Auth Flow', 'error', 'Auth flow test failed', error)
    }

    // Test 6: API Route
    updateTest('API Route', 'pending', 'Testing API authentication...')
    try {
      const response = await fetch('/api/test-auth')
      const data = await response.json()
      
      if (response.ok) {
        updateTest('API Route', 'success', 'API authentication working', data)
      } else if (response.status === 401) {
        updateTest('API Route', 'warning', 'API route working but not authenticated', data)
      } else {
        updateTest('API Route', 'error', 'API route failed', data)
      }
    } catch (error) {
      updateTest('API Route', 'error', 'API route test failed', error)
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-theme-status-success" />
      case 'error':
        return <XCircle className="h-5 w-5 text-theme-status-error" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'pending':
        return <Loader2 className="h-5 w-5 text-theme-status-info animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    }
    
    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            ZMF Supabase Setup Verification
            <Button onClick={runTests} disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Tests'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tests.length === 0 && !isRunning && (
            <Alert>
              <AlertDescription>
                Click &quot;Run Tests&quot; to verify your Supabase setup is working correctly.
              </AlertDescription>
            </Alert>
          )}

          {tests.map((test) => (
            <div key={test.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(test.status)}
                  <h3 className="font-semibold">{test.name}</h3>
                </div>
                {getStatusBadge(test.status)}
              </div>
              
              <p className="text-sm text-theme-text-tertiary mb-2">{test.message}</p>
              
              {test.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-theme-text-tertiary hover:text-gray-700">
                    Show Details
                  </summary>
                  <pre className="mt-2 p-2 bg-theme-bg-tertiary rounded overflow-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}

          {tests.length > 0 && !isRunning && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="flex space-x-4 text-sm">
                <span className="text-theme-status-success">
                  ✓ {tests.filter(t => t.status === 'success').length} Passed
                </span>
                <span className="text-yellow-600">
                  ⚠ {tests.filter(t => t.status === 'warning').length} Warnings
                </span>
                <span className="text-theme-status-error">
                  ✗ {tests.filter(t => t.status === 'error').length} Failed
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 