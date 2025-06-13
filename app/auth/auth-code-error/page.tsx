import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="bg-theme-bg-secondary/50 border-theme-border-primary">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-theme-status-error" />
            </div>
            <CardTitle className="text-2xl text-theme-status-error">Authentication Error</CardTitle>
            <CardDescription className="text-theme-text-tertiary">
              There was an error processing your authentication request.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-theme-text-tertiary mb-6">
              The authentication code was invalid or has expired. Please try signing in again.
            </p>
            <Button asChild className="w-full bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
              <Link href="/login">
                Return to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 