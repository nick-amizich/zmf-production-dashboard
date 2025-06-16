# Production Dashboard Status - Real Data vs Development Needed

## ✅ Currently Using Real Data

### Production Pipeline (`/production`)
- **Batches**: Real data from `batches` table
  - batch_number
  - priority (standard, rush, expedite)
  - current_stage
  - quality_status
  - created_at
  - is_complete
- **Orders**: Real data from `orders` table via batch_orders
  - order details
  - customer information
  - headphone model
  - priority
- **Batch Movement**: Functional stage transitions via API

## ❌ Components Using Placeholder Data

### 1. ProductionDashboard (`production-dashboard.tsx`)
**Status**: Not used in main app, contains hardcoded mock data
**Mock Data**:
- Workers array (lines 17-72)
- Orders array (lines 74-153)
- Metrics (hardcoded)

### 2. ProductionManagerDashboard (`production-manager-dashboard.tsx`)
**Status**: Used in front-screen but with mock data
**Mock Data**:
- Dashboard metrics (lines 97-123)
- Production stages with fake workers (lines 125-225)
- Alert counts
- Manager name hardcoded as "John Smith"

## 🚧 Missing Features That Need Development

### 1. Worker Assignments
**What's Missing**:
- No real worker assignments to stages
- No tracking of who is working on what batch
- No time tracking for workers
**Tables Exist**: `stage_assignments` table exists but not being used

### 2. Real-time Metrics
**What's Missing**:
- Active order counts per stage
- Worker utilization rates
- Daily/weekly completion targets
- Quality metrics aggregation
- Bottleneck detection

### 3. Worker Status Tracking
**What's Missing**:
- Worker availability (working/available/break)
- Current task assignment
- Time elapsed on current task
- Worker specializations utilization

### 4. Quality Tracking
**What's Missing**:
- Quality check records per stage
- Quality trend analysis
- Issue tracking and categorization
- Quality rate calculations

### 5. Production Alerts
**What's Missing**:
- Real alert system for delays
- Capacity warnings
- Quality issues
- Deadline tracking

### 6. Time Tracking
**What's Missing**:
- Average time per stage calculations
- Actual vs estimated time tracking
- Historical performance data

## 📋 Implementation Priority

1. **Worker Assignment System** - Connect workers to batches/stages
2. **Basic Metrics** - Count active orders, calculate utilization
3. **Time Tracking** - Track start/end times for stage work
4. **Alert System** - Basic alerts for capacity and delays
5. **Quality Integration** - Connect quality checks to dashboard