# Quality Checklist Templates Migration

This migration creates the `quality_checklist_templates` table for managing quality control checklists.

## To apply this migration:

1. Run the migration using Supabase CLI:
```bash
npx supabase db push
```

Or manually in Supabase SQL Editor:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `20250616000000_add_quality_checklist_templates.sql`
4. Run the query

## Features Added:

1. **Database Table**: `quality_checklist_templates`
   - Stores checklist items for each production stage
   - Supports model-specific checklists
   - Default checklists (model_id = NULL) apply to all models

2. **Admin Interface**: `/admin/checklists`
   - Managers can add/edit/delete checklist items
   - Organize by model and production stage
   - Set required vs optional items
   - Reorder items with drag handles
   - Copy default checklist to specific models

3. **Quality Service Integration**
   - `QualityService.getQualityChecklist()` now reads from database
   - Falls back to default checklist if no model-specific one exists
   - Used in quality checks at `/quality`

## RLS Policies:
- Managers/Admins can manage all checklist templates
- All authenticated users can view active templates

## Default Data:
The migration includes default checklist items for all production stages:
- Intake (4 items)
- Sanding (4 items)
- Finishing (4 items)
- Sub-Assembly (4 items)
- Final Assembly (4 items)
- Acoustic QC (4 items)
- Shipping (4 items)