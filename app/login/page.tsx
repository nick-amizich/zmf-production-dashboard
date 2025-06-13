'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Headphones, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Check if user has a worker record
        const { data: worker, error: workerError } = await supabase
          .from('workers')
          .select('id, role, is_active')
          .eq('auth_user_id', data.user.id)
          .single()

        if (workerError || !worker) {
          setError('No worker account found. Please contact an administrator.')
          await supabase.auth.signOut()
          return
        }

        if (!worker.is_active) {
          setError('Your account is inactive. Please contact an administrator.')
          await supabase.auth.signOut()
          return
        }

        // Redirect after successful login
        // Use window.location for a full page reload to ensure cookies are set
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-theme-brand-secondary to-theme-brand-primary rounded-lg flex items-center justify-center">
            <Headphones className="h-10 w-10 text-theme-text-primary" />
          </div>
        </div>

        <Card className="bg-theme-bg-secondary/50 border-theme-border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-theme-text-secondary">Welcome Back</CardTitle>
            <CardDescription className="text-theme-text-tertiary">
              Sign in to ZMF Production System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="bg-red-900/20 border-red-900/50 text-theme-status-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-theme-text-tertiary">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@zmfheadphones.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder:text-theme-text-tertiary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-theme-text-tertiary">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-theme-text-tertiary">
              <p>Demo Accounts:</p>
              <p className="mt-2">Admin: admin@zmf.com</p>
              <p>Worker: sarah@zmf.com</p>
              <p>Worker: mike@zmf.com</p>
              <p className="mt-2 text-xs">Password: password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}