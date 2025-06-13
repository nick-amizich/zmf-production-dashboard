'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestAuth() {
  const [email, setEmail] = useState('admin@zmf.com')
  const [password, setPassword] = useState('password123')
  const [status, setStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSignUp = async () => {
    setIsLoading(true)
    setStatus('Signing up...')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    
    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus(`Success! User created: ${data.user?.email}. Check your email for confirmation.`)
    }
    setIsLoading(false)
  }

  const handleSignIn = async () => {
    setIsLoading(true)
    setStatus('Signing in...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setStatus(`Error: ${error.message}`)
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Check if user has a worker record
        const { data: worker, error: workerError } = await supabase
          .from('workers')
          .select('id, role, is_active, name')
          .eq('auth_user_id', data.user.id)
          .single()

        if (workerError) {
          setStatus(`Worker lookup error: ${workerError.message}`)
          setIsLoading(false)
          return
        }

        if (!worker) {
          setStatus('No worker account found. Please contact an administrator.')
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }

        if (!worker.is_active) {
          setStatus('Your account is inactive. Please contact an administrator.')
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }

        setStatus(`Success! Logged in as: ${worker.name} (${worker.role})`)
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      }
    } catch (err) {
      setStatus(`Unexpected error: ${err}`)
    }
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setStatus('Signed out successfully')
    } else {
      setStatus(`Sign out error: ${error.message}`)
    }
    setIsLoading(false)
  }

  const checkSession = async () => {
    setIsLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      // Also check worker record
      const { data: worker } = await supabase
        .from('workers')
        .select('name, role, is_active')
        .eq('auth_user_id', session.user.id)
        .single()
      
      if (worker) {
        setStatus(`Currently logged in as: ${worker.name} (${worker.role}) - Active: ${worker.is_active}`)
      } else {
        setStatus(`Logged in as: ${session.user.email} but no worker record found`)
      }
    } else {
      setStatus('Not logged in')
    }
    setIsLoading(false)
  }

  const testDemoAccounts = [
    { email: 'admin@zmf.com', role: 'Admin' },
    { email: 'manager@zmf.com', role: 'Manager' },
    { email: 'sarah@zmf.com', role: 'Worker' },
    { email: 'mike@zmf.com', role: 'Worker' }
  ]

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>ZMF Auth Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSignIn} disabled={isLoading}>
              Sign In
            </Button>
            <Button onClick={handleSignOut} variant="destructive" disabled={isLoading}>
              Sign Out
            </Button>
          </div>

          <Button onClick={checkSession} variant="secondary" className="w-full" disabled={isLoading}>
            Check Session
          </Button>

          {status && (
            <Alert>
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-theme-text-tertiary">
            <p className="font-semibold">Demo Accounts (password: password123):</p>
            <div className="mt-2 space-y-1">
              {testDemoAccounts.map((account) => (
                <div key={account.email} className="flex justify-between">
                  <button
                    onClick={() => setEmail(account.email)}
                    className="text-theme-status-info hover:underline text-left"
                    disabled={isLoading}
                  >
                    {account.email}
                  </button>
                  <span className="text-xs text-theme-text-tertiary">{account.role}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}