'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestSupabase() {
  const [status, setStatus] = useState<any>({})
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const checkConnection = async () => {
    try {
      // Test 1: Check if we can reach Supabase
      const { data: healthCheck, error: healthError } = await supabase
        .from('workers')
        .select('count(*)', { count: 'exact', head: true })
      
      // Test 2: Check current auth status
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // Test 3: Try to create a test user
      const testEmail = `test-${Date.now()}@example.com`
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
      })

      setStatus({
        connection: healthError ? 'Failed' : 'Success',
        connectionError: healthError?.message,
        currentSession: session ? 'Logged in' : 'Not logged in',
        sessionEmail: session?.user?.email,
        testSignUp: signUpError ? 'Failed' : 'Success',
        testSignUpError: signUpError?.message,
        testSignUpUser: signUpData?.user?.email,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <p><strong>Supabase URL:</strong> {status.supabaseUrl}</p>
            <p><strong>Database Connection:</strong> {status.connection}</p>
            {status.connectionError && (
              <p className="text-theme-status-error text-sm">Error: {status.connectionError}</p>
            )}
            <p><strong>Auth Status:</strong> {status.currentSession}</p>
            {status.sessionEmail && (
              <p><strong>Logged in as:</strong> {status.sessionEmail}</p>
            )}
            <p><strong>Test Sign Up:</strong> {status.testSignUp}</p>
            {status.testSignUpError && (
              <p className="text-theme-status-error text-sm">Error: {status.testSignUpError}</p>
            )}
            {status.testSignUpUser && (
              <p className="text-theme-status-success text-sm">Created: {status.testSignUpUser}</p>
            )}
          </div>

          <Button onClick={checkConnection}>Refresh Tests</Button>

          <div className="mt-8">
            <h3 className="font-semibold mb-2">Quick Actions:</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithPassword({
                    email: 'test@example.com',
                    password: 'testpassword123'
                  })
                  if (error) alert(error.message)
                  else {
                    alert('Logged in!')
                    checkConnection()
                  }
                }}
              >
                Try Login with test@example.com
              </Button>
              
              <Button 
                variant="outline" 
                onClick={async () => {
                  const { error } = await supabase.auth.signOut()
                  if (!error) {
                    alert('Logged out!')
                    checkConnection()
                  }
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}