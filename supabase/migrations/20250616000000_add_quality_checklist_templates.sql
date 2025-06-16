-- Create quality checklist templates table
CREATE TABLE IF NOT EXISTS public.quality_checklist_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID REFERENCES public.headphone_models(id) ON DELETE CASCADE,
  stage production_stage NOT NULL,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.workers(id),
  
  -- Unique constraint to prevent duplicate items for same model/stage/category
  UNIQUE(model_id, stage, category, item)
);

-- Enable RLS
ALTER TABLE public.quality_checklist_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Managers can manage checklist templates
CREATE POLICY "Managers can manage checklist templates" ON public.quality_checklist_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workers
      WHERE auth_user_id = auth.uid()
      AND role IN ('manager', 'admin')
      AND is_active = true
    )
  );

-- All authenticated users can view active templates
CREATE POLICY "Workers can view active checklist templates" ON public.quality_checklist_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_checklist_templates_model_stage ON public.quality_checklist_templates(model_id, stage);
CREATE INDEX idx_checklist_templates_active ON public.quality_checklist_templates(is_active);

-- Add updated_at trigger
CREATE TRIGGER update_quality_checklist_templates_updated_at
  BEFORE UPDATE ON public.quality_checklist_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default checklist items for all stages (model_id NULL means default for all models)
INSERT INTO public.quality_checklist_templates (model_id, stage, category, item, description, is_required, sort_order) VALUES
-- Intake stage
(NULL, 'Intake', 'Wood Quality', 'Check for cracks or defects', 'Inspect wood surfaces for any cracks, splits, or natural defects', true, 1),
(NULL, 'Intake', 'Wood Quality', 'Verify wood type matches order', 'Confirm the wood species matches what was ordered', true, 2),
(NULL, 'Intake', 'Measurements', 'Verify dimensions', 'Check that wood dimensions match specifications', true, 3),
(NULL, 'Intake', 'Documentation', 'Order details confirmed', 'Verify order specifications are complete and accurate', true, 4),

-- Sanding stage
(NULL, 'Sanding', 'Surface', 'Check smoothness (220 grit)', 'Ensure surface is smooth to 220 grit standard', true, 1),
(NULL, 'Sanding', 'Surface', 'No visible scratches', 'Verify no scratches or marks remain', true, 2),
(NULL, 'Sanding', 'Shape', 'Maintain original contours', 'Ensure original shape is preserved during sanding', true, 3),
(NULL, 'Sanding', 'Edges', 'Edges properly finished', 'Check all edges are smooth and properly rounded', true, 4),

-- Finishing stage
(NULL, 'Finishing', 'Coating', 'Even coat application', 'Verify finish is applied evenly across all surfaces', true, 1),
(NULL, 'Finishing', 'Coating', 'No runs or drips', 'Check for any runs, drips, or pooling of finish', true, 2),
(NULL, 'Finishing', 'Coating', 'Proper cure time observed', 'Confirm appropriate drying/curing time was followed', true, 3),
(NULL, 'Finishing', 'Quality', 'Color consistency', 'Ensure color matches sample and is consistent', true, 4),

-- Sub-Assembly stage
(NULL, 'Sub-Assembly', 'Components', 'All parts present', 'Verify all required components are available', true, 1),
(NULL, 'Sub-Assembly', 'Fit', 'Components fit properly', 'Check that all parts fit together correctly', true, 2),
(NULL, 'Sub-Assembly', 'Alignment', 'Proper alignment verified', 'Ensure all components are properly aligned', true, 3),
(NULL, 'Sub-Assembly', 'Hardware', 'Fasteners secure', 'Verify all fasteners are properly tightened', false, 4),

-- Final Assembly stage
(NULL, 'Final Assembly', 'Assembly', 'All components secure', 'Confirm all parts are securely attached', true, 1),
(NULL, 'Final Assembly', 'Function', 'Moving parts operate smoothly', 'Test all moving parts for smooth operation', true, 2),
(NULL, 'Final Assembly', 'Aesthetics', 'No visible assembly marks', 'Check for any visible marks from assembly process', true, 3),
(NULL, 'Final Assembly', 'Completeness', 'All accessories included', 'Verify all accessories and components are included', true, 4),

-- Acoustic QC stage
(NULL, 'Acoustic QC', 'Sound', 'Frequency response within spec', 'Test frequency response meets specifications', true, 1),
(NULL, 'Acoustic QC', 'Sound', 'No rattles or buzzing', 'Listen for any unwanted noises or vibrations', true, 2),
(NULL, 'Acoustic QC', 'Sound', 'Channel balance verified', 'Check left/right channel balance', true, 3),
(NULL, 'Acoustic QC', 'Build', 'Driver seating verified', 'Ensure drivers are properly seated and secure', true, 4),

-- Shipping stage
(NULL, 'Shipping', 'Packaging', 'Proper protective packaging', 'Verify adequate protection for shipping', true, 1),
(NULL, 'Shipping', 'Documentation', 'All documents included', 'Check warranty card, manual, and other docs', true, 2),
(NULL, 'Shipping', 'Final Check', 'Serial number recorded', 'Record serial number in system', true, 3),
(NULL, 'Shipping', 'Presentation', 'Clean and presentable', 'Final cleaning and presentation check', true, 4);

-- Add comment
COMMENT ON TABLE public.quality_checklist_templates IS 'Templates for quality control checklists by model and production stage';