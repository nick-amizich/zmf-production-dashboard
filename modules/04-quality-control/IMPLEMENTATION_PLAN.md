# Quality Control Module - Implementation Plan

## Module Overview

The Quality Control module ensures product quality through systematic checks, issue tracking, and resolution workflows. It integrates with production tracking to maintain quality standards at every stage.

## Dependencies

### External Dependencies
- react-dropzone (photo upload)
- sharp (image processing)
- @radix-ui/react-checkbox

### Internal Dependencies
- Authentication Module
- Core Database Module  
- Production Tracking Module

## Key Features

1. **Dynamic Quality Checklists**: Stage-specific checklists for each model
2. **Issue Reporting System**: Capture and track quality issues
3. **Photo Documentation**: Upload and manage quality photos
4. **Quality Dashboards**: Real-time quality metrics
5. **Resolution Workflows**: Track issue resolution

## Database Enhancements

### Enhanced Quality Tables

```sql
-- Quality checklist templates
CREATE TABLE quality_checklist_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  model_id UUID REFERENCES headphone_models(id),
  stage production_stage NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(model_id, stage, version)
);

-- Checklist items
CREATE TABLE quality_checklist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES quality_checklist_templates(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_text TEXT NOT NULL,
  severity quality_status NOT NULL DEFAULT 'warning',
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL,
  help_text TEXT,
  photo_required BOOLEAN DEFAULT false
);

-- Enhanced quality checks
CREATE TABLE quality_checks_v2 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  batch_id UUID REFERENCES batches(id),
  stage production_stage NOT NULL,
  worker_id UUID REFERENCES workers(id),
  template_id UUID REFERENCES quality_checklist_templates(id),
  overall_status quality_status NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(order_id, stage)
);

-- Individual check results
CREATE TABLE quality_check_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quality_check_id UUID REFERENCES quality_checks_v2(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES quality_checklist_items(id),
  passed BOOLEAN NOT NULL,
  notes TEXT,
  photo_urls TEXT[]
);

-- Issue categories
CREATE TABLE issue_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_severity quality_status NOT NULL,
  sla_hours INTEGER, -- Service level agreement for resolution
  is_active BOOLEAN DEFAULT true
);

-- Enhanced issues table
CREATE TABLE issues_v2 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  batch_id UUID REFERENCES batches(id),
  stage production_stage NOT NULL,
  category_id UUID REFERENCES issue_categories(id),
  reported_by UUID REFERENCES workers(id),
  assigned_to UUID REFERENCES workers(id),
  severity quality_status NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  root_cause TEXT,
  resolution_notes TEXT,
  photo_urls TEXT[],
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES workers(id),
  time_to_resolution_hours DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ -- Based on SLA
);

-- Issue comments for collaboration
CREATE TABLE issue_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  issue_id UUID REFERENCES issues_v2(id) ON DELETE CASCADE,
  author_id UUID REFERENCES workers(id),
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Quality Metrics Views

```sql
-- Real-time quality metrics
CREATE OR REPLACE VIEW quality_metrics_live AS
SELECT 
  DATE_TRUNC('day', qc.created_at) as date,
  qc.stage,
  hm.name as model_name,
  COUNT(*) as checks_performed,
  COUNT(CASE WHEN qc.overall_status = 'good' THEN 1 END) as passed,
  COUNT(CASE WHEN qc.overall_status IN ('warning', 'critical') THEN 1 END) as failed,
  ROUND(
    COUNT(CASE WHEN qc.overall_status = 'good' THEN 1 END)::DECIMAL / 
    COUNT(*)::DECIMAL * 100, 
    2
  ) as pass_rate,
  AVG(qc.duration_minutes) as avg_check_duration
FROM quality_checks_v2 qc
JOIN orders o ON qc.order_id = o.id
JOIN headphone_models hm ON o.model_id = hm.id
WHERE qc.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', qc.created_at), qc.stage, hm.name;

-- Worker quality performance
CREATE OR REPLACE VIEW worker_quality_performance AS
SELECT 
  w.id as worker_id,
  w.name as worker_name,
  qc.stage,
  COUNT(*) as total_checks,
  ROUND(
    COUNT(CASE WHEN qc.overall_status = 'good' THEN 1 END)::DECIMAL / 
    COUNT(*)::DECIMAL * 100, 
    2
  ) as pass_rate,
  COUNT(DISTINCT i.id) as issues_found,
  AVG(i.time_to_resolution_hours) as avg_resolution_time
FROM workers w
LEFT JOIN quality_checks_v2 qc ON w.id = qc.worker_id
LEFT JOIN issues_v2 i ON w.id = i.reported_by
WHERE qc.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY w.id, w.name, qc.stage;
```

## UI Components

### 1. Quality Check Interface

```typescript
// components/quality/quality-check-form.tsx
export function QualityCheckForm({ 
  order, 
  stage, 
  onComplete 
}: QualityCheckFormProps) {
  const [results, setResults] = useState<ChecklistResults>({})
  const [photos, setPhotos] = useState<PhotoUpload[]>([])
  const { data: checklist } = useQualityChecklist(order.model_id, stage)
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OrderInfo order={order} />
      
      <div className="space-y-4">
        {checklist?.items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            value={results[item.id]}
            onChange={(result) => updateResult(item.id, result)}
            onPhotoAdd={(photo) => addPhoto(item.id, photo)}
          />
        ))}
      </div>
      
      <OverallAssessment 
        results={results}
        onStatusChange={setOverallStatus}
      />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onSaveDraft}>
          Save Draft
        </Button>
        <Button type="submit" disabled={!isComplete}>
          Complete Check
        </Button>
      </div>
    </form>
  )
}
```

### 2. Issue Reporting Modal

```typescript
// components/quality/issue-report-modal.tsx
export function IssueReportModal({ 
  order, 
  batch, 
  stage,
  onSubmit 
}: IssueReportModalProps) {
  const [photos, setPhotos] = useState<File[]>([])
  const { data: categories } = useIssueCategories()
  
  const form = useForm<IssueForm>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      severity: 'warning',
      category_id: '',
      title: '',
      description: ''
    }
  })
  
  return (
    <Dialog>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Report Quality Issue</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="hold">Hold Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Brief description" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={4}
                      placeholder="Describe the issue in detail"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <PhotoUploadZone
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={5}
            />
            
            <DialogFooter>
              <Button type="submit">Report Issue</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### 3. Quality Dashboard

```typescript
// components/quality/quality-dashboard.tsx
export function QualityDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date()
  })
  
  const { data: metrics } = useQualityMetrics(dateRange)
  const { data: issues } = useActiveIssues()
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Pass Rate"
          value={`${metrics?.overallPassRate}%`}
          trend={metrics?.passRateTrend}
          icon={<CheckCircle />}
        />
        
        <MetricCard
          title="Active Issues"
          value={issues?.active.length}
          severity={issues?.criticalCount > 0 ? 'critical' : 'normal'}
          icon={<AlertCircle />}
        />
        
        <MetricCard
          title="Avg Resolution Time"
          value={`${metrics?.avgResolutionHours}h`}
          trend={metrics?.resolutionTrend}
          icon={<Clock />}
        />
        
        <MetricCard
          title="Checks Today"
          value={metrics?.checksToday}
          icon={<Activity />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QualityTrendChart data={metrics?.trends} />
        <StageQualityBreakdown data={metrics?.byStage} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <IssuesByCategory issues={issues?.byCategory} />
        <TopQualityPerformers workers={metrics?.topWorkers} />
        <RecentIssues issues={issues?.recent} />
      </div>
    </div>
  )
}
```

### 4. Issue Resolution Workflow

```typescript
// components/quality/issue-resolution.tsx
export function IssueResolution({ issue }: { issue: Issue }) {
  const [isResolving, setIsResolving] = useState(false)
  const { mutate: resolveIssue } = useResolveIssue()
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{issue.title}</CardTitle>
            <Badge variant={getSeverityVariant(issue.severity)}>
              {issue.severity}
            </Badge>
          </div>
          <IssueActions issue={issue} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <IssueTimeline issue={issue} />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Reported By</Label>
            <p>{issue.reported_by.name}</p>
          </div>
          <div>
            <Label>Assigned To</Label>
            <AssigneeSelector 
              issue={issue}
              onAssign={handleAssign}
            />
          </div>
        </div>
        
        <IssuePhotos photos={issue.photo_urls} />
        
        <IssueComments 
          issueId={issue.id}
          onAddComment={handleAddComment}
        />
        
        {!issue.is_resolved && (
          <ResolutionForm
            isOpen={isResolving}
            onToggle={() => setIsResolving(!isResolving)}
            onSubmit={(resolution) => {
              resolveIssue({ 
                issueId: issue.id, 
                ...resolution 
              })
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
```

## Photo Management

### 1. Photo Upload Service

```typescript
// lib/quality/photo-service.ts
export class QualityPhotoService {
  private supabase: SupabaseClient
  
  async uploadPhotos(
    photos: File[],
    context: { orderId: string, stage: string }
  ): Promise<string[]> {
    const uploadPromises = photos.map(async (photo) => {
      // Compress image
      const compressed = await this.compressImage(photo)
      
      // Generate unique path
      const path = `${context.orderId}/${context.stage}/${Date.now()}-${photo.name}`
      
      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('quality-photos')
        .upload(path, compressed, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) throw error
      
      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('quality-photos')
        .getPublicUrl(path)
      
      return publicUrl
    })
    
    return Promise.all(uploadPromises)
  }
  
  private async compressImage(file: File): Promise<Blob> {
    // Implement image compression logic
    // Max width: 1920px, quality: 85%
    return file
  }
}
```

## API Endpoints

### 1. Quality Check Submission

```typescript
// app/api/quality/checks/route.ts
export async function POST(request: NextRequest) {
  return withAuth(async (req, { worker }) => {
    const { 
      orderId, 
      batchId, 
      stage, 
      results, 
      overallStatus,
      photos 
    } = await req.json()
    
    // Validate checklist completion
    const template = await getActiveTemplate(orderId, stage)
    const validation = validateChecklistResults(template, results)
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Incomplete checklist', missing: validation.missing },
        { status: 400 }
      )
    }
    
    // Create quality check record
    const qualityCheck = await createQualityCheck({
      order_id: orderId,
      batch_id: batchId,
      stage,
      worker_id: worker.id,
      template_id: template.id,
      overall_status: overallStatus
    })
    
    // Save individual results
    await saveCheckResults(qualityCheck.id, results)
    
    // Upload photos if provided
    if (photos.length > 0) {
      const photoUrls = await uploadQualityPhotos(photos, {
        orderId,
        stage,
        checkId: qualityCheck.id
      })
      await updateCheckPhotos(qualityCheck.id, photoUrls)
    }
    
    // Update order/batch status if needed
    if (overallStatus === 'critical' || overallStatus === 'hold') {
      await handleQualityFailure(orderId, batchId, stage, overallStatus)
    }
    
    // Log the check
    logBusiness('Quality check completed', 'QUALITY_CONTROL', {
      orderId,
      stage,
      status: overallStatus,
      workerId: worker.id
    })
    
    return NextResponse.json({ 
      success: true, 
      qualityCheckId: qualityCheck.id 
    })
  })(request)
}
```

## Real-time Quality Alerts

```typescript
// hooks/use-quality-alerts.ts
export function useQualityAlerts() {
  useEffect(() => {
    const channel = supabase
      .channel('quality-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'issues_v2',
          filter: 'severity=eq.critical'
        },
        (payload) => {
          // Show critical issue alert
          toast({
            title: 'Critical Quality Issue',
            description: payload.new.title,
            variant: 'destructive',
            action: (
              <ToastAction 
                altText="View issue"
                onClick={() => navigate(`/issues/${payload.new.id}`)}
              >
                View
              </ToastAction>
            )
          })
          
          // Play alert sound for managers
          if (hasRole('manager')) {
            playAlertSound()
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
```

## Testing Strategy

### 1. Unit Tests
- Test checklist validation logic
- Test quality metric calculations
- Test photo compression

### 2. Integration Tests
- Test complete quality check flow
- Test issue reporting and resolution
- Test real-time alerts

### 3. E2E Tests
- Test mobile quality check interface
- Test photo upload workflow
- Test dashboard interactions

## Performance Optimization

1. **Lazy Load Photos**: Load thumbnails first, full size on demand
2. **Cache Checklists**: Cache templates in React Query
3. **Batch Photo Uploads**: Upload multiple photos in parallel
4. **Optimize Queries**: Use materialized views for dashboards
5. **Compress Images**: Client-side compression before upload

## Success Metrics

- Quality check completion rate > 99%
- Average check duration < 5 minutes
- Issue resolution time < SLA targets
- Photo upload success rate > 99.5%
- Dashboard load time < 2 seconds