'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestAuth() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpassword123')
  const [status, setStatus] = useState<string>('')
  const supabase = createClient()

  const handleSignUp = async () => {
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
      setStatus(`Success! User created: ${data.user?.email}. You can now sign in.`)
    }
  }

  const handleSignIn = async () => {
    setStatus('Signing in...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus(`Success! Logged in as: ${data.user?.email}`)
      // Redirect to product configurator
      window.location.href = '/product-configurator'
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setStatus('Signed out successfully')
    }
  }

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setStatus(`Currently logged in as: ${session.user.email}`)
    } else {
      setStatus('Not logged in')
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Simple Auth Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSignUp} variant="outline">
              Sign Up
            </Button>
            <Button onClick={handleSignIn}>
              Sign In
            </Button>
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          </div>

          <Button onClick={checkSession} variant="secondary" className="w-full">
            Check Session
          </Button>

          {status && (
            <Alert>
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-500">
            <p>Quick test:</p>
            <ol className="list-decimal list-inside mt-2">
              <li>Click "Sign Up" to create a test user</li>
              <li>Then click "Sign In" to login</li>
              <li>You'll be redirected to the product configurator</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}