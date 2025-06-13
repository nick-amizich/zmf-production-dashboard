# Production Tracking Module - Implementation Plan

## Module Overview

The Production Tracking module manages the flow of orders through production stages, batch management, worker assignments, and real-time status updates. This is the core operational module that drives daily production activities.

## Dependencies

### External Dependencies
- React DnD (drag-and-drop)
- date-fns (date management)
- @tanstack/react-query (data fetching)

### Internal Dependencies
- Authentication Module
- Core Database Module

## Key Features

1. **Production Pipeline View**: Visual kanban board showing orders in each stage
2. **Batch Management**: Create and manage production batches
3. **Stage Assignments**: Assign workers to specific stages
4. **Time Tracking**: Track time spent on each stage
5. **Production Calendar**: Schedule and view production timeline

## Database Enhancements

### Additional Tables

```sql
-- Production schedules
CREATE TABLE production_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  stage production_stage NOT NULL,
  scheduled_date DATE NOT NULL,
  assigned_worker_id UUID REFERENCES workers(id),
  estimated_hours DECIMAL(4,2),
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'delayed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(batch_id, stage)
);

-- Stage transitions log
CREATE TABLE stage_transitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  from_stage production_stage,
  to_stage production_stage NOT NULL,
  transitioned_by UUID REFERENCES workers(id),
  notes TEXT,
  quality_check_id UUID REFERENCES quality_checks(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker availability
CREATE TABLE worker_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available_hours DECIMAL(3,1) DEFAULT 8.0,
  assigned_hours DECIMAL(3,1) DEFAULT 0.0,
  notes TEXT,
  UNIQUE(worker_id, date)
);
```

### Database Functions

```sql
-- Calculate batch progress
CREATE OR REPLACE FUNCTION calculate_batch_progress(batch_uuid UUID)
RETURNS TABLE (
  total_stages INTEGER,
  completed_stages INTEGER,
  progress_percentage DECIMAL(5,2),
  estimated_remaining_hours DECIMAL(6,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH stage_counts AS (
    SELECT 
      COUNT(DISTINCT sa.stage) as total,
      COUNT(DISTINCT CASE WHEN sa.completed_at IS NOT NULL THEN sa.stage END) as completed
    FROM stage_assignments sa
    WHERE sa.batch_id = batch_uuid
  ),
  remaining_hours AS (
    SELECT 
      SUM(mps.estimated_hours) as hours
    FROM batch_orders bo
    JOIN orders o ON bo.order_id = o.id
    JOIN model_production_stages mps ON o.model_id = mps.model_id
    LEFT JOIN stage_assignments sa ON sa.batch_id = bo.batch_id AND sa.stage = mps.stage
    WHERE bo.batch_id = batch_uuid
    AND sa.completed_at IS NULL
  )
  SELECT 
    sc.total::INTEGER,
    sc.completed::INTEGER,
    CASE 
      WHEN sc.total > 0 THEN ROUND((sc.completed::DECIMAL / sc.total::DECIMAL) * 100, 2)
      ELSE 0
    END as progress_percentage,
    COALESCE(rh.hours, 0) as estimated_remaining_hours
  FROM stage_counts sc, remaining_hours rh;
END;
$$ LANGUAGE plpgsql;

-- Get available workers for a stage
CREATE OR REPLACE FUNCTION get_available_workers(
  stage production_stage,
  date DATE
)
RETURNS TABLE (
  worker_id UUID,
  worker_name TEXT,
  available_hours DECIMAL(3,1),
  skill_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.name,
    COALESCE(wa.available_hours - wa.assigned_hours, 8.0) as available_hours,
    CASE 
      WHEN pm.quality_pass_rate > 95 THEN 'expert'
      WHEN pm.quality_pass_rate > 85 THEN 'skilled'
      ELSE 'standard'
    END as skill_level
  FROM workers w
  LEFT JOIN worker_availability wa ON w.id = wa.worker_id AND wa.date = $2
  LEFT JOIN production_metrics pm ON w.id = pm.worker_id AND pm.stage = $1
  WHERE 
    w.is_active = true
    AND $1 = ANY(w.specializations)
    AND COALESCE(wa.available_hours - wa.assigned_hours, 8.0) > 0
  ORDER BY skill_level DESC, available_hours DESC;
END;
$$ LANGUAGE plpgsql;
```

## UI Components

### 1. Production Pipeline Board

```typescript
// components/production/pipeline-board.tsx
interface PipelineColumn {
  stage: ProductionStage
  batches: BatchWithOrders[]
  workers: Worker[]
}

export function PipelineBoard() {
  const stages = ['Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 'Final Assembly', 'Acoustic QC', 'Shipping']
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-7 gap-4">
        {stages.map(stage => (
          <StageColumn 
            key={stage}
            stage={stage}
            onDropBatch={handleBatchMove}
          />
        ))}
      </div>
    </DndProvider>
  )
}
```

### 2. Batch Management Interface

```typescript
// components/production/batch-manager.tsx
export function BatchManager() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  
  return (
    <div className="space-y-6">
      <BatchCreator 
        selectedOrders={selectedOrders}
        onCreateBatch={handleCreateBatch}
      />
      
      <ActiveBatches 
        onSelectBatch={handleSelectBatch}
      />
      
      <BatchDetails 
        batchId={selectedBatchId}
        onAssignWorker={handleAssignWorker}
        onUpdateStage={handleUpdateStage}
      />
    </div>
  )
}
```

### 3. Production Calendar

```typescript
// components/production/production-calendar.tsx
export function ProductionCalendar() {
  const [view, setView] = useState<'week' | 'month'>('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  return (
    <div className="space-y-4">
      <CalendarControls 
        view={view}
        onViewChange={setView}
        onDateChange={setSelectedDate}
      />
      
      <CalendarGrid 
        view={view}
        date={selectedDate}
        schedules={schedules}
        onScheduleClick={handleScheduleClick}
        onDragSchedule={handleReschedule}
      />
      
      <WorkerAvailability 
        date={selectedDate}
        workers={workers}
      />
    </div>
  )
}
```

### 4. Stage Assignment Modal

```typescript
// components/production/stage-assignment-modal.tsx
export function StageAssignmentModal({ 
  batch, 
  stage, 
  onAssign 
}: StageAssignmentModalProps) {
  const { data: availableWorkers } = useQuery({
    queryKey: ['available-workers', stage, batch.id],
    queryFn: () => getAvailableWorkers(stage, new Date())
  })
  
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Worker to {stage}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <BatchInfo batch={batch} />
          
          <WorkerList 
            workers={availableWorkers}
            onSelectWorker={handleSelectWorker}
          />
          
          <EstimatedTime 
            batch={batch}
            stage={stage}
            worker={selectedWorker}
          />
        </div>
        
        <DialogFooter>
          <Button onClick={() => onAssign(selectedWorker)}>
            Assign Worker
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## API Endpoints

### 1. Batch Management

```typescript
// app/api/batches/route.ts
export async function POST(request: NextRequest) {
  const logContext = ApiLogger.logRequest(request)
  
  try {
    const { orderIds, priority, notes } = await request.json()
    
    // Validate orders
    const orders = await validateOrders(orderIds)
    
    // Create batch
    const batch = await createBatch({
      batch_number: generateBatchNumber(),
      priority,
      notes
    })
    
    // Assign orders to batch
    await assignOrdersToBatch(batch.id, orderIds)
    
    // Create initial stage assignments
    await createInitialStageAssignments(batch.id)
    
    // Log success
    logBusiness('Batch created', 'PRODUCTION', { 
      batchId: batch.id, 
      orderCount: orderIds.length 
    })
    
    const response = NextResponse.json({ batch })
    ApiLogger.logResponse(logContext, response, 'Batch created successfully')
    return response
    
  } catch (error) {
    logError(error as Error, 'BATCH_CREATION', { orderIds })
    const errorResponse = NextResponse.json(
      { error: 'Failed to create batch' }, 
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Batch creation failed')
    return errorResponse
  }
}
```

### 2. Stage Transitions

```typescript
// app/api/batches/[batchId]/transition/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  return withAuth(async (req, { worker }) => {
    const { toStage, orderIds, qualityCheckId } = await req.json()
    
    // Validate stage transition
    const batch = await getBatch(params.batchId)
    if (!isValidTransition(batch.current_stage, toStage)) {
      return NextResponse.json(
        { error: 'Invalid stage transition' },
        { status: 400 }
      )
    }
    
    // Update batch stage
    await updateBatchStage(params.batchId, toStage)
    
    // Log transitions
    await logStageTransitions({
      batchId: params.batchId,
      orderIds,
      fromStage: batch.current_stage,
      toStage,
      workerId: worker.id,
      qualityCheckId
    })
    
    // Update metrics
    await updateProductionMetrics(worker.id, toStage)
    
    return NextResponse.json({ success: true })
  })(request)
}
```

## Real-time Updates

### 1. Production Updates Channel

```typescript
// hooks/use-production-updates.ts
export function useProductionUpdates() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('production-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'batches' 
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['batches'] })
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: 'Batch Updated',
              description: `Batch ${payload.new.batch_number} moved to ${payload.new.current_stage}`
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stage_assignments'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['assignments'] })
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
```

## Mobile Interface

### 1. Worker Stage View

```typescript
// components/mobile/worker-stage-view.tsx
export function WorkerStageView() {
  const { worker } = useAuth()
  const { data: assignments } = useMyAssignments(worker.id)
  
  return (
    <div className="space-y-4 p-4">
      <CurrentAssignment 
        assignment={assignments?.current}
        onStart={handleStartWork}
        onComplete={handleCompleteWork}
      />
      
      <UpcomingAssignments 
        assignments={assignments?.upcoming}
      />
      
      <QuickActions 
        onReportIssue={handleReportIssue}
        onRequestHelp={handleRequestHelp}
      />
    </div>
  )
}
```

## Testing Strategy

### 1. Unit Tests
- Test stage transition validation
- Test batch creation logic
- Test worker assignment algorithm

### 2. Integration Tests
- Test complete batch workflow
- Test real-time updates
- Test calendar scheduling

### 3. E2E Tests
- Test drag-and-drop functionality
- Test mobile worker flow
- Test manager oversight features

## Performance Optimization

1. **Lazy Load Stage Data**: Only load visible stages
2. **Virtualize Long Lists**: Use react-window for large batch lists
3. **Debounce Updates**: Batch real-time updates
4. **Cache Worker Availability**: Use React Query caching
5. **Optimize Queries**: Use database views for complex queries

## Success Metrics

- Average stage transition time < 30 seconds
- Worker assignment accuracy > 95%
- Real-time update latency < 1 second
- Mobile interface load time < 2 seconds
- Zero lost production data