# Quick Test Scenarios - ZMF Production Dashboard

## 🚀 CRITICAL PATH TESTING (Test These First!)

### Scenario 1: Complete Order-to-Shipping Flow
1. **Login** as manager@zmfheadphones.com
2. Navigate to **Production** page
3. Click **"Create Batch"** button
4. In the modal, click **"Create New Order"**
5. Fill in:
   - Customer: "Test Customer"
   - Email: test@example.com
   - Select Model: "Vérité Closed"
   - Wood Type: "African Blackwood"
   - Priority: "High"
6. Click **"Add to Batch"**
7. Click **"Create Batch"**
8. **Drag the batch card** from "Wood Cutting" to "Sanding"
9. In the transition modal, assign a worker
10. Login as that worker in another browser
11. Go to **/worker/dashboard**
12. Find the assigned task and click **"Complete"**
13. Fill the quality checklist (all pass)
14. Submit
15. Back as manager, continue dragging through all stages

**Expected Results:**
- Batch appears in pipeline
- Each stage transition creates history record
- Workers see assignments
- Quality checks are recorded
- Batch reaches shipping stage

### Scenario 2: Quality Issue Flow
1. As a worker, when completing a task
2. In quality checklist, mark one item as **"Fail"**
3. Click **"Report Issue"**
4. Select severity: **"Hold"**
5. Add description: "Wood grain defect"
6. Upload a photo (any image)
7. Submit

**Then as Manager:**
1. Go to **/quality** page
2. See the issue in "Active Issues"
3. Click **"Resolve"**
4. Add notes: "Repaired successfully"
5. Submit

**Expected Results:**
- Issue appears in quality dashboard
- Batch shows warning indicator
- Resolution updates issue status
- Quality metrics update

### Scenario 3: Worker Performance Tracking
1. As admin, go to **/management/workers**
2. View the leaderboard
3. Click on a worker to see details
4. Check their:
   - Completed units
   - Quality score
   - Efficiency rating
   - Specializations

**Expected Results:**
- Performance metrics calculate correctly
- Charts display data
- Availability grid shows schedule

## 📋 MODULE-BY-MODULE TESTING

### Authentication Module
```
✓ Test login with each role
✓ Test logout
✓ Test accessing restricted routes
✓ Test with invalid credentials
✓ Test "forgot password" flow
```

### Production Module
```
✓ Create manual order
✓ Create batch from orders
✓ Drag batch between stages
✓ Assign workers to stages
✓ View batch details
✓ Filter/search batches
```

### Quality Module
```
✓ Complete quality checklist
✓ Report an issue
✓ Upload issue photos
✓ Resolve issues
✓ View quality metrics
✓ Filter by date range
```

### Worker Module
```
✓ View assigned tasks
✓ Start/stop timer
✓ Complete tasks
✓ Set availability
✓ View notifications
✓ Check performance stats
```

### Analytics Module
```
✓ View production metrics
✓ Check quality trends
✓ Compare worker performance
✓ Analyze revenue data
✓ Switch between time periods
```

### Admin Module
```
✓ Create new user
✓ Edit user roles
✓ Deactivate user
✓ Change system settings
✓ Switch themes
✓ View audit logs
```

## 🔍 DATABASE VERIFICATION QUERIES

Run these in Supabase SQL editor to verify data:

```sql
-- Check active workers
SELECT name, email, role, is_active 
FROM workers 
ORDER BY role, name;

-- View recent orders
SELECT o.*, c.name as customer_name, hm.model_name 
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN headphone_models hm ON o.model_id = hm.id
ORDER BY o.created_at DESC
LIMIT 10;

-- Check batch pipeline
SELECT b.*, 
  COUNT(DISTINCT o.id) as order_count,
  b.current_stage,
  w.name as assigned_worker
FROM batches b
LEFT JOIN orders o ON o.batch_id = b.id
LEFT JOIN stage_assignments sa ON sa.batch_id = b.id 
  AND sa.stage = b.current_stage
LEFT JOIN workers w ON sa.worker_id = w.id
GROUP BY b.id, w.name
ORDER BY b.created_at DESC;

-- Quality check summary
SELECT 
  qc.stage,
  COUNT(*) as total_checks,
  SUM(CASE WHEN qc.passed THEN 1 ELSE 0 END) as passed,
  ROUND(AVG(CASE WHEN qc.passed THEN 1 ELSE 0 END) * 100, 2) as pass_rate
FROM quality_checks qc
GROUP BY qc.stage
ORDER BY qc.stage;

-- Active issues
SELECT qi.*, b.batch_number, w.name as reported_by
FROM quality_issues qi
JOIN batches b ON qi.batch_id = b.id
JOIN workers w ON qi.reported_by = w.id
WHERE qi.resolved_at IS NULL
ORDER BY qi.created_at DESC;
```

## 🐛 COMMON ISSUES TO WATCH FOR

1. **Batch Won't Drag:**
   - Check user role (must be manager/admin)
   - Verify batch current_stage
   - Check browser console for errors

2. **Worker Can't See Tasks:**
   - Verify assignment exists in database
   - Check worker specializations match stage
   - Ensure worker is active

3. **Quality Metrics Not Updating:**
   - Verify quality_checks are being created
   - Check date filters
   - Refresh the page

4. **Login Redirects to Login:**
   - Check Supabase auth settings
   - Verify user has worker record
   - Check is_active status

5. **Images Not Uploading:**
   - Check Supabase storage bucket exists
   - Verify storage policies
   - Check file size limits

## 🎯 PERFORMANCE TESTING

1. **Create 50+ orders** and batch them
2. **Drag multiple batches** rapidly
3. **Generate large reports** (30+ days)
4. **Open multiple worker sessions**
5. **Upload many photos** for issues

## 🔐 SECURITY TESTING

1. Try accessing `/admin` as worker
2. Try editing another worker's task
3. Try SQL injection in search fields
4. Check API endpoints require auth
5. Verify RLS policies work

## 📱 MOBILE TESTING

1. Open `/worker/mobile` on phone
2. Test touch targets
3. Try camera upload
4. Check responsive layout
5. Test offline capability

Remember: Test as different user roles to ensure permissions work correctly!