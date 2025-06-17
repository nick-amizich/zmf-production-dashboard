# ZMF Production Dashboard Context

## System Overview
The ZMF Production Dashboard is a manufacturing execution system (MES) for custom headphone production. It tracks orders through a 7-stage production pipeline with real-time updates, quality control, and worker management.

## Production Pipeline Stages
1. **Intake** - Initial order processing and wood selection
2. **Sanding** - Wood preparation and shaping
3. **Finishing** - Staining and coating application
4. **Sub-Assembly** - Component preparation and partial assembly
5. **Final Assembly** - Complete headphone assembly
6. **Acoustic QC** - Sound quality testing and validation
7. **Shipping** - Packaging and fulfillment

## Key Features to Enhance

### 1. Real-Time Production Tracking
- Live batch status updates across all stages
- Drag-and-drop batch management between stages
- Visual pipeline with progress indicators
- Bottleneck identification and alerts

### 2. Quality Control System
- Photo documentation at each stage
- Defect tracking and categorization
- Rework queue management
- Quality metrics and trends

### 3. Worker Management
- Role-based access (worker, lead, manager, admin)
- Task assignments and workload balancing
- Performance tracking and metrics
- Mobile-optimized interfaces for factory floor

### 4. Inventory Management
- Wood stock tracking (types, grades, quantities)
- Component inventory levels
- Material reservations for orders
- Low stock alerts and reorder points

### 5. Build Tracking
- Individual build progress through stages
- Time tracking per stage
- Worker assignments per build
- Quality history per unit

### 6. Analytics & Reporting
- Production efficiency metrics
- Quality trends and defect rates
- Worker performance analytics
- Inventory turnover rates

## Technical Considerations

### Frontend Guidelines
- Mobile-first design for factory workers
- Real-time updates using Supabase subscriptions
- Offline capability for critical functions
- Touch-friendly interfaces for tablets
- Clear visual feedback for actions
- Theme CSS variables only (no hardcoded colors)

### Backend Guidelines
- Efficient RLS policies for multi-tenant data
- Atomic operations for stage transitions
- Comprehensive audit logging
- Performance optimization for real-time queries
- Proper error handling and recovery

### Database Optimization
- Indexes on frequently queried columns
- Materialized views for analytics
- Efficient join strategies
- Partitioning for time-series data

## Priority Improvements

1. **Enhanced Dashboard Views**
   - Executive summary with KPIs
   - Production floor view with live updates
   - Manager cockpit with analytics

2. **Advanced Scheduling**
   - Capacity planning
   - Lead time predictions
   - Resource optimization

3. **Quality Improvements**
   - Statistical process control
   - Defect pattern analysis
   - Supplier quality tracking

4. **Worker Experience**
   - Simplified mobile interfaces
   - Voice input capability
   - Gamification elements

5. **Integration Enhancements**
   - Better Shopify sync
   - Email notifications
   - SMS alerts for critical issues