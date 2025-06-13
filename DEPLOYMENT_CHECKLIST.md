# Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Copy `.env.example` to `.env.local` and fill in all required values
- [ ] Verify Supabase project is created and running
- [ ] Ensure all environment variables are set in deployment platform (Vercel/Railway/etc)
- [ ] Verify domain configuration and SSL certificates

### Database
- [ ] Run all migrations on production database
- [ ] Verify RLS policies are enabled
- [ ] Create initial admin user
- [ ] Run seed script for demo data (if needed)
- [ ] Test database connection from deployment environment

### Security
- [ ] Change all default passwords
- [ ] Verify CORS settings for production domain
- [ ] Enable rate limiting on API routes
- [ ] Review and update CSP headers
- [ ] Ensure all secrets are properly stored in environment variables

### Code Review
- [ ] Remove all console.log statements (or use proper logging service)
- [ ] Fix TODO comment in `/app/api/admin/users/route.ts`
- [ ] Ensure error handling covers all edge cases
- [ ] Verify all TypeScript types are properly defined
- [ ] Check for any hardcoded values that should be configurable

### Testing
- [ ] Run full test suite: `npm run test:all`
- [ ] Verify build completes without errors: `npm run build`
- [ ] Test critical user flows in staging environment
- [ ] Performance test with expected load
- [ ] Mobile responsiveness testing on actual devices

### Monitoring Setup
- [ ] Configure error tracking (Sentry/Rollbar)
- [ ] Set up application monitoring (Vercel Analytics/Google Analytics)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Create alerting rules for critical issues

## Deployment Steps

1. **Backup Current Production** (if updating)
   ```bash
   # Export production database
   # Save current environment configuration
   ```

2. **Deploy Database Changes**
   ```bash
   # Run migrations
   npx supabase db push
   ```

3. **Deploy Application**
   ```bash
   # Push to main branch (auto-deploy)
   git push origin main
   
   # Or manual deploy
   vercel --prod
   ```

4. **Post-Deployment Verification**
   - [ ] Application loads without errors
   - [ ] Authentication flow works
   - [ ] Database connections are stable
   - [ ] All API endpoints respond correctly
   - [ ] File uploads work (quality check photos)
   - [ ] Email notifications sent (if enabled)

## Production Configuration

### Recommended Settings

```env
# Performance
NEXT_PUBLIC_REVALIDATE_INTERVAL=60

# Security
NODE_ENV=production
NEXT_PUBLIC_DISABLE_DEBUG=true

# Database
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Rate Limiting
API_RATE_LIMIT_WINDOW=60000
API_RATE_LIMIT_MAX_REQUESTS=100
```

### Supabase Production Settings
- Enable email verification
- Configure custom SMTP for emails
- Set up database backups (daily)
- Enable point-in-time recovery
- Configure connection pooling

### Vercel Configuration
```json
{
  "functions": {
    "app/api/reports/generate/route.ts": {
      "maxDuration": 60
    },
    "app/api/product-configurations/sync/route.ts": {
      "maxDuration": 30
    }
  }
}
```

## Rollback Plan

1. **Quick Rollback**
   - Revert to previous deployment in Vercel
   - Rollback database migrations if needed

2. **Database Rollback**
   ```bash
   # Restore from backup
   # Run rollback migrations
   ```

3. **Emergency Contacts**
   - DevOps Lead: [contact]
   - Database Admin: [contact]
   - On-call Engineer: [contact]

## Post-Deployment

### Monitoring (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Verify backup systems working
- [ ] Check resource utilization

### Documentation Updates
- [ ] Update API documentation
- [ ] Update user guides with new features
- [ ] Document any configuration changes
- [ ] Update runbooks

### Communication
- [ ] Notify team of successful deployment
- [ ] Send release notes to stakeholders
- [ ] Update status page
- [ ] Schedule training for new features

## Common Issues & Solutions

### Database Connection Errors
- Check connection pooling settings
- Verify SSL mode configuration
- Check firewall rules

### Authentication Issues
- Verify JWT secret is set correctly
- Check cookie settings for production domain
- Ensure redirect URLs are configured in Supabase

### Performance Issues
- Enable caching headers
- Check for N+1 queries
- Verify CDN configuration
- Review bundle size

### File Upload Problems
- Check storage bucket permissions
- Verify CORS configuration
- Ensure file size limits are appropriate