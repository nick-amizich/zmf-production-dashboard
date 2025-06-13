# ZMF Production Dashboard - Complete Testing Guide

## Overview
This document covers ALL functionality in the ZMF Production Dashboard system. Test each workflow thoroughly to ensure proper database integration and functionality.

## 1. AUTHENTICATION & USER MANAGEMENT

### 1.1 Login Flow
**Test URL:** `/login`

**Test Steps:**
1. Navigate to `/login`
2. Enter test credentials:
   - Admin: `admin@zmfheadphones.com` / `admin123`
   - Manager: `manager@zmfheadphones.com` / `manager123`
   - Worker: `john.doe@zmfheadphones.com` / `worker123`
3. Click "Sign In"
4. Should redirect to `/dashboard`

**Database Verification:**
- Check `workers` table has matching `auth_user_id`
- Verify `is_active` = true for user
- Confirm role matches expected permissions

### 1.2 Role-Based Access Control
**Test Each Role:**

**Admin Access:**
- Can access ALL routes
- Settings page shows admin dashboard
- Can create/edit/delete users
- Can view all reports and analytics

**Manager Access:**
- Can access: `/production`, `/quality`, `/workers`, `/reports`, `/analytics`
- CANNOT access: `/settings` (admin only)
- Can create batches and assign workers
- Can view all production data

**Worker Access:**
- Can access: `/production`, `/quality`, `/worker/dashboard`, `/worker/mobile`
- CANNOT access: `/workers`, `/reports`, `/analytics`, `/settings`
- Can only complete assigned tasks
- Limited to their own performance data

### 1.3 User Management (Admin Only)
**Test URL:** `/admin/users`

**Test Actions:**
1. **Create New User:**
   - Click "Add New User"
   - Fill form: name, email, role, specializations
   - Submit creates entry in `workers` table
   - Email sent with auth link

2. **Edit User:**
   - Click edit on user row
   - Modify role, active status, specializations
   - Changes update `workers` table

3. **Delete User:**
   - Click delete (soft delete - sets `is_active` = false)
   - User cannot login anymore

## 2. PRODUCTION TRACKING

### 2.1 Order Creation
**Test URL:** `/production` → "Create Batch" button

**Manual Order Creation:**
1. Click "Create Order" in batch creator
2. Fill in:
   - Customer name, email, phone
   - Select headphone model
   - Choose wood type
   - Add custom notes
   - Upload reference images
3. Submit creates entries in:
   - `customers` table (or finds existing)
   - `orders` table with status = 'pending'

### 2.2 Batch Management
**Test URL:** `/production`

**Create Batch from Orders:**
1. Click "Create Batch" (manager only)
2. Select pending orders to group
3. System suggests optimal grouping by:
   - Same model
   - Same wood type
   - Priority level
4. Confirm batch creation
5. Creates entry in `batches` table
6. Updates selected orders with `batch_id`

**Batch Pipeline Workflow:**
1. **Drag & Drop Between Stages:**
   - Drag batch card to next stage
   - Updates `current_stage` in batches table
   - Creates `production_stage_history` entry
   - Triggers quality check requirements

2. **Production Stages (in order):**
   - `wood_cutting` → `sanding` → `assembly` → `finishing` → `quality_control` → `packaging` → `shipping`

### 2.3 Stage Assignments
**Worker Assignment:**
1. Manager clicks on batch in stage
2. Assigns worker specialized in that stage
3. Creates `stage_assignments` entry
4. Worker sees task in their dashboard

**Worker Task Completion:**
1. Worker navigates to `/worker/dashboard`
2. Sees assigned tasks
3. Clicks "Start Task"
4. Completes quality checklist
5. Uploads photos if issues
6. Marks complete
7. Updates assignment status

## 3. QUALITY CONTROL

### 3.1 Quality Checks
**Test URL:** `/quality`

**Stage Quality Checks:**
1. Each stage transition requires quality check
2. Worker or QC inspector fills checklist:
   - Stage-specific items (defined in `data/qc-checklists.ts`)
   - Pass/Fail for each item
   - Overall pass/fail
   - Notes and photo uploads
3. Creates `quality_checks` entry
4. Failed checks create `quality_issues`

### 3.2 Issue Management
**Report Issue:**
1. Click "Report Issue" on any batch
2. Select severity: `warning`, `hold`, `critical`
3. Describe issue
4. Upload photos to Supabase storage
5. Creates `quality_issues` entry
6. Batch status updates based on severity

**Resolve Issue:**
1. View active issues in quality dashboard
2. Click resolve
3. Add resolution notes
4. Updates issue with resolution timestamp

### 3.3 Quality Metrics
**Dashboard Shows:**
- Pass rate by stage
- Issues by model
- Worker quality scores
- Trend charts over time

## 4. WORKER MANAGEMENT

### 4.1 Worker Dashboard
**Test URL:** `/worker/dashboard`

**Features to Test:**
1. **Performance Stats:**
   - Units completed
   - Quality score
   - Efficiency rating
   - Current streak

2. **Task Management:**
   - View assigned tasks
   - Start/complete workflow
   - Timer tracking

3. **Schedule Management:**
   - Set weekly availability
   - View upcoming assignments
   - Request time off

### 4.2 Mobile Interface
**Test URL:** `/worker/mobile`

**Optimized Features:**
1. Large touch targets
2. Simplified navigation
3. Quick task completion
4. Photo capture for issues

### 4.3 Worker Performance
**Test URL:** `/management/workers`

**Manager Features:**
1. **Leaderboard:**
   - Composite score ranking
   - Filter by timeframe
   - View detailed metrics

2. **Availability Grid:**
   - See all worker schedules
   - Drag to assign shifts
   - Balance workload

3. **Performance Analytics:**
   - Individual worker stats
   - Comparison charts
   - Specialization tracking

## 5. PRODUCT CONFIGURATION

### 5.1 Configuration Management
**Test URL:** `/product-configurator`

**Model Management:**
1. Add new headphone models
2. Define options:
   - Wood types with prices
   - Customization options
   - Base prices
3. Saves to `product_configurations` table

### 5.2 Shopify Integration
**Shopify Mapping:**
1. Map configurations to Shopify product IDs
2. Sync pricing and options
3. Updates `shopify_product_id` in configurations

**Webhook Testing:**
- Endpoint: `/api/webhooks/shopify`
- Receives order creation events
- Creates orders automatically

### 5.3 Create Order from Config
1. Select configuration
2. Choose options
3. Enter customer details
4. Creates order with correct pricing

## 6. REPORTING & ANALYTICS

### 6.1 Analytics Dashboard
**Test URL:** `/analytics`

**Test Each Tab:**
1. **Production Metrics:**
   - Daily/weekly output
   - Stage bottlenecks
   - Efficiency trends

2. **Quality Metrics:**
   - Pass rates
   - Issue categories
   - Resolution times

3. **Worker Performance:**
   - Individual metrics
   - Team comparisons
   - Skill matrices

4. **Revenue Analysis:**
   - Order values
   - Model profitability
   - Growth trends

### 6.2 Report Generation
**Test URL:** `/reports`

**Generate Each Report Type:**
1. Production Summary
2. Quality Analysis  
3. Worker Performance
4. Inventory Status
5. Customer Orders
6. Financial Summary
7. Efficiency Report
8. Custom Report

**Export Formats:**
- PDF generation
- CSV download
- Excel export

## 7. SYSTEM ADMINISTRATION

### 7.1 Settings Management
**Test URL:** `/settings` (admin only)

**Test Sections:**
1. **General Settings:**
   - Company name
   - System email
   - Timezone

2. **Production Settings:**
   - Auto-assign toggle
   - Quality requirements

3. **Theme Settings:**
   - Switch between 5 themes
   - Verify persistence

4. **Security Settings:**
   - 2FA configuration
   - API key management

### 7.2 Audit Logs
**Verify Logging:**
- All create/update/delete actions
- User who performed action
- Timestamp and details
- Stored in `audit_logs` table

## 8. DATABASE OPERATIONS TO VERIFY

### 8.1 Core Tables
1. **workers** - User accounts and roles
2. **customers** - Customer information
3. **headphone_models** - Product catalog
4. **orders** - Customer orders
5. **batches** - Production batches
6. **production_stage_history** - Stage transitions
7. **stage_assignments** - Worker assignments
8. **quality_checks** - QC records
9. **quality_issues** - Problem tracking
10. **worker_performance** - Metrics
11. **worker_availability** - Schedules
12. **worker_notifications** - Alerts
13. **product_configurations** - Product options
14. **audit_logs** - System history

### 8.2 Key Relationships
- Orders → Batches (many-to-one)
- Batches → Stage History (one-to-many)
- Workers → Assignments (one-to-many)
- Batches → Quality Checks (one-to-many)
- Quality Checks → Issues (one-to-many)

### 8.3 RLS Policies
Test that:
- Workers only see their assignments
- Managers see all production data
- Admins have full access
- Inactive users blocked

## 9. API ENDPOINTS TO TEST

### 9.1 Production APIs
- `GET/POST /api/orders`
- `GET/POST /api/batches`
- `POST /api/batches/[id]/transition`
- `POST /api/worker/assignments/[id]/complete`

### 9.2 Quality APIs
- `GET /api/quality/checklist`
- `POST /api/quality/checks`
- `POST /api/quality/issues`
- `POST /api/quality/issues/[id]/resolve`

### 9.3 Admin APIs
- `GET/POST /api/admin/users`
- `PUT/DELETE /api/admin/users/[id]`
- `POST /api/reports/generate`

### 9.4 Integration APIs
- `GET /api/product-configurations`
- `POST /api/product-configurations/[id]/mapping`
- `POST /api/webhooks/shopify`

## 10. COMPLETE USER WORKFLOWS

### 10.1 Full Production Cycle
1. Customer order created (manual or Shopify)
2. Manager creates batch from pending orders
3. Batch moves through 7 stages
4. Workers complete assigned tasks
5. Quality checks at each stage
6. Issues reported and resolved
7. Final packaging and shipping
8. Order marked complete

### 10.2 Daily Worker Flow
1. Worker logs in
2. Checks dashboard for assignments
3. Starts task timer
4. Completes quality checklist
5. Reports any issues
6. Marks task complete
7. Views performance stats

### 10.3 Manager Oversight Flow
1. Manager logs in
2. Reviews production pipeline
3. Creates batches from orders
4. Assigns workers to stages
5. Monitors quality metrics
6. Generates reports
7. Adjusts assignments as needed

## 11. EDGE CASES TO TEST

1. **Concurrent Updates:**
   - Two users dragging same batch
   - Multiple workers claiming task

2. **Data Validation:**
   - Invalid email formats
   - Negative quantities
   - Future dates

3. **Permission Boundaries:**
   - Worker accessing manager routes
   - Inactive user attempting login

4. **Error Handling:**
   - Database connection loss
   - Image upload failures
   - API timeouts

5. **Performance:**
   - Large batch operations
   - Many concurrent users
   - Big report generation

## 12. MOBILE TESTING

1. **Responsive Design:**
   - Test on phone/tablet sizes
   - Touch target sizes
   - Gesture support

2. **Mobile-Specific Features:**
   - Camera integration
   - Offline capability
   - Push notifications

## TEST DATA SETUP

Run these scripts before testing:
```bash
# Create test users
node scripts/create-test-users.js

# Seed sample data
psql $DATABASE_URL -f supabase/seed.sql
```

## TESTING CHECKLIST

- [ ] All user roles can login
- [ ] Role permissions enforced
- [ ] Orders create successfully
- [ ] Batches move through pipeline
- [ ] Quality checks recorded
- [ ] Issues tracked and resolved
- [ ] Worker tasks completed
- [ ] Reports generated
- [ ] Analytics display correctly
- [ ] Admin functions work
- [ ] Mobile interface responsive
- [ ] Themes switch properly
- [ ] Data persists correctly
- [ ] RLS policies enforced
- [ ] API endpoints secure

Start with authentication, then test each module systematically. Document any bugs found with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Error messages/console logs