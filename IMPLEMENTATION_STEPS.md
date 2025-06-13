# ZMF Production Dashboard - Implementation Steps

## Overview

This document provides step-by-step implementation guidance for building the ZMF Production Dashboard. Follow these steps in order to ensure proper dependencies and system stability.

## Phase 1: Foundation Setup (Week 1)

### Step 1: Database Schema Setup

1. **Create Supabase Project**
   ```bash
   # Initialize Supabase locally
   npx supabase init
   
   # Link to project
   npx supabase link --project-ref kjdicpudxqxenhjwdrzg
   ```

2. **Create Migration Files**
   ```bash
   # Create migration files in order
   npx supabase migration new 001_enable_extensions
   npx supabase migration new 002_create_enums
   npx supabase migration new 003_create_core_tables
   npx supabase migration new 004_create_indexes
   npx supabase migration new 005_create_rls_policies
   npx supabase migration new 006_create_functions
   npx supabase migration new 007_seed_data
   ```

3. **Apply Migrations**
   ```bash
   # Test locally first
   npx supabase db reset
   
   # Push to production
   npx supabase db push
   ```

4. **Generate TypeScript Types**
   ```bash
   npx supabase gen types typescript --project-id kjdicpudxqxenhjwdrzg > types/database.types.ts
   ```

### Step 2: Authentication Setup

1. **Configure Supabase Auth**
   - Enable email authentication
   - Set up redirect URLs
   - Configure email templates

2. **Create Auth Middleware**
   ```typescript
   // middleware.ts
   import { createServerClient } from '@supabase/ssr'
   import { NextResponse } from 'next/server'
   
   export async function middleware(request: NextRequest) {
     // Implementation from auth module plan
   }
   ```

3. **Create Auth Components**
   - Login page
   - Auth provider
   - Session management
   - Protected route wrapper

4. **Test Authentication Flow**
   - Create test users
   - Test login/logout
   - Test session persistence
   - Test role-based access

### Step 3: Core UI Framework

1. **Install Dependencies**
   ```bash
   npm install @tanstack/react-query @radix-ui/themes lucide-react
   npx shadcn@latest init
   ```

2. **Set Up Providers**
   ```typescript
   // app/providers.tsx
   export function Providers({ children }: { children: React.ReactNode }) {
     return (
       <QueryClientProvider client={queryClient}>
         <ThemeProvider>
           <AuthProvider>
             {children}
           </AuthProvider>
         </ThemeProvider>
       </QueryClientProvider>
     )
   }
   ```

3. **Create Layout Components**
   - Navigation
   - Sidebar
   - Header
   - Footer

## Phase 2: Core Business Logic (Week 2)

### Step 4: Data Access Layer

1. **Create Repository Classes**
   ```typescript
   // lib/repositories/base-repository.ts
   export abstract class BaseRepository<T> {
     constructor(protected supabase: SupabaseClient) {}
     
     abstract findById(id: string): Promise<T>
     abstract create(data: Partial<T>): Promise<T>
     abstract update(id: string, data: Partial<T>): Promise<T>
     abstract delete(id: string): Promise<void>
   }
   ```

2. **Implement Specific Repositories**
   - OrderRepository
   - BatchRepository
   - WorkerRepository
   - QualityCheckRepository

3. **Create Service Layer**
   - ProductionService
   - QualityService
   - WorkerService

### Step 5: Production Tracking Implementation

1. **Create Production Components**
   - Pipeline board
   - Batch manager
   - Stage columns
   - Order cards

2. **Implement Drag & Drop**
   ```typescript
   // components/production/pipeline-board.tsx
   import { DndContext, DragEndEvent } from '@dnd-kit/core'
   
   export function PipelineBoard() {
     // Implementation
   }
   ```

3. **Create API Routes**
   - `/api/batches` - CRUD operations
   - `/api/batches/[id]/transition` - Stage transitions
   - `/api/assignments` - Worker assignments

4. **Add Real-time Updates**
   - Subscribe to batch changes
   - Update UI on changes
   - Show notifications

### Step 6: Quality Control Implementation

1. **Create Quality Components**
   - Checklist forms
   - Issue reporting
   - Photo upload
   - Quality dashboard

2. **Implement Photo Management**
   ```typescript
   // lib/storage/photo-service.ts
   export class PhotoService {
     async uploadQualityPhoto(file: File, context: PhotoContext) {
       // Compress and upload
     }
   }
   ```

3. **Create Quality API Routes**
   - `/api/quality/checks` - Submit checks
   - `/api/quality/issues` - Report issues
   - `/api/quality/metrics` - Get metrics

## Phase 3: Advanced Features (Week 3)

### Step 7: Worker Management

1. **Create Worker Interfaces**
   - Mobile-optimized views
   - Task assignments
   - Performance tracking

2. **Implement Calendar System**
   - Production calendar
   - Worker availability
   - Schedule management

3. **Add Performance Metrics**
   - Track completion times
   - Calculate quality scores
   - Generate reports

### Step 8: Product Configuration

1. **Create Configuration UI**
   - Model management
   - Option editor
   - Price calculator

2. **Implement Shopify Integration**
   - API endpoint for Shopify
   - Configuration sync
   - Logging and monitoring

3. **Test Integration**
   - Test with Shopify theme
   - Verify CORS settings
   - Monitor API usage

## Phase 4: Polish & Optimization (Week 4)

### Step 9: Reporting & Analytics

1. **Create Dashboard Views**
   - Production overview
   - Quality metrics
   - Worker performance
   - Order analytics

2. **Implement Export Features**
   - PDF reports
   - CSV exports
   - Chart downloads

3. **Add Filtering & Search**
   - Date range filters
   - Model/stage filters
   - Full-text search

### Step 10: Testing & Optimization

1. **Write Tests**
   ```bash
   # Unit tests
   npm test
   
   # Integration tests
   npm run test:integration
   
   # E2E tests
   npm run test:e2e
   ```

2. **Performance Optimization**
   - Implement caching
   - Optimize queries
   - Lazy load components
   - Compress assets

3. **Security Audit**
   - Review RLS policies
   - Test authentication
   - Validate inputs
   - Check for vulnerabilities

### Step 11: Deployment Preparation

1. **Environment Setup**
   ```env
   # .env.production
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

2. **Build Optimization**
   ```bash
   # Analyze bundle
   npm run analyze
   
   # Production build
   npm run build
   ```

3. **Deployment**
   - Deploy to Vercel/Railway
   - Configure environment variables
   - Set up monitoring
   - Configure backups

## Testing Checklist

### Unit Tests
- [ ] Authentication logic
- [ ] Repository methods
- [ ] Service layer
- [ ] Utility functions
- [ ] Component logic

### Integration Tests
- [ ] Database operations
- [ ] API endpoints
- [ ] Auth flow
- [ ] File uploads
- [ ] Real-time updates

### E2E Tests
- [ ] Complete order flow
- [ ] Quality check process
- [ ] Worker assignment
- [ ] Issue resolution
- [ ] Report generation

### Performance Tests
- [ ] Page load times
- [ ] API response times
- [ ] Database query performance
- [ ] Real-time latency
- [ ] Concurrent user handling

## Monitoring Setup

1. **Application Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics

2. **Database Monitoring**
   - Query performance
   - Connection pooling
   - Storage usage
   - Index effectiveness

3. **API Monitoring**
   - Endpoint usage
   - Response times
   - Error rates
   - Rate limiting

## Maintenance Plan

### Daily
- Monitor error logs
- Check system health
- Review pending issues

### Weekly
- Database maintenance
- Performance review
- Security updates
- Backup verification

### Monthly
- Feature usage analytics
- Performance optimization
- Security audit
- Documentation updates

## Success Criteria

1. **Performance**
   - Page load < 2 seconds
   - API response < 200ms
   - 99.9% uptime

2. **Quality**
   - Zero critical bugs
   - < 5 minor bugs per release
   - 95% test coverage

3. **User Satisfaction**
   - Worker adoption > 90%
   - Manager satisfaction > 85%
   - Support tickets < 10/month

4. **Business Impact**
   - Production efficiency +20%
   - Quality defect rate -30%
   - Order tracking accuracy 100%