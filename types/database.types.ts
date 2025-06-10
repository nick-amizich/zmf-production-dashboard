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
          }
        ]
      }
      batches: {
        Row: {
          batch_number: string
          created_at: string
          current_stage: Database["public"]["Enums"]["production_stage"]
          id: string
          is_complete: boolean
          priority: Database["public"]["Enums"]["batch_priority"]
          quality_status: Database["public"]["Enums"]["quality_status"]
          updated_at: string
        }
        Insert: {
          batch_number: string
          created_at?: string
          current_stage?: Database["public"]["Enums"]["production_stage"]
          id?: string
          is_complete?: boolean
          priority?: Database["public"]["Enums"]["batch_priority"]
          quality_status?: Database["public"]["Enums"]["quality_status"]
          updated_at?: string
        }
        Update: {
          batch_number?: string
          created_at?: string
          current_stage?: Database["public"]["Enums"]["production_stage"]
          id?: string
          is_complete?: boolean
          priority?: Database["public"]["Enums"]["batch_priority"]
          quality_status?: Database["public"]["Enums"]["quality_status"]
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          shopify_customer_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          shopify_customer_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          shopify_customer_id?: string | null
        }
        Relationships: []
      }
      headphone_models: {
        Row: {
          base_production_hours: number
          complexity: Database["public"]["Enums"]["model_complexity"]
          created_at: string
          id: string
          is_active: boolean
          name: string
          wood_types: Database["public"]["Enums"]["wood_type"][]
        }
        Insert: {
          base_production_hours: number
          complexity: Database["public"]["Enums"]["model_complexity"]
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          wood_types?: Database["public"]["Enums"]["wood_type"][]
        }
        Update: {
          base_production_hours?: number
          complexity?: Database["public"]["Enums"]["model_complexity"]
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          wood_types?: Database["public"]["Enums"]["wood_type"][]
        }
        Relationships: []
      }
      issues: {
        Row: {
          assigned_to: string | null
          batch_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          is_resolved: boolean
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
          created_at?: string
          description: string
          id?: string
          is_resolved?: boolean
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
          created_at?: string
          description?: string
          id?: string
          is_resolved?: boolean
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
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          customizations: Json
          id: string
          model_id: string | null
          notes: string | null
          order_number: string
          priority: Database["public"]["Enums"]["batch_priority"]
          shopify_order_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          wood_type: Database["public"]["Enums"]["wood_type"]
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customizations?: Json
          id?: string
          model_id?: string | null
          notes?: string | null
          order_number: string
          priority?: Database["public"]["Enums"]["batch_priority"]
          shopify_order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          wood_type: Database["public"]["Enums"]["wood_type"]
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customizations?: Json
          id?: string
          model_id?: string | null
          notes?: string | null
          order_number?: string
          priority?: Database["public"]["Enums"]["batch_priority"]
          shopify_order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
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
          }
        ]
      }
      production_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          model_id: string | null
          quality_pass_rate: number | null
          stage: Database["public"]["Enums"]["production_stage"]
          total_time_minutes: number
          units_completed: number
          worker_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          model_id?: string | null
          quality_pass_rate?: number | null
          stage: Database["public"]["Enums"]["production_stage"]
          total_time_minutes?: number
          units_completed?: number
          worker_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          model_id?: string | null
          quality_pass_rate?: number | null
          stage?: Database["public"]["Enums"]["production_stage"]
          total_time_minutes?: number
          units_completed?: number
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
            referencedRelation: "workers"
            referencedColumns: ["id"]
          }
        ]
      }
      quality_checks: {
        Row: {
          batch_id: string | null
          checklist_data: Json
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          overall_status: Database["public"]["Enums"]["quality_status"]
          photos: string[]
          stage: Database["public"]["Enums"]["production_stage"]
          worker_id: string | null
        }
        Insert: {
          batch_id?: string | null
          checklist_data?: Json
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          overall_status: Database["public"]["Enums"]["quality_status"]
          photos?: string[]
          stage: Database["public"]["Enums"]["production_stage"]
          worker_id?: string | null
        }
        Update: {
          batch_id?: string | null
          checklist_data?: Json
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          overall_status?: Database["public"]["Enums"]["quality_status"]
          photos?: string[]
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
            referencedRelation: "workers"
            referencedColumns: ["id"]
          }
        ]
      }
      stage_assignments: {
        Row: {
          assigned_worker_id: string | null
          batch_id: string | null
          completed_at: string | null
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_assignments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          }
        ]
      }
      system_logs: {
        Row: {
          action: string
          context: string
          created_at: string
          details: Json
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          context: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          context?: string
          created_at?: string
          details?: Json
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
            referencedRelation: "workers"
            referencedColumns: ["id"]
          }
        ]
      }
      workers: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          role: Database["public"]["Enums"]["worker_role"]
          specializations: Database["public"]["Enums"]["production_stage"][]
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          role?: Database["public"]["Enums"]["worker_role"]
          specializations?: Database["public"]["Enums"]["production_stage"][]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          role?: Database["public"]["Enums"]["worker_role"]
          specializations?: Database["public"]["Enums"]["production_stage"][]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workers_auth_user_id_fkey"
            columns: ["auth_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      batch_priority: "standard" | "rush" | "expedite"
      model_complexity: "medium" | "high" | "very_high"
      order_status: "pending" | "in_production" | "completed" | "shipped" | "on_hold"
      production_stage: "Intake" | "Sanding" | "Finishing" | "Sub-Assembly" | "Final Assembly" | "Acoustic QC" | "Shipping"
      quality_status: "good" | "warning" | "critical" | "hold"
      wood_type: "Sapele" | "Cherry" | "Walnut" | "Ash" | "Maple" | "Cocobolo" | "Katalox" | "Ziricote" | "Blackwood"
      worker_role: "worker" | "manager" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}