// Extension types for new database tables
// These will be merged with the auto-generated types once migrations are pushed

import { Database } from './database.types'

export type BuildStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'rework' | 'cancelled'
export type BuildStage = 'Intake' | 'Sanding' | 'Finishing' | 'Sub-Assembly' | 'Final Assembly' | 'Acoustic QC' | 'Shipping' | 'Completed' | 'On Hold' | 'Rework'
export type QualityStatus = 'good' | 'warning' | 'critical' | 'hold' | 'fail'
export type DefectCategory = 'cosmetic' | 'structural' | 'acoustic' | 'electrical' | 'assembly' | 'material' | 'other'
export type DefectSeverity = 'minor' | 'major' | 'critical'
export type MaterialType = 'wood' | 'driver' | 'chassis' | 'cable' | 'connector' | 'padding' | 'hardware' | 'packaging' | 'finishing' | 'adhesive' | 'other'
export type CarrierType = 'ups' | 'fedex' | 'usps' | 'dhl' | 'other'
export type ShipmentStatus = 'pending' | 'ready' | 'in_transit' | 'delivered' | 'returned' | 'cancelled' | 'exception'

export interface ExtendedDatabase extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      builds: {
        Row: {
          id: string
          serial_number: string
          order_id: string
          batch_id: string | null
          current_stage: BuildStage
          status: BuildStatus
          quality_status: QualityStatus | null
          started_at: string | null
          completed_at: string | null
          estimated_completion: string | null
          notes: string | null
          is_rework: boolean
          rework_count: number
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<ExtendedDatabase['public']['Tables']['builds']['Row']> & {
          serial_number: string
          order_id: string
        }
        Update: Partial<ExtendedDatabase['public']['Tables']['builds']['Row']>
        Relationships: [
          {
            foreignKeyName: 'builds_order_id_fkey'
            columns: ['order_id']
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'builds_batch_id_fkey'
            columns: ['batch_id']
            referencedRelation: 'batches'
            referencedColumns: ['id']
          }
        ]
      }
      build_stage_history: {
        Row: {
          id: string
          build_id: string
          from_stage: BuildStage | null
          to_stage: BuildStage
          transitioned_by: string | null
          transitioned_at: string
          reason: string | null
          quality_status: QualityStatus | null
        }
        Insert: Omit<ExtendedDatabase['public']['Tables']['build_stage_history']['Row'], 'id' | 'transitioned_at'>
        Update: Partial<ExtendedDatabase['public']['Tables']['build_stage_history']['Row']>
      }
      wood_inventory: {
        Row: {
          id: string
          wood_type: string
          supplier: string | null
          lot_number: string | null
          quantity_board_feet: number
          quantity_reserved: number
          quantity_available: number
          cost_per_board_foot: number | null
          total_cost: number | null
          location: string | null
          grade: string | null
          notes: string | null
          reorder_point: number
          reorder_quantity: number
          received_date: string
          expiry_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<ExtendedDatabase['public']['Tables']['wood_inventory']['Row']> & {
          wood_type: string
        }
        Update: Partial<ExtendedDatabase['public']['Tables']['wood_inventory']['Row']>
      }
      component_inventory: {
        Row: {
          id: string
          component_type: string
          component_name: string
          sku: string | null
          quantity_on_hand: number
          quantity_reserved: number
          quantity_available: number
          unit_cost: number | null
          total_value: number | null
          supplier: string | null
          location: string | null
          reorder_point: number
          reorder_quantity: number
          lead_time_days: number
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<ExtendedDatabase['public']['Tables']['component_inventory']['Row']> & {
          component_type: string
          component_name: string
        }
        Update: Partial<ExtendedDatabase['public']['Tables']['component_inventory']['Row']>
      }
      time_logs: {
        Row: {
          id: string
          worker_id: string
          log_type: 'work' | 'break' | 'meeting' | 'training' | 'other'
          reference_type: 'build' | 'batch' | 'order' | 'general'
          reference_id: string
          build_id: string | null
          batch_id: string | null
          stage: BuildStage | null
          started_at: string
          ended_at: string | null
          duration_minutes: number | null
          is_active: boolean
          is_billable: boolean
          break_time_minutes: number
          overtime_minutes: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<ExtendedDatabase['public']['Tables']['time_logs']['Row']> & {
          worker_id: string
          log_type: 'work' | 'break' | 'meeting' | 'training' | 'other'
          reference_type: 'build' | 'batch' | 'order' | 'general'
          reference_id: string
          started_at: string
        }
        Update: Partial<ExtendedDatabase['public']['Tables']['time_logs']['Row']>
      }
      shipments: {
        Row: {
          id: string
          shipment_number: string
          order_id: string | null
          build_id: string | null
          batch_id: string | null
          customer_id: string | null
          carrier: CarrierType
          service_type: string | null
          tracking_number: string | null
          status: ShipmentStatus
          ship_date: string | null
          estimated_delivery: string | null
          actual_delivery: string | null
          shipping_cost: number | null
          insurance_value: number | null
          weight_lbs: number | null
          dimensions_length: number | null
          dimensions_width: number | null
          dimensions_height: number | null
          ship_to_name: string | null
          ship_to_address1: string | null
          ship_to_address2: string | null
          ship_to_city: string | null
          ship_to_state: string | null
          ship_to_postal_code: string | null
          ship_to_country: string
          ship_to_phone: string | null
          ship_to_email: string | null
          signature_required: boolean
          saturday_delivery: boolean
          packaging_type: string | null
          contents_description: string | null
          special_instructions: string | null
          label_url: string | null
          invoice_url: string | null
          customs_info: any | null
          created_by: string | null
          packed_by: string | null
          shipped_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<ExtendedDatabase['public']['Tables']['shipments']['Row']> & {
          carrier: CarrierType
        }
        Update: Partial<ExtendedDatabase['public']['Tables']['shipments']['Row']>
      }
      defects: {
        Row: {
          id: string
          build_id: string
          batch_id: string | null
          stage: BuildStage
          defect_category: DefectCategory
          defect_type: string
          severity: DefectSeverity
          description: string
          root_cause: string | null
          discovered_by: string | null
          discovered_at: string
          resolved_by: string | null
          resolved_at: string | null
          resolution_notes: string | null
          time_to_resolve_minutes: number | null
          requires_rework: boolean
          photos: string[]
          created_at: string
          updated_at: string
        }
        Insert: Partial<ExtendedDatabase['public']['Tables']['defects']['Row']> & {
          build_id: string
          stage: BuildStage
          defect_category: DefectCategory
          defect_type: string
          description: string
        }
        Update: Partial<ExtendedDatabase['public']['Tables']['defects']['Row']>
      }
      rework_history: {
        Row: {
          id: string
          build_id: string
          defect_id: string | null
          rework_number: number
          from_stage: BuildStage
          to_stage: BuildStage
          reason: string
          initiated_by: string | null
          initiated_at: string
          assigned_to: string | null
          started_at: string | null
          completed_at: string | null
          time_spent_minutes: number | null
          materials_used: any | null
          cost_estimate: number | null
          outcome: 'success' | 'partial' | 'failed' | 'scrapped' | 'pending' | null
          quality_check_passed: boolean | null
          quality_checked_by: string | null
          quality_checked_at: string | null
          notes: string | null
          photos_before: string[]
          photos_after: string[]
          created_at: string
          updated_at: string
        }
        Insert: Partial<ExtendedDatabase['public']['Tables']['rework_history']['Row']> & {
          build_id: string
          rework_number: number
          from_stage: BuildStage
          to_stage: BuildStage
          reason: string
        }
        Update: Partial<ExtendedDatabase['public']['Tables']['rework_history']['Row']>
      }
      material_consumption: {
        Row: {
          id: string
          build_id: string
          batch_id: string | null
          order_id: string | null
          consumed_at: string
          consumed_by: string | null
          material_type: MaterialType
          inventory_type: 'wood' | 'component'
          inventory_id: string
          quantity_consumed: number
          unit_of_measure: string
          stage: BuildStage
          waste_quantity: number
          waste_reason: string | null
          unit_cost: number | null
          total_cost: number | null
          notes: string | null
          created_at: string
        }
        Insert: Partial<ExtendedDatabase['public']['Tables']['material_consumption']['Row']> & {
          build_id: string
          material_type: MaterialType
          inventory_type: 'wood' | 'component'
          inventory_id: string
          quantity_consumed: number
          unit_of_measure: string
          stage: BuildStage
        }
        Update: Partial<ExtendedDatabase['public']['Tables']['material_consumption']['Row']>
      }
    }
    Views: Database['public']['Views'] & {
      rework_queue: {
        Row: {
          build_id: string
          serial_number: string
          current_stage: BuildStage
          order_number: string
          model_name: string
          defect_id: string | null
          defect_category: DefectCategory | null
          defect_type: string | null
          severity: DefectSeverity | null
          defect_description: string | null
          rework_id: string | null
          target_stage: BuildStage | null
          assigned_to: string | null
          assigned_worker_name: string | null
          initiated_at: string | null
          started_at: string | null
          rework_status: 'pending' | 'in_progress' | 'completed'
          hours_in_queue: number
        }
      }
      production_overview: {
        Row: {
          batch_id: string
          batch_number: string
          priority: string | null
          current_stage: string | null
          quality_status: string | null
          total_builds: number
          completed_builds: number
          completion_percentage: number
          builds_in_progress: number
          builds_in_rework: number
          builds_with_issues: number
          started_at: string | null
          last_completed_at: string | null
          workers_assigned: number
        }
      }
    }
  }
}

// Helper types for common operations
export interface BuildWithDetails extends ExtendedDatabase['public']['Tables']['builds']['Row'] {
  order: ExtendedDatabase['public']['Tables']['orders']['Row']
  batch?: ExtendedDatabase['public']['Tables']['batches']['Row']
  defects?: ExtendedDatabase['public']['Tables']['defects']['Row'][]
  rework_history?: ExtendedDatabase['public']['Tables']['rework_history']['Row'][]
  time_logs?: ExtendedDatabase['public']['Tables']['time_logs']['Row'][]
}

export interface InventoryItem {
  id: string
  type: 'wood' | 'component'
  name: string
  quantity_available: number
  reorder_point: number
  unit_cost: number | null
}

export interface MaterialRequirement {
  material_type: MaterialType
  material_name: string
  quantity_required: number
  unit_of_measure: string
  inventory_id?: string
  available_quantity?: number
  needs_ordering: boolean
}