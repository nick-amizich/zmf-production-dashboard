# Supabase Local Development Setup

## Current Status
✅ Supabase CLI installed and initialized
✅ Database schema created (migrations ready)
✅ TypeScript types generated
✅ Supabase client libraries configured

## Start Local Development

1. **Start Supabase locally:**
```bash
supabase start
```

This will start:
- PostgreSQL database (port 54322)
- Auth server (port 54321)
- Storage server
- Realtime server
- Studio UI (http://localhost:54323)

2. **Apply database migrations:**
```bash
supabase db reset
```

This will:
- Reset the database
- Apply all migrations
- Seed initial data (headphone models)

3. **Get local connection details:**
```bash
supabase status
```

4. **Update your .env.local file with local URLs:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key from supabase status]

# Service role key for server-side operations
SUPABASE_SERVICE_ROLE_KEY=[service_role key from supabase status]
```

## Database Schema Overview

### Tables Created:
- **workers** - User accounts with roles (worker/manager/admin)
- **orders** - Customer orders with customizations
- **batches** - Production batch groupings
- **batch_orders** - Links orders to batches
- **headphone_models** - Product catalog
- **stage_assignments** - Worker assignments by stage
- **quality_checks** - QC checklists and results
- **issues** - Quality issues tracking
- **production_metrics** - Performance analytics
- **system_logs** - Audit trail

### Key Features:
- Row Level Security (RLS) enabled on all tables
- Proper indexes for performance
- Automatic timestamp updates
- Storage bucket for quality photos

## Local Development Workflow

1. **Access Supabase Studio:**
   - Open http://localhost:54323
   - View/edit data
   - Run SQL queries
   - Manage authentication

2. **Create test users:**
   - Go to Authentication → Users
   - Create manager and worker accounts
   - Note their UUIDs for the workers table

3. **Insert test workers:**
```sql
-- After creating auth users, link them to workers
INSERT INTO workers (auth_user_id, name, email, role) VALUES
  ('auth-user-uuid-1', 'Tony Martinez', 'tony@zmf.com', 'manager'),
  ('auth-user-uuid-2', 'Jake Thompson', 'jake@zmf.com', 'worker');
```

4. **Stop Supabase when done:**
```bash
supabase stop
```

## Next Steps

1. Replace mock data with Supabase queries
2. Implement authentication flow
3. Add real-time subscriptions
4. Set up file upload for quality photos

## Common Commands

```bash
# View logs
supabase db logs

# Run migrations
supabase migration up

# Generate types after schema changes
supabase gen types typescript --local > types/database.types.ts

# Reset database
supabase db reset

# Stop all services
supabase stop

# Start specific services
supabase start db
```

## Troubleshooting

If ports are already in use:
```bash
# Stop all containers
supabase stop --no-backup

# Or change ports in supabase/config.toml
```

Database connection issues:
- Check `supabase status` for correct URLs
- Ensure .env.local has correct keys
- Verify RLS policies aren't blocking access