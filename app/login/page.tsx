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

        // Redirect based on role
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8B4513] to-[#d4a574] rounded-lg flex items-center justify-center">
            <Headphones className="h-10 w-10 text-white" />
          </div>
        </div>

        <Card className="bg-[#1a0d08]/50 border-[#8B4513]/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#d4a574]">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to ZMF Production System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="bg-red-900/20 border-red-900/50 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@zmfheadphones.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#0a0a0a] border-[#8B4513]/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#0a0a0a] border-[#8B4513]/30 text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8B4513] hover:bg-[#8B4513]/80 text-white"
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

            <div className="mt-6 text-center text-sm text-gray-400">
              <p>Demo Accounts:</p>
              <p className="mt-2">Manager: manager@zmf.com</p>
              <p>Worker: worker@zmf.com</p>
              <p className="mt-2 text-xs">Password: password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}