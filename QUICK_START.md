# ZMF Production System - Quick Start Guide

## After Computer Restart

### 1. Start Docker
Make sure Docker Desktop is running before proceeding.

### 2. Start Supabase Local Development
```bash
cd "/Users/nick/localdev/ZMFv5/ZMF Production Dashboard"
supabase start
```

This will start all Supabase services:
- PostgreSQL database (port 54322)
- Auth server (port 54321)
- Storage server
- Realtime server
- Studio UI (http://localhost:54323)

### 3. Get Your Local Credentials
```bash
supabase status
```

Look for these values in the output:
- `API URL` (will be http://localhost:54321)
- `anon key` (a long JWT token)
- `service_role key` (another JWT token)

### 4. Update Environment Variables
Edit `.env.local` and replace with your actual values:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key from step 3]
SUPABASE_SERVICE_ROLE_KEY=[your service_role key from step 3]
```

### 5. Reset Database & Apply Migrations
```bash
supabase db reset
```

This will:
- Drop all existing data
- Apply all migrations
- Run seed data (creates demo users)

### 6. Start the Next.js Development Server
```bash
npm run dev
```

### 7. Access the Application
- Open http://localhost:3000
- You'll be redirected to login

### 8. Login with Demo Accounts

**Manager Account:**
- Email: `manager@zmf.com`
- Password: `password123`

**Worker Account:**
- Email: `worker@zmf.com`
- Password: `password123`

### 9. Access Supabase Studio (Optional)
- Open http://localhost:54323
- View/edit database directly
- Monitor real-time subscriptions
- Manage authentication

## Stopping Everything

When you're done developing:

```bash
# Stop Next.js (Ctrl+C in the terminal)

# Stop Supabase
supabase stop
```

## Troubleshooting

### Port Conflicts
If you get port errors:
```bash
supabase stop --no-backup
```

### Database Connection Issues
1. Check Docker is running
2. Verify credentials in `.env.local`
3. Try `supabase db reset` again

### Can't Login
1. Make sure you ran `supabase db reset` to create demo users
2. Check the Supabase Studio Auth section
3. Verify worker records exist in the workers table

## Next Development Session

Just repeat from step 2:
1. Make sure Docker is running
2. `supabase start`
3. `npm run dev`
4. Start coding!

Your database data persists between sessions unless you run `supabase db reset` again.