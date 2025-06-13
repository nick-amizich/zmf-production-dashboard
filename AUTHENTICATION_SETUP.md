# ZMF Production Dashboard - Authentication Setup

## ✅ Setup Complete

Your Supabase authentication is now properly configured for local development.

## 🔐 Demo Accounts

All demo accounts use the password: `password123`

| Email | Role | Access Level |
|-------|------|-------------|
| `admin@zmf.com` | Admin | Full system access |
| `manager@zmf.com` | Manager | Production management |
| `sarah@zmf.com` | Worker | Worker interface |
| `mike@zmf.com` | Worker | Worker interface |

## 🚀 Quick Start

1. **Start Supabase** (if not already running):
   ```bash
   supabase start
   ```

2. **Create demo users** (if needed):
   ```bash
   npm run create-demo-users
   ```

3. **Test authentication**:
   ```bash
   node scripts/test-auth.js
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

5. **Test login**:
   - Visit: `http://localhost:3000/test-auth`
   - Try logging in with any demo account

## 🧪 Testing Pages

- **Basic Auth Test**: `/test-auth` - Simple login/logout testing
- **Comprehensive Test**: `/test-setup` - Full system verification
- **Login Page**: `/login` - Production login interface
- **Dashboard**: `/dashboard` - Main application (requires login)

## 🔧 Maintenance Commands

### Reset Everything
```bash
npm run reset-db
```
This will:
1. Reset the database to clean state
2. Apply all migrations
3. Create demo users

### Just Create Users
```bash
npm run create-demo-users
```

### Test Authentication
```bash
node scripts/test-auth.js
```

## 🛡️ Security Features Implemented

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ **Server-side authentication** using `getUser()` (not `getSession()`)
- ✅ **Field name consistency** in queries and access
- ✅ **Proper auth callbacks** for email confirmations
- ✅ **Role-based access control** via RLS policies
- ✅ **No infinite recursion** in RLS policies

## 📁 Key Files

### Authentication
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/client.ts` - Client-side Supabase client
- `middleware.ts` - Auth middleware for route protection
- `app/auth/callback/route.ts` - Auth callback handler

### Database
- `supabase/migrations/` - Database schema and migrations
- `supabase/seed.sql` - Sample data (customers, orders, etc.)
- `scripts/create-demo-users.js` - Demo user creation script

### Testing
- `scripts/test-auth.js` - Authentication testing script
- `app/test-auth/page.tsx` - Interactive auth testing page
- `app/test-setup/page.tsx` - Comprehensive system verification

## 🔍 Troubleshooting

### "Invalid login credentials"
- Run: `npm run create-demo-users`
- Make sure Supabase is running: `supabase status`

### "Infinite recursion detected"
- This should be fixed, but if it occurs:
- Run: `npm run reset-db`

### Environment issues
- Check `.env.local` has correct local Supabase URLs
- Verify Supabase is running on port 54321

### Database issues
- Reset everything: `npm run reset-db`
- Check Supabase logs: `supabase logs`

## 🏗️ Architecture

### Authentication Flow
1. User submits credentials to `/login`
2. Client calls `supabase.auth.signInWithPassword()`
3. Supabase validates credentials
4. Success → Redirect to `/dashboard`
5. Server components use `getUser()` to verify auth
6. Worker record lookup for role-based access

### RLS Policy Pattern
```sql
-- Helper function prevents recursion
CREATE FUNCTION get_user_role() RETURNS worker_role AS $$
BEGIN
  SELECT role FROM workers WHERE auth_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies use the helper function
CREATE POLICY "role_check" ON table_name
  USING (get_user_role() IN ('manager', 'admin'));
```

## 📊 Database Schema

### Core Tables
- `workers` - Employee records linked to auth users
- `orders` - Customer orders
- `batches` - Production batches
- `stage_assignments` - Work assignments
- `quality_checks` - QC records
- `issues` - Production issues

### Authentication Link
```sql
workers.auth_user_id → auth.users.id
```

## 🎯 Next Steps

1. **Test the login flow** at `/test-auth`
2. **Run comprehensive tests** at `/test-setup`
3. **Try the production login** at `/login`
4. **Access the dashboard** at `/dashboard`

Your authentication system is now ready for development! 🎉 