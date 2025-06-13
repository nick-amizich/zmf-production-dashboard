# Authentication & Authorization Module - Implementation Plan

## Module Overview

The Authentication & Authorization module is the foundation of the system, providing secure user authentication, role management, and access control for all other modules.

## Dependencies

### External Dependencies
- Supabase Auth
- @supabase/ssr
- Next.js middleware

### Internal Dependencies
- Database: `workers` table
- RLS policies on all tables

## Database Schema

### Workers Table Enhancement
```sql
-- Already exists, but ensure these fields:
CREATE TABLE workers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role worker_role NOT NULL DEFAULT 'worker',
  is_active BOOLEAN DEFAULT true,
  specializations production_stage[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Critical indexes for auth performance
CREATE INDEX idx_workers_auth_user_id ON workers(auth_user_id);
CREATE INDEX idx_workers_email ON workers(email);
CREATE INDEX idx_workers_role ON workers(role);
CREATE INDEX idx_workers_is_active ON workers(is_active);
```

### RLS Policies
```sql
-- Workers table policies
CREATE POLICY "Workers can view own profile" ON workers
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Managers can view all workers" ON workers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers
      WHERE auth_user_id = auth.uid()
      AND role IN ('manager', 'admin')
    )
  );

-- Add similar policies for all tables
```

## Implementation Steps

### Step 1: Core Authentication Setup

#### 1.1 Update Supabase Clients
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

#### 1.2 Authentication Middleware
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect authenticated routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

### Step 2: Authentication Components

#### 2.1 Login Page
```typescript
// app/login/page.tsx
export default function LoginPage() {
  // Server component that checks if already logged in
  // Renders client component for login form
}
```

#### 2.2 Auth Hook
```typescript
// hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to auth changes
    // Fetch worker profile
    // Handle loading states
  }, [])

  return { user, worker, loading, signOut }
}
```

### Step 3: Authorization System

#### 3.1 Role-Based Access Control
```typescript
// lib/auth/rbac.ts
export const permissions = {
  worker: [
    'view:own-tasks',
    'update:own-tasks',
    'create:quality-checks',
    'create:issues'
  ],
  manager: [
    'view:all-tasks',
    'update:all-tasks',
    'create:batches',
    'assign:workers',
    'view:reports'
  ],
  admin: ['*'] // All permissions
}

export function hasPermission(role: WorkerRole, permission: string): boolean {
  if (role === 'admin') return true
  return permissions[role]?.includes(permission) ?? false
}
```

#### 3.2 Protected API Routes
```typescript
// lib/auth/protect-api.ts
export async function withAuth(
  handler: Function,
  requiredRole?: WorkerRole
) {
  return async (req: NextRequest) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: worker } = await supabase
      .from('workers')
      .select('id, role, is_active')
      .eq('auth_user_id', user.id)
      .single()

    if (!worker?.is_active) {
      return NextResponse.json({ error: 'Account inactive' }, { status: 403 })
    }

    if (requiredRole && !hasRole(worker.role, requiredRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return handler(req, { user, worker })
  }
}
```

### Step 4: Session Management

#### 4.1 Session Refresh
```typescript
// components/auth/session-provider.tsx
export function SessionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      const supabase = createClient()
      await supabase.auth.refreshSession()
    }, 30 * 60 * 1000) // Refresh every 30 minutes

    return () => clearInterval(interval)
  }, [])

  return <>{children}</>
}
```

### Step 5: Testing

#### 5.1 Unit Tests
- Test RBAC logic
- Test permission checks
- Test auth utilities

#### 5.2 Integration Tests
- Test login flow
- Test protected routes
- Test role-based access

#### 5.3 E2E Tests
- Test complete auth flow
- Test session expiry
- Test unauthorized access

## Security Checklist

- [ ] Never use `getSession()` server-side
- [ ] Always use `getUser()` for auth verification
- [ ] Validate worker status on every request
- [ ] Implement rate limiting on auth endpoints
- [ ] Log all authentication events
- [ ] Use secure session settings
- [ ] Implement CSRF protection
- [ ] Validate all inputs

## Error Handling

1. **Invalid Credentials**: Clear error message
2. **Inactive Account**: Redirect to contact page
3. **Session Expired**: Auto-redirect to login
4. **Network Errors**: Retry with exponential backoff
5. **Rate Limiting**: Show cooldown message

## Monitoring & Logging

1. Log all login attempts
2. Track failed authentications
3. Monitor session durations
4. Alert on suspicious activity
5. Track permission denials

## Performance Considerations

1. Cache worker profiles in memory
2. Use database indexes on auth queries
3. Minimize auth checks per request
4. Use connection pooling
5. Implement request debouncing

## Migration Strategy

1. Create new auth system alongside existing
2. Migrate users in batches
3. Provide fallback to old system
4. Monitor for issues
5. Remove old system after validation

## Success Metrics

- Login success rate > 99%
- Auth check latency < 50ms
- Zero unauthorized access incidents
- Session refresh success rate > 99.9%
- User satisfaction with auth flow > 90%