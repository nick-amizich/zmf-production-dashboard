'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Headphones, Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      // Call our server-side signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Signup failed')
        return
      }

      setSuccess(true)
      // Don't redirect since user can't login until approved
    } catch (err) {
      console.error('Signup error:', err)
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
            <CardTitle className="text-2xl text-theme-text-secondary">Create Account</CardTitle>
            <CardDescription className="text-theme-text-tertiary">
              Sign up for ZMF Production System
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <Alert className="bg-green-900/20 border-green-900/50 text-green-400">
                <AlertDescription>
                  Account created successfully! Your registration is pending approval by a manager. 
                  You will be notified once your account has been approved and can then log in.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <Alert className="bg-red-900/20 border-red-900/50 text-theme-status-error">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-theme-text-tertiary">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder:text-theme-text-tertiary"
                  />
                </div>

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
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-theme-text-tertiary">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Creating account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-theme-text-tertiary">
              Already have an account?{' '}
              <Link href="/login" className="text-theme-brand-secondary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}