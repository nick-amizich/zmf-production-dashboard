export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
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
          },
        ]
      }
      batches: {
        Row: {
          batch_number: string
          created_at: string | null
          current_stage: Database["public"]["Enums"]["production_stage"] | null
          id: string
          is_complete: boolean | null
          priority: Database["public"]["Enums"]["batch_priority"] | null
          quality_status: Database["public"]["Enums"]["quality_status"] | null
          updated_at: string | null
        }
        Insert: {
          batch_number: string
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["production_stage"] | null
          id?: string
          is_complete?: boolean | null
          priority?: Database["public"]["Enums"]["batch_priority"] | null
          quality_status?: Database["public"]["Enums"]["quality_status"] | null
          updated_at?: string | null
        }
        Update: {
          batch_number?: string
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["production_stage"] | null
          id?: string
          is_complete?: boolean | null
          priority?: Database["public"]["Enums"]["batch_priority"] | null
          quality_status?: Database["public"]["Enums"]["quality_status"] | null
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
            referencedRelation: "workers"
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
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          role: Database["public"]["Enums"]["worker_role"]
          specializations:
            | Database["public"]["Enums"]["production_stage"][]
            | null
          updated_at: string | null
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          requested_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          role?: Database["public"]["Enums"]["worker_role"]
          specializations?:
            | Database["public"]["Enums"]["production_stage"][]
            | null
          updated_at?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"] | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          role?: Database["public"]["Enums"]["worker_role"]
          specializations?:
            | Database["public"]["Enums"]["production_stage"][]
            | null
          updated_at?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"] | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      pending_worker_approvals: {
        Row: {
          id: string
          name: string
          email: string
          requested_at: string | null
          hourly_rate: number | null
          specializations: Database["public"]["Enums"]["production_stage"][] | null
          email_confirmed_at: string | null
          last_sign_in_at: string | null
        }
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["worker_role"]
      }
      is_worker_approved: {
        Args: {
          worker_id: string
        }
        Returns: boolean
      }
      get_current_worker_approval_status: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["approval_status"]
      }
      is_current_user_approved: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      approve_worker: {
        Args: {
          worker_id: string
          approver_notes?: string
        }
        Returns: void
      }
      reject_worker: {
        Args: {
          worker_id: string
          reason: string
        }
        Returns: void
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
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

