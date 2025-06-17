export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      batch_orders: {
        Row: {
          batch_id: string
          order_id: string
        }
        Insert: {
          batch_id: string
          order_id: string
        }
        Update: {
          batch_id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_orders_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          batch_number: string
          completed_builds: number | null
          completion_percentage: number | null
          created_at: string | null
          current_stage: Database["public"]["Enums"]["production_stage"] | null
          id: string
          is_complete: boolean | null
          priority: Database["public"]["Enums"]["batch_priority"] | null
          quality_status: Database["public"]["Enums"]["quality_status"] | null
          total_builds: number | null
          updated_at: string | null
        }
        Insert: {
          batch_number: string
          completed_builds?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["production_stage"] | null
          id?: string
          is_complete?: boolean | null
          priority?: Database["public"]["Enums"]["batch_priority"] | null
          quality_status?: Database["public"]["Enums"]["quality_status"] | null
          total_builds?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_number?: string
          completed_builds?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["production_stage"] | null
          id?: string
          is_complete?: boolean | null
          priority?: Database["public"]["Enums"]["batch_priority"] | null
          quality_status?: Database["public"]["Enums"]["quality_status"] | null
          total_builds?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bill_of_materials: {
        Row: {
          created_at: string | null
          id: string
          is_optional: boolean | null
          material_name: string
          material_sku: string | null
          material_type: string
          model_id: string
          notes: string | null
          quantity_required: number
          stage: string
          unit_of_measure: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_optional?: boolean | null
          material_name: string
          material_sku?: string | null
          material_type: string
          model_id: string
          notes?: string | null
          quantity_required: number
          stage: string
          unit_of_measure: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_optional?: boolean | null
          material_name?: string
          material_sku?: string | null
          material_type?: string
          model_id?: string
          notes?: string | null
          quantity_required?: number
          stage?: string
          unit_of_measure?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_of_materials_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "headphone_models"
            referencedColumns: ["id"]
          },
        ]
      }
      build_stage_history: {
        Row: {
          build_id: string
          completed_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          performed_by: string | null
          stage: string
          started_at: string | null
        }
        Insert: {
          build_id: string
          completed_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          stage: string
          started_at?: string | null
        }
        Update: {
          build_id?: string
          completed_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          stage?: string
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "build_stage_history_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_stage_history_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "rework_queue"
            referencedColumns: ["build_id"]
          },
          {
            foreignKeyName: "build_stage_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_stage_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      builds: {
        Row: {
          assigned_to: string | null
          batch_id: string | null
          completed_at: string | null
          created_at: string | null
          current_stage: string
          headphone_model_id: string | null
          id: string
          is_rework: boolean | null
          model_code: string | null
          notes: string | null
          order_id: string
          priority: number | null
          quality_status: string | null
          rework_count: number | null
          serial_number: string
          started_at: string | null
          status: string
          target_completion_date: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          batch_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_stage?: string
          headphone_model_id?: string | null
          id?: string
          is_rework?: boolean | null
          model_code?: string | null
          notes?: string | null
          order_id: string
          priority?: number | null
          quality_status?: string | null
          rework_count?: number | null
          serial_number: string
          started_at?: string | null
          status?: string
          target_completion_date?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          batch_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_stage?: string
          headphone_model_id?: string | null
          id?: string
          is_rework?: boolean | null
          model_code?: string | null
          notes?: string | null
          order_id?: string
          priority?: number | null
          quality_status?: string | null
          rework_count?: number | null
          serial_number?: string
          started_at?: string | null
          status?: string
          target_completion_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builds_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builds_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builds_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builds_headphone_model_id_fkey"
            columns: ["headphone_model_id"]
            isOneToOne: false
            referencedRelation: "headphone_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      component_inventory: {
        Row: {
          component_name: string
          component_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          lead_time_days: number | null
          location: string | null
          notes: string | null
          quantity_available: number | null
          quantity_on_hand: number
          quantity_reserved: number
          reorder_point: number | null
          reorder_quantity: number | null
          sku: string | null
          supplier: string | null
          total_value: number | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          component_name: string
          component_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          location?: string | null
          notes?: string | null
          quantity_available?: number | null
          quantity_on_hand?: number
          quantity_reserved?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          sku?: string | null
          supplier?: string | null
          total_value?: number | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          component_name?: string
          component_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          location?: string | null
          notes?: string | null
          quantity_available?: number | null
          quantity_on_hand?: number
          quantity_reserved?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          sku?: string | null
          supplier?: string | null
          total_value?: number | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          shopify_customer_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          shopify_customer_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          shopify_customer_id?: string | null
        }
        Relationships: []
      }
      daily_time_summary: {
        Row: {
          billable_hours: number | null
          break_hours: number | null
          builds_worked: number | null
          created_at: string | null
          id: string
          overtime_hours: number | null
          productive_hours: number | null
          stages_completed: number | null
          total_hours: number | null
          updated_at: string | null
          work_date: string
          worker_id: string
        }
        Insert: {
          billable_hours?: number | null
          break_hours?: number | null
          builds_worked?: number | null
          created_at?: string | null
          id?: string
          overtime_hours?: number | null
          productive_hours?: number | null
          stages_completed?: number | null
          total_hours?: number | null
          updated_at?: string | null
          work_date: string
          worker_id: string
        }
        Update: {
          billable_hours?: number | null
          break_hours?: number | null
          builds_worked?: number | null
          created_at?: string | null
          id?: string
          overtime_hours?: number | null
          productive_hours?: number | null
          stages_completed?: number | null
          total_hours?: number | null
          updated_at?: string | null
          work_date?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_time_summary_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_time_summary_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      defect_types: {
        Row: {
          category: string
          created_at: string | null
          defect_code: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          resolution_guide: string | null
          typical_severity: string | null
          typical_stage: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          defect_code: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          resolution_guide?: string | null
          typical_severity?: string | null
          typical_stage?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          defect_code?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          resolution_guide?: string | null
          typical_severity?: string | null
          typical_stage?: string | null
        }
        Relationships: []
      }
      defects: {
        Row: {
          batch_id: string | null
          build_id: string
          created_at: string | null
          defect_category: string
          defect_type: string
          description: string
          discovered_at: string | null
          discovered_by: string | null
          id: string
          photos: string[] | null
          requires_rework: boolean | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          root_cause: string | null
          severity: string
          stage: string
          time_to_resolve_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          batch_id?: string | null
          build_id: string
          created_at?: string | null
          defect_category: string
          defect_type: string
          description: string
          discovered_at?: string | null
          discovered_by?: string | null
          id?: string
          photos?: string[] | null
          requires_rework?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          root_cause?: string | null
          severity?: string
          stage: string
          time_to_resolve_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_id?: string | null
          build_id?: string
          created_at?: string | null
          defect_category?: string
          defect_type?: string
          description?: string
          discovered_at?: string | null
          discovered_by?: string | null
          id?: string
          photos?: string[] | null
          requires_rework?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          root_cause?: string | null
          severity?: string
          stage?: string
          time_to_resolve_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defects_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "rework_queue"
            referencedColumns: ["build_id"]
          },
          {
            foreignKeyName: "defects_discovered_by_fkey"
            columns: ["discovered_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_discovered_by_fkey"
            columns: ["discovered_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      headphone_models: {
        Row: {
          base_production_hours: number
          complexity: Database["public"]["Enums"]["model_complexity"]
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          wood_types: Database["public"]["Enums"]["wood_type"][]
        }
        Insert: {
          base_production_hours: number
          complexity: Database["public"]["Enums"]["model_complexity"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          wood_types?: Database["public"]["Enums"]["wood_type"][]
        }
        Update: {
          base_production_hours?: number
          complexity?: Database["public"]["Enums"]["model_complexity"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          wood_types?: Database["public"]["Enums"]["wood_type"][]
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          id: string
          inventory_id: string
          inventory_type: string
          notes: string | null
          performed_by: string | null
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          total_cost: number | null
          transaction_date: string | null
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          id?: string
          inventory_id: string
          inventory_type: string
          notes?: string | null
          performed_by?: string | null
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_date?: string | null
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          id?: string
          inventory_id?: string
          inventory_type?: string
          notes?: string | null
          performed_by?: string | null
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_date?: string | null
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assigned_to: string | null
          batch_id: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          is_resolved: boolean | null
          order_id: string | null
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["quality_status"]
          stage: Database["public"]["Enums"]["production_stage"]
        }
        Insert: {
          assigned_to?: string | null
          batch_id?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          is_resolved?: boolean | null
          order_id?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: Database["public"]["Enums"]["quality_status"]
          stage: Database["public"]["Enums"]["production_stage"]
        }
        Update: {
          assigned_to?: string | null
          batch_id?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          is_resolved?: boolean | null
          order_id?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["quality_status"]
          stage?: Database["public"]["Enums"]["production_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      material_consumption: {
        Row: {
          batch_id: string | null
          build_id: string
          consumed_at: string | null
          consumed_by: string | null
          created_at: string | null
          id: string
          inventory_id: string
          inventory_type: string
          material_type: string
          notes: string | null
          order_id: string | null
          quantity_consumed: number
          stage: string
          total_cost: number | null
          unit_cost: number | null
          unit_of_measure: string
          waste_quantity: number | null
          waste_reason: string | null
        }
        Insert: {
          batch_id?: string | null
          build_id: string
          consumed_at?: string | null
          consumed_by?: string | null
          created_at?: string | null
          id?: string
          inventory_id: string
          inventory_type: string
          material_type: string
          notes?: string | null
          order_id?: string | null
          quantity_consumed: number
          stage: string
          total_cost?: number | null
          unit_cost?: number | null
          unit_of_measure: string
          waste_quantity?: number | null
          waste_reason?: string | null
        }
        Update: {
          batch_id?: string | null
          build_id?: string
          consumed_at?: string | null
          consumed_by?: string | null
          created_at?: string | null
          id?: string
          inventory_id?: string
          inventory_type?: string
          material_type?: string
          notes?: string | null
          order_id?: string | null
          quantity_consumed?: number
          stage?: string
          total_cost?: number | null
          unit_cost?: number | null
          unit_of_measure?: string
          waste_quantity?: number | null
          waste_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_consumption_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_consumption_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_consumption_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "rework_queue"
            referencedColumns: ["build_id"]
          },
          {
            foreignKeyName: "material_consumption_consumed_by_fkey"
            columns: ["consumed_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_consumption_consumed_by_fkey"
            columns: ["consumed_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_consumption_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      material_reservations: {
        Row: {
          id: string
          inventory_id: string
          inventory_type: string
          notes: string | null
          quantity: number
          released_at: string | null
          reservation_type: string
          reserved_at: string | null
          reserved_by: string | null
          reserved_for_id: string
          reserved_for_type: string
          status: string | null
        }
        Insert: {
          id?: string
          inventory_id: string
          inventory_type: string
          notes?: string | null
          quantity: number
          released_at?: string | null
          reservation_type: string
          reserved_at?: string | null
          reserved_by?: string | null
          reserved_for_id: string
          reserved_for_type: string
          status?: string | null
        }
        Update: {
          id?: string
          inventory_id?: string
          inventory_type?: string
          notes?: string | null
          quantity?: number
          released_at?: string | null
          reservation_type?: string
          reserved_at?: string | null
          reserved_by?: string | null
          reserved_for_id?: string
          reserved_for_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_reservations_reserved_by_fkey"
            columns: ["reserved_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_reservations_reserved_by_fkey"
            columns: ["reserved_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      material_waste_tracking: {
        Row: {
          batch_id: string | null
          build_id: string | null
          corrective_action: string | null
          cost_impact: number | null
          created_at: string | null
          id: string
          inventory_id: string
          inventory_type: string
          material_type: string
          photos: string[] | null
          preventable: boolean | null
          quantity_wasted: number
          reported_by: string | null
          stage: string | null
          waste_category: string
          waste_date: string | null
          waste_reason: string
        }
        Insert: {
          batch_id?: string | null
          build_id?: string | null
          corrective_action?: string | null
          cost_impact?: number | null
          created_at?: string | null
          id?: string
          inventory_id: string
          inventory_type: string
          material_type: string
          photos?: string[] | null
          preventable?: boolean | null
          quantity_wasted: number
          reported_by?: string | null
          stage?: string | null
          waste_category: string
          waste_date?: string | null
          waste_reason: string
        }
        Update: {
          batch_id?: string | null
          build_id?: string | null
          corrective_action?: string | null
          cost_impact?: number | null
          created_at?: string | null
          id?: string
          inventory_id?: string
          inventory_type?: string
          material_type?: string
          photos?: string[] | null
          preventable?: boolean | null
          quantity_wasted?: number
          reported_by?: string | null
          stage?: string | null
          waste_category?: string
          waste_date?: string | null
          waste_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_waste_tracking_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_waste_tracking_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_waste_tracking_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "rework_queue"
            referencedColumns: ["build_id"]
          },
          {
            foreignKeyName: "material_waste_tracking_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_waste_tracking_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      option_values: {
        Row: {
          available: boolean | null
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          option_id: string | null
          price_modifier: number | null
          sku: string | null
        }
        Insert: {
          available?: boolean | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          option_id?: string | null
          price_modifier?: number | null
          sku?: string | null
        }
        Update: {
          available?: boolean | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          option_id?: string | null
          price_modifier?: number | null
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customizations: Json | null
          id: string
          model_id: string | null
          notes: string | null
          order_number: string
          priority: Database["public"]["Enums"]["batch_priority"] | null
          shopify_order_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          updated_at: string | null
          wood_type: Database["public"]["Enums"]["wood_type"]
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customizations?: Json | null
          id?: string
          model_id?: string | null
          notes?: string | null
          order_number: string
          priority?: Database["public"]["Enums"]["batch_priority"] | null
          shopify_order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
          wood_type: Database["public"]["Enums"]["wood_type"]
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customizations?: Json | null
          id?: string
          model_id?: string | null
          notes?: string | null
          order_number?: string
          priority?: Database["public"]["Enums"]["batch_priority"] | null
          shopify_order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
          wood_type?: Database["public"]["Enums"]["wood_type"]
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "headphone_models"
            referencedColumns: ["id"]
          },
        ]
      }
      product_configurations: {
        Row: {
          active: boolean | null
          base_price: number
          base_sku: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          shopify_product_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          base_price: number
          base_sku: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          shopify_product_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          base_price?: number
          base_sku?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          shopify_product_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_options: {
        Row: {
          configuration_id: string | null
          created_at: string | null
          display_order: number | null
          id: string
          name: string
          required: boolean | null
          type: string
        }
        Insert: {
          configuration_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          name: string
          required?: boolean | null
          type: string
        }
        Update: {
          configuration_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          name?: string
          required?: boolean | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "product_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      production_metrics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          model_id: string | null
          quality_pass_rate: number | null
          stage: Database["public"]["Enums"]["production_stage"]
          total_time_minutes: number | null
          units_completed: number | null
          worker_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          model_id?: string | null
          quality_pass_rate?: number | null
          stage: Database["public"]["Enums"]["production_stage"]
          total_time_minutes?: number | null
          units_completed?: number | null
          worker_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          model_id?: string | null
          quality_pass_rate?: number | null
          stage?: Database["public"]["Enums"]["production_stage"]
          total_time_minutes?: number | null
          units_completed?: number | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_metrics_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "headphone_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_metrics_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_metrics_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checklist_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          item: string
          model_id: string | null
          sort_order: number | null
          stage: Database["public"]["Enums"]["production_stage"]
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          item: string
          model_id?: string | null
          sort_order?: number | null
          stage: Database["public"]["Enums"]["production_stage"]
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          item?: string
          model_id?: string | null
          sort_order?: number | null
          stage?: Database["public"]["Enums"]["production_stage"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checklist_templates_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "headphone_models"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checks: {
        Row: {
          batch_id: string | null
          checklist_data: Json
          created_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          overall_status: Database["public"]["Enums"]["quality_status"]
          photos: string[] | null
          stage: Database["public"]["Enums"]["production_stage"]
          worker_id: string | null
        }
        Insert: {
          batch_id?: string | null
          checklist_data?: Json
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          overall_status: Database["public"]["Enums"]["quality_status"]
          photos?: string[] | null
          stage: Database["public"]["Enums"]["production_stage"]
          worker_id?: string | null
        }
        Update: {
          batch_id?: string | null
          checklist_data?: Json
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          overall_status?: Database["public"]["Enums"]["quality_status"]
          photos?: string[] | null
          stage?: Database["public"]["Enums"]["production_stage"]
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_checks_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      rework_history: {
        Row: {
          assigned_to: string | null
          build_id: string
          completed_at: string | null
          cost_estimate: number | null
          created_at: string | null
          defect_id: string | null
          from_stage: string
          id: string
          initiated_at: string | null
          initiated_by: string | null
          materials_used: Json | null
          notes: string | null
          outcome: string | null
          photos_after: string[] | null
          photos_before: string[] | null
          quality_check_passed: boolean | null
          quality_checked_at: string | null
          quality_checked_by: string | null
          reason: string
          rework_number: number
          started_at: string | null
          time_spent_minutes: number | null
          to_stage: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          build_id: string
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          defect_id?: string | null
          from_stage: string
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          materials_used?: Json | null
          notes?: string | null
          outcome?: string | null
          photos_after?: string[] | null
          photos_before?: string[] | null
          quality_check_passed?: boolean | null
          quality_checked_at?: string | null
          quality_checked_by?: string | null
          reason: string
          rework_number: number
          started_at?: string | null
          time_spent_minutes?: number | null
          to_stage: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          build_id?: string
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          defect_id?: string | null
          from_stage?: string
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          materials_used?: Json | null
          notes?: string | null
          outcome?: string | null
          photos_after?: string[] | null
          photos_before?: string[] | null
          quality_check_passed?: boolean | null
          quality_checked_at?: string | null
          quality_checked_by?: string | null
          reason?: string
          rework_number?: number
          started_at?: string | null
          time_spent_minutes?: number | null
          to_stage?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rework_history_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rework_history_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rework_history_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rework_history_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "rework_queue"
            referencedColumns: ["build_id"]
          },
          {
            foreignKeyName: "rework_history_defect_id_fkey"
            columns: ["defect_id"]
            isOneToOne: false
            referencedRelation: "defects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rework_history_defect_id_fkey"
            columns: ["defect_id"]
            isOneToOne: false
            referencedRelation: "rework_queue"
            referencedColumns: ["defect_id"]
          },
          {
            foreignKeyName: "rework_history_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rework_history_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rework_history_quality_checked_by_fkey"
            columns: ["quality_checked_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rework_history_quality_checked_by_fkey"
            columns: ["quality_checked_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_items: {
        Row: {
          build_id: string | null
          description: string | null
          id: string
          notes: string | null
          quantity: number | null
          serial_number: string | null
          shipment_id: string
          value: number | null
          weight_lbs: number | null
        }
        Insert: {
          build_id?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          quantity?: number | null
          serial_number?: string | null
          shipment_id: string
          value?: number | null
          weight_lbs?: number | null
        }
        Update: {
          build_id?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          quantity?: number | null
          serial_number?: string | null
          shipment_id?: string
          value?: number | null
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_items_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_items_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "rework_queue"
            referencedColumns: ["build_id"]
          },
          {
            foreignKeyName: "shipment_items_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_tracking_events: {
        Row: {
          created_at: string | null
          event_date: string
          event_description: string | null
          event_type: string
          id: string
          location_city: string | null
          location_country: string | null
          location_state: string | null
          raw_data: Json | null
          shipment_id: string
        }
        Insert: {
          created_at?: string | null
          event_date: string
          event_description?: string | null
          event_type: string
          id?: string
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          raw_data?: Json | null
          shipment_id: string
        }
        Update: {
          created_at?: string | null
          event_date?: string
          event_description?: string | null
          event_type?: string
          id?: string
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          raw_data?: Json | null
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_tracking_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery: string | null
          batch_id: string | null
          build_id: string | null
          carrier: string
          contents_description: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          customs_info: Json | null
          dimensions_height: number | null
          dimensions_length: number | null
          dimensions_width: number | null
          estimated_delivery: string | null
          id: string
          insurance_value: number | null
          invoice_url: string | null
          label_url: string | null
          order_id: string | null
          packaging_type: string | null
          packed_by: string | null
          saturday_delivery: boolean | null
          service_type: string | null
          ship_date: string | null
          ship_to_address1: string | null
          ship_to_address2: string | null
          ship_to_city: string | null
          ship_to_country: string | null
          ship_to_email: string | null
          ship_to_name: string | null
          ship_to_phone: string | null
          ship_to_postal_code: string | null
          ship_to_state: string | null
          shipment_number: string
          shipped_by: string | null
          shipping_cost: number | null
          signature_required: boolean | null
          special_instructions: string | null
          status: string
          tracking_number: string | null
          updated_at: string | null
          weight_lbs: number | null
        }
        Insert: {
          actual_delivery?: string | null
          batch_id?: string | null
          build_id?: string | null
          carrier: string
          contents_description?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customs_info?: Json | null
          dimensions_height?: number | null
          dimensions_length?: number | null
          dimensions_width?: number | null
          estimated_delivery?: string | null
          id?: string
          insurance_value?: number | null
          invoice_url?: string | null
          label_url?: string | null
          order_id?: string | null
          packaging_type?: string | null
          packed_by?: string | null
          saturday_delivery?: boolean | null
          service_type?: string | null
          ship_date?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_email?: string | null
          ship_to_name?: string | null
          ship_to_phone?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          shipment_number?: string
          shipped_by?: string | null
          shipping_cost?: number | null
          signature_required?: boolean | null
          special_instructions?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
        }
        Update: {
          actual_delivery?: string | null
          batch_id?: string | null
          build_id?: string | null
          carrier?: string
          contents_description?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customs_info?: Json | null
          dimensions_height?: number | null
          dimensions_length?: number | null
          dimensions_width?: number | null
          estimated_delivery?: string | null
          id?: string
          insurance_value?: number | null
          invoice_url?: string | null
          label_url?: string | null
          order_id?: string | null
          packaging_type?: string | null
          packed_by?: string | null
          saturday_delivery?: boolean | null
          service_type?: string | null
          ship_date?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_email?: string | null
          ship_to_name?: string | null
          ship_to_phone?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          shipment_number?: string
          shipped_by?: string | null
          shipping_cost?: number | null
          signature_required?: boolean | null
          special_instructions?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "rework_queue"
            referencedColumns: ["build_id"]
          },
          {
            foreignKeyName: "shipments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_packed_by_fkey"
            columns: ["packed_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_packed_by_fkey"
            columns: ["packed_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_shipped_by_fkey"
            columns: ["shipped_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_shipped_by_fkey"
            columns: ["shipped_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_api_logs: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string | null
          product_id: string | null
          shopify_domain: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          product_id?: string | null
          shopify_domain?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          product_id?: string | null
          shopify_domain?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      stage_assignments: {
        Row: {
          assigned_worker_id: string | null
          batch_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          quality_status: Database["public"]["Enums"]["quality_status"] | null
          stage: Database["public"]["Enums"]["production_stage"]
          started_at: string | null
          time_spent_minutes: number | null
        }
        Insert: {
          assigned_worker_id?: string | null
          batch_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          quality_status?: Database["public"]["Enums"]["quality_status"] | null
          stage: Database["public"]["Enums"]["production_stage"]
          started_at?: string | null
          time_spent_minutes?: number | null
        }
        Update: {
          assigned_worker_id?: string | null
          batch_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          quality_status?: Database["public"]["Enums"]["quality_status"] | null
          stage?: Database["public"]["Enums"]["production_stage"]
          started_at?: string | null
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_assignments_assigned_worker_id_fkey"
            columns: ["assigned_worker_id"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_assignments_assigned_worker_id_fkey"
            columns: ["assigned_worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_assignments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          action: string
          context: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          context: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          context?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      time_log_breaks: {
        Row: {
          break_type: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string
          time_log_id: string
        }
        Insert: {
          break_type: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at: string
          time_log_id: string
        }
        Update: {
          break_type?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          time_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_log_breaks_time_log_id_fkey"
            columns: ["time_log_id"]
            isOneToOne: false
            referencedRelation: "time_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      time_logs: {
        Row: {
          batch_id: string | null
          break_time_minutes: number | null
          build_id: string | null
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          is_billable: boolean | null
          log_type: string
          notes: string | null
          overtime_minutes: number | null
          reference_id: string
          reference_type: string
          stage: string | null
          started_at: string
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          batch_id?: string | null
          break_time_minutes?: number | null
          build_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          is_billable?: boolean | null
          log_type: string
          notes?: string | null
          overtime_minutes?: number | null
          reference_id: string
          reference_type: string
          stage?: string | null
          started_at: string
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          batch_id?: string | null
          break_time_minutes?: number | null
          build_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          is_billable?: boolean | null
          log_type?: string
          notes?: string | null
          overtime_minutes?: number | null
          reference_id?: string
          reference_type?: string
          stage?: string | null
          started_at?: string
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "rework_queue"
            referencedColumns: ["build_id"]
          },
          {
            foreignKeyName: "time_logs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      wood_inventory: {
        Row: {
          cost_per_board_foot: number | null
          created_at: string | null
          expiry_date: string | null
          grade: string | null
          id: string
          is_active: boolean | null
          location: string | null
          lot_number: string | null
          notes: string | null
          quantity_available: number | null
          quantity_board_feet: number
          quantity_reserved: number
          received_date: string | null
          reorder_point: number | null
          reorder_quantity: number | null
          supplier: string | null
          total_cost: number | null
          updated_at: string | null
          wood_type: string
        }
        Insert: {
          cost_per_board_foot?: number | null
          created_at?: string | null
          expiry_date?: string | null
          grade?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          lot_number?: string | null
          notes?: string | null
          quantity_available?: number | null
          quantity_board_feet?: number
          quantity_reserved?: number
          received_date?: string | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          supplier?: string | null
          total_cost?: number | null
          updated_at?: string | null
          wood_type: string
        }
        Update: {
          cost_per_board_foot?: number | null
          created_at?: string | null
          expiry_date?: string | null
          grade?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          lot_number?: string | null
          notes?: string | null
          quantity_available?: number | null
          quantity_board_feet?: number
          quantity_reserved?: number
          received_date?: string | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          supplier?: string | null
          total_cost?: number | null
          updated_at?: string | null
          wood_type?: string
        }
        Relationships: []
      }
      worker_availability: {
        Row: {
          created_at: string | null
          date: string
          id: string
          is_available: boolean | null
          notes: string | null
          shift: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          shift?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          shift?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_availability_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_availability_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          worker_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
          worker_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_notifications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_notifications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          approved_at: string | null
          approved_by: string | null
          auth_user_id: string | null
          created_at: string | null
          email: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          name: string
          rejection_reason: string | null
          requested_at: string | null
          role: Database["public"]["Enums"]["worker_role"]
          specializations:
            | Database["public"]["Enums"]["production_stage"][]
            | null
          updated_at: string | null
        }
        Insert: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          rejection_reason?: string | null
          requested_at?: string | null
          role?: Database["public"]["Enums"]["worker_role"]
          specializations?:
            | Database["public"]["Enums"]["production_stage"][]
            | null
          updated_at?: string | null
        }
        Update: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          rejection_reason?: string | null
          requested_at?: string | null
          role?: Database["public"]["Enums"]["worker_role"]
          specializations?:
            | Database["public"]["Enums"]["production_stage"][]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      pending_worker_approvals: {
        Row: {
          email: string | null
          email_confirmed_at: string | null
          hourly_rate: number | null
          id: string | null
          last_sign_in_at: string | null
          name: string | null
          requested_at: string | null
          specializations:
            | Database["public"]["Enums"]["production_stage"][]
            | null
        }
        Relationships: []
      }
      rework_queue: {
        Row: {
          assigned_to: string | null
          assigned_worker_name: string | null
          build_id: string | null
          current_stage: string | null
          defect_category: string | null
          defect_description: string | null
          defect_id: string | null
          defect_type: string | null
          hours_in_queue: number | null
          initiated_at: string | null
          model_name: string | null
          order_number: string | null
          rework_id: string | null
          rework_status: string | null
          serial_number: string | null
          severity: string | null
          started_at: string | null
          target_stage: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rework_history_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "pending_worker_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rework_history_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_worker: {
        Args: { worker_id: string; approver_notes?: string }
        Returns: undefined
      }
      begin_transaction: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_build_material_cost: {
        Args: { p_build_id: string }
        Returns: {
          total_cost: number
          wood_cost: number
          component_cost: number
          finishing_cost: number
          waste_cost: number
        }[]
      }
      calculate_shipping_cost: {
        Args: {
          p_carrier: string
          p_service_type: string
          p_weight: number
          p_dimensions: Json
          p_destination_postal: string
        }
        Returns: number
      }
      check_inventory_levels: {
        Args: Record<PropertyKey, never>
        Returns: {
          inventory_type: string
          item_name: string
          quantity_available: number
          reorder_point: number
          needs_reorder: boolean
        }[]
      }
      commit_transaction: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_rework: {
        Args: {
          p_rework_id: string
          p_outcome: string
          p_quality_passed: boolean
          p_notes?: string
          p_photos_after?: string[]
        }
        Returns: boolean
      }
      consume_materials: {
        Args: { p_build_id: string; p_stage: string; p_materials: Json }
        Returns: boolean
      }
      create_batch_with_orders: {
        Args: {
          p_batch_number: string
          p_priority: Database["public"]["Enums"]["batch_priority"]
          p_order_ids: string[]
          p_worker_id: string
          p_notes?: string
        }
        Returns: string
      }
      create_shipment: {
        Args: {
          p_order_id?: string
          p_build_id?: string
          p_batch_id?: string
          p_carrier?: string
          p_service_type?: string
          p_ship_to?: Json
        }
        Returns: string
      }
      end_time_log: {
        Args: { p_log_id: string; p_notes?: string }
        Returns: boolean
      }
      generate_serial_number: {
        Args: { model_code: string }
        Returns: string
      }
      generate_shipment_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_time_log: {
        Args: Record<PropertyKey, never>
        Returns: {
          log_id: string
          log_type: string
          reference_type: string
          reference_id: string
          build_id: string
          batch_id: string
          stage: string
          started_at: string
          elapsed_minutes: number
        }[]
      }
      get_current_worker_approval_status: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["approval_status"]
      }
      get_current_worker_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_defect_statistics: {
        Args: { p_start_date?: string; p_end_date?: string }
        Returns: {
          defect_category: string
          defect_count: number
          avg_resolution_time_hours: number
          critical_count: number
          major_count: number
          minor_count: number
          rework_success_rate: number
        }[]
      }
      get_material_requirements: {
        Args: { p_model_id: string }
        Returns: {
          stage: string
          material_type: string
          material_name: string
          material_sku: string
          quantity_required: number
          unit_of_measure: string
          is_optional: boolean
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["worker_role"]
      }
      is_current_user_approved: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_valid_stage_transition: {
        Args: {
          p_from_stage: Database["public"]["Enums"]["production_stage"]
          p_to_stage: Database["public"]["Enums"]["production_stage"]
        }
        Returns: boolean
      }
      is_worker_approved: {
        Args: { worker_id: string }
        Returns: boolean
      }
      reject_worker: {
        Args: { worker_id: string; reason: string }
        Returns: undefined
      }
      report_defect_and_rework: {
        Args: {
          p_build_id: string
          p_stage: string
          p_defect_category: string
          p_defect_type: string
          p_severity: string
          p_description: string
          p_target_stage: string
          p_photos?: string[]
        }
        Returns: string
      }
      reserve_materials: {
        Args: {
          p_inventory_type: string
          p_inventory_id: string
          p_quantity: number
          p_for_type: string
          p_for_id: string
          p_notes?: string
        }
        Returns: string
      }
      rollback_transaction: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      start_time_log: {
        Args: {
          p_log_type: string
          p_reference_type: string
          p_reference_id: string
          p_build_id?: string
          p_batch_id?: string
          p_stage?: string
          p_notes?: string
        }
        Returns: string
      }
      transition_batch_stage: {
        Args: {
          p_batch_id: string
          p_to_stage: Database["public"]["Enums"]["production_stage"]
          p_worker_id: string
          p_quality_check_id?: string
          p_notes?: string
        }
        Returns: undefined
      }
      update_batch_statistics: {
        Args: { p_batch_id: string }
        Returns: undefined
      }
      update_daily_time_summary: {
        Args: { p_worker_id: string; p_work_date: string }
        Returns: undefined
      }
      update_shipment_tracking: {
        Args: {
          p_shipment_id: string
          p_tracking_number: string
          p_event_type: string
          p_event_description: string
          p_location?: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      batch_priority: "standard" | "rush" | "expedite"
      model_complexity: "medium" | "high" | "very_high"
      order_status:
        | "pending"
        | "in_production"
        | "completed"
        | "shipped"
        | "on_hold"
      production_stage:
        | "Intake"
        | "Sanding"
        | "Finishing"
        | "Sub-Assembly"
        | "Final Assembly"
        | "Acoustic QC"
        | "Shipping"
      quality_status: "good" | "warning" | "critical" | "hold"
      wood_type:
        | "Sapele"
        | "Cherry"
        | "Walnut"
        | "Ash"
        | "Maple"
        | "Cocobolo"
        | "Katalox"
        | "Ziricote"
        | "Blackwood"
      worker_role: "worker" | "manager" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: ["pending", "approved", "rejected"],
      batch_priority: ["standard", "rush", "expedite"],
      model_complexity: ["medium", "high", "very_high"],
      order_status: [
        "pending",
        "in_production",
        "completed",
        "shipped",
        "on_hold",
      ],
      production_stage: [
        "Intake",
        "Sanding",
        "Finishing",
        "Sub-Assembly",
        "Final Assembly",
        "Acoustic QC",
        "Shipping",
      ],
      quality_status: ["good", "warning", "critical", "hold"],
      wood_type: [
        "Sapele",
        "Cherry",
        "Walnut",
        "Ash",
        "Maple",
        "Cocobolo",
        "Katalox",
        "Ziricote",
        "Blackwood",
      ],
      worker_role: ["worker", "manager", "admin"],
    },
  },
} as const
