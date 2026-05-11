export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounting_entries: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          entry_type: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string
          description?: string | null
          entry_type: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          entry_type?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_customers: {
        Row: {
          address: string | null
          company_name: string
          contact_person: string | null
          created_at: string
          credit_limit: number | null
          current_debt: number | null
          email: string | null
          id: string
          is_active: boolean
          notes: string | null
          outlet_id: string | null
          payment_terms_days: number
          phone: string | null
          siret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_person?: string | null
          created_at?: string
          credit_limit?: number | null
          current_debt?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          outlet_id?: string | null
          payment_terms_days?: number
          phone?: string | null
          siret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string
          credit_limit?: number | null
          current_debt?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          outlet_id?: string | null
          payment_terms_days?: number
          phone?: string | null
          siret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_customers_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      business_periods: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          outlet_id: string | null
          paid_invoices: number | null
          started_at: string
          total_invoices: number | null
          total_orders: number | null
          total_revenue: number | null
          unpaid_invoices: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          outlet_id?: string | null
          paid_invoices?: number | null
          started_at?: string
          total_invoices?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          unpaid_invoices?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          outlet_id?: string | null
          paid_invoices?: number | null
          started_at?: string
          total_invoices?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          unpaid_invoices?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_periods_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      button_click_tracking: {
        Row: {
          button_category: string
          button_name: string
          click_count: number
          created_at: string
          id: string
          last_clicked_at: string | null
          updated_at: string
        }
        Insert: {
          button_category?: string
          button_name: string
          click_count?: number
          created_at?: string
          id?: string
          last_clicked_at?: string | null
          updated_at?: string
        }
        Update: {
          button_category?: string
          button_name?: string
          click_count?: number
          created_at?: string
          id?: string
          last_clicked_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_visit: string | null
          name: string
          outlet_id: string | null
          phone: string | null
          status: string | null
          total_spent: number | null
          total_visits: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          last_visit?: string | null
          name: string
          outlet_id?: string | null
          phone?: string | null
          status?: string | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_visit?: string | null
          name?: string
          outlet_id?: string | null
          phone?: string | null
          status?: string | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      debtor_payments: {
        Row: {
          amount: number
          created_at: string | null
          debtor_id: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          outlet_id: string | null
          payment_date: string | null
          payment_method: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          debtor_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          outlet_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          debtor_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          outlet_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debtor_payments_debtor_id_fkey"
            columns: ["debtor_id"]
            isOneToOne: false
            referencedRelation: "business_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debtor_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debtor_payments_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number
          created_at: string
          date: string
          description: string | null
          id: string
          location: string
          registered: number
          status: string
          time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          date: string
          description?: string | null
          id?: string
          location: string
          registered?: number
          status?: string
          time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capacity?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          location?: string
          registered?: number
          status?: string
          time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          batch_number: string | null
          category: string
          created_at: string
          current_stock: number | null
          expiration_date: string | null
          id: string
          last_reorder_date: string | null
          min_stock: number | null
          name: string
          outlet_id: string | null
          reorder_point: number | null
          reorder_quantity: number | null
          supplier: string | null
          supplier_id: string | null
          unit: string
          unit_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_number?: string | null
          category: string
          created_at?: string
          current_stock?: number | null
          expiration_date?: string | null
          id?: string
          last_reorder_date?: string | null
          min_stock?: number | null
          name: string
          outlet_id?: string | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          supplier?: string | null
          supplier_id?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_number?: string | null
          category?: string
          created_at?: string
          current_stock?: number | null
          expiration_date?: string | null
          id?: string
          last_reorder_date?: string | null
          min_stock?: number | null
          name?: string
          outlet_id?: string | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          supplier?: string | null
          supplier_id?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_losses: {
        Row: {
          cost_value: number | null
          created_at: string | null
          id: string
          inventory_item_id: string
          loss_category: string
          loss_date: string
          loss_type: string
          outlet_id: string | null
          quantity: number
          reason: string | null
          recorded_by_user_id: string | null
          user_id: string
        }
        Insert: {
          cost_value?: number | null
          created_at?: string | null
          id?: string
          inventory_item_id: string
          loss_category: string
          loss_date?: string
          loss_type: string
          outlet_id?: string | null
          quantity: number
          reason?: string | null
          recorded_by_user_id?: string | null
          user_id: string
        }
        Update: {
          cost_value?: number | null
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          loss_category?: string
          loss_date?: string
          loss_type?: string
          outlet_id?: string | null
          quantity?: number
          reason?: string | null
          recorded_by_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_losses_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_losses_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reorder_rules: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          is_active: boolean | null
          lead_time_days: number
          min_quantity: number
          safety_stock: number
          target_quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          is_active?: boolean | null
          lead_time_days?: number
          min_quantity?: number
          safety_stock?: number
          target_quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          is_active?: boolean | null
          lead_time_days?: number
          min_quantity?: number
          safety_stock?: number
          target_quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reorder_rules_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_settings: {
        Row: {
          company_address: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string
          display_options: Json | null
          footer_note: string | null
          id: string
          invoice_title: string
          logo_url: string | null
          nif_number: string | null
          other_registration: string | null
          outlet_id: string | null
          payment_terms: string | null
          primary_color: string | null
          rccm_number: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          display_options?: Json | null
          footer_note?: string | null
          id?: string
          invoice_title?: string
          logo_url?: string | null
          nif_number?: string | null
          other_registration?: string | null
          outlet_id?: string | null
          payment_terms?: string | null
          primary_color?: string | null
          rccm_number?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          display_options?: Json | null
          footer_note?: string | null
          id?: string
          invoice_title?: string
          logo_url?: string | null
          nif_number?: string | null
          other_registration?: string | null
          outlet_id?: string | null
          payment_terms?: string | null
          primary_color?: string | null
          rccm_number?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          billing_address: string | null
          business_customer_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          due_date: string | null
          id: string
          invoice_number: string
          invoice_type: string
          items: Json | null
          notes: string | null
          order_id: string | null
          outlet_id: string | null
          paid_date: string | null
          payment_method: string | null
          payment_terms_days: number | null
          session_id: string | null
          siret: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          business_customer_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          invoice_type?: string
          items?: Json | null
          notes?: string | null
          order_id?: string | null
          outlet_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_terms_days?: number | null
          session_id?: string | null
          siret?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: string | null
          business_customer_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: string
          items?: Json | null
          notes?: string | null
          order_id?: string | null
          outlet_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_terms_days?: number | null
          session_id?: string | null
          siret?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_customer_id_fkey"
            columns: ["business_customer_id"]
            isOneToOne: false
            referencedRelation: "business_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          menu_id: string
          name: string
          order_index: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          menu_id: string
          name: string
          order_index?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          menu_id?: string
          name?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_ingredients: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          menu_item_id: string
          quantity_needed: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          menu_item_id: string
          quantity_needed?: number
          unit?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          menu_item_id?: string
          quantity_needed?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_ingredients_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_option_groups: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          menu_item_id: string
          name: string
          order_index: number
          selection_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          menu_item_id: string
          name: string
          order_index?: number
          selection_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          menu_item_id?: string
          name?: string
          order_index?: number
          selection_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_option_groups_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_option_values: {
        Row: {
          created_at: string
          extra_price: number
          group_id: string
          id: string
          is_available: boolean
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          extra_price?: number
          group_id: string
          id?: string
          is_available?: boolean
          name: string
          order_index?: number
        }
        Update: {
          created_at?: string
          extra_price?: number
          group_id?: string
          id?: string
          is_available?: boolean
          name?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_option_values_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "menu_item_option_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_custom_name: boolean | null
          is_custom_price: boolean | null
          name: string
          order_index: number | null
          price: number
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_custom_name?: boolean | null
          is_custom_price?: boolean | null
          name: string
          order_index?: number | null
          price: number
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_custom_name?: boolean | null
          is_custom_price?: boolean | null
          name?: string
          order_index?: number | null
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          description: string | null
          header_image_url: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          outlet_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          header_image_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          outlet_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          header_image_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          outlet_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          delivery_address: string | null
          delivery_time: string | null
          id: string
          items: Json
          notes: string | null
          order_type: string | null
          outlet_id: string | null
          session_id: string | null
          status: string
          table_number: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_time?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_type?: string | null
          outlet_id?: string | null
          session_id?: string | null
          status?: string
          table_number?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_time?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_type?: string | null
          outlet_id?: string | null
          session_id?: string | null
          status?: string
          table_number?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      outlet_profiles: {
        Row: {
          access_code: string
          active_session_id: string | null
          created_at: string
          id: string
          is_active: boolean
          last_login_at: string | null
          outlet_id: string
          profile_name: string
          role: Database["public"]["Enums"]["outlet_role"]
          updated_at: string
        }
        Insert: {
          access_code: string
          active_session_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          outlet_id: string
          profile_name: string
          role: Database["public"]["Enums"]["outlet_role"]
          updated_at?: string
        }
        Update: {
          access_code?: string
          active_session_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          outlet_id?: string
          profile_name?: string
          role?: Database["public"]["Enums"]["outlet_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outlet_profiles_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      outlets: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          slug: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          commission_rate: number
          company_name: string
          company_type: string
          created_at: string
          description: string
          id: string
          phone: string
          referral_code: string
          status: string
          total_commissions: number
          total_referrals: number
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          commission_rate?: number
          company_name?: string
          company_type?: string
          created_at?: string
          description?: string
          id?: string
          phone: string
          referral_code?: string
          status?: string
          total_commissions?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          commission_rate?: number
          company_name?: string
          company_type?: string
          created_at?: string
          description?: string
          id?: string
          phone?: string
          referral_code?: string
          status?: string
          total_commissions?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profile_access_codes: {
        Row: {
          access_code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          profile_title: string
          updated_at: string | null
        }
        Insert: {
          access_code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profile_title: string
          updated_at?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profile_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          restaurant_slug: string | null
          selected_outlet_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          restaurant_slug?: string | null
          selected_outlet_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          restaurant_slug?: string | null
          selected_outlet_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_selected_outlet_id_fkey"
            columns: ["selected_outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          created_at: string | null
          expected_delivery_date: string | null
          id: string
          items: Json
          notes: string | null
          order_date: string
          order_number: string
          outlet_id: string | null
          status: string
          supplier_id: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_delivery_date?: string | null
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_date?: string
          order_number: string
          outlet_id?: string | null
          status?: string
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_delivery_date?: string | null
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_date?: string
          order_number?: string
          outlet_id?: string | null
          status?: string
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limit_log: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: unknown
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_amount: number
          created_at: string
          customer_id: string
          first_payment_at: string | null
          id: string
          partner_id: string
          referred_at: string
          status: string
          subscription_tier: string
        }
        Insert: {
          commission_amount: number
          created_at?: string
          customer_id: string
          first_payment_at?: string | null
          id?: string
          partner_id: string
          referred_at?: string
          status?: string
          subscription_tier: string
        }
        Update: {
          commission_amount?: number
          created_at?: string
          customer_id?: string
          first_payment_at?: string | null
          id?: string
          partner_id?: string
          referred_at?: string
          status?: string
          subscription_tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          outlet_id: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          special_requests: string | null
          status: string
          table_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          outlet_id?: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          special_requests?: string | null
          status?: string
          table_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          outlet_id?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          special_requests?: string | null
          status?: string
          table_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string | null
          role_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          permissions: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          permissions?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          permissions?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          created_at: string
          id: string
          service_data: Json
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_data?: Json
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_data?: Json
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          after_quantity: number | null
          before_quantity: number | null
          created_at: string
          id: string
          item_id: string
          movement_type: string
          notes: string | null
          performed_by_user_id: string | null
          quantity: number
          reason: string | null
          reason_category: string | null
          user_id: string
        }
        Insert: {
          after_quantity?: number | null
          before_quantity?: number | null
          created_at?: string
          id?: string
          item_id: string
          movement_type: string
          notes?: string | null
          performed_by_user_id?: string | null
          quantity: number
          reason?: string | null
          reason_category?: string | null
          user_id: string
        }
        Update: {
          after_quantity?: number | null
          before_quantity?: number | null
          created_at?: string
          id?: string
          item_id?: string
          movement_type?: string
          notes?: string | null
          performed_by_user_id?: string | null
          quantity?: number
          reason?: string | null
          reason_category?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          last_payment_date: string | null
          monthly_revenue: number | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_start: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_payment_date?: string | null
          monthly_revenue?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_payment_date?: string | null
          monthly_revenue?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      table_sessions: {
        Row: {
          closed_at: string | null
          created_at: string | null
          custom_table_name: string | null
          debtor_id: string | null
          id: string
          notes: string | null
          number_of_guests: number | null
          outlet_id: string | null
          payment_method: string | null
          started_at: string
          status: string
          table_number: string
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          custom_table_name?: string | null
          debtor_id?: string | null
          id?: string
          notes?: string | null
          number_of_guests?: number | null
          outlet_id?: string | null
          payment_method?: string | null
          started_at?: string
          status?: string
          table_number: string
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          custom_table_name?: string | null
          debtor_id?: string | null
          id?: string
          notes?: string | null
          number_of_guests?: number | null
          outlet_id?: string | null
          payment_method?: string | null
          started_at?: string
          status?: string
          table_number?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_sessions_debtor_id_fkey"
            columns: ["debtor_id"]
            isOneToOne: false
            referencedRelation: "business_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      team_activity_logs: {
        Row: {
          action_description: string | null
          action_type: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          team_member_id: string | null
        }
        Insert: {
          action_description?: string | null
          action_type: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          team_member_id?: string | null
        }
        Update: {
          action_description?: string | null
          action_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          team_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_activity_logs_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_outlets: {
        Row: {
          created_at: string | null
          id: string
          outlet_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          outlet_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          outlet_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_outlets_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_outlets_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_permissions_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          access_code: string | null
          actions_count: number | null
          created_at: string
          full_name: string | null
          id: string
          invited_at: string
          is_active: boolean | null
          last_login_at: string | null
          member_email: string
          member_user_id: string | null
          needs_password_setup: boolean | null
          outlet_id: string | null
          owner_id: string
          phone: string | null
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          access_code?: string | null
          actions_count?: number | null
          created_at?: string
          full_name?: string | null
          id?: string
          invited_at?: string
          is_active?: boolean | null
          last_login_at?: string | null
          member_email: string
          member_user_id?: string | null
          needs_password_setup?: boolean | null
          outlet_id?: string | null
          owner_id: string
          phone?: string | null
          role?: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          access_code?: string | null
          actions_count?: number | null
          created_at?: string
          full_name?: string | null
          id?: string
          invited_at?: string
          is_active?: boolean | null
          last_login_at?: string | null
          member_email?: string
          member_user_id?: string | null
          needs_password_setup?: boolean | null
          outlet_id?: string | null
          owner_id?: string
          phone?: string | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          outlet_id: string | null
          payment_method: string | null
          status: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          outlet_id?: string | null
          payment_method?: string | null
          status?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          outlet_id?: string | null
          payment_method?: string | null
          status?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_access_codes: {
        Row: {
          accounting_code: string
          created_at: string | null
          id: string
          last_modified_at: string | null
          management_code: string
          user_id: string
        }
        Insert: {
          accounting_code: string
          created_at?: string | null
          id?: string
          last_modified_at?: string | null
          management_code: string
          user_id: string
        }
        Update: {
          accounting_code?: string
          created_at?: string | null
          id?: string
          last_modified_at?: string | null
          management_code?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          access_code: string | null
          created_at: string
          id: string
          is_default: boolean | null
          name: string | null
          selected_outlet_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_code?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string | null
          selected_outlet_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_code?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string | null
          selected_outlet_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_selected_outlet_id_fkey"
            columns: ["selected_outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      website_gallery: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_featured: boolean | null
          order_index: number | null
          website_id: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_featured?: boolean | null
          order_index?: number | null
          website_id: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_featured?: boolean | null
          order_index?: number | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_gallery_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "public_websites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_gallery_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      website_pages: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          is_enabled: boolean | null
          order_index: number | null
          page_type: string
          title: string
          updated_at: string
          website_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          order_index?: number | null
          page_type: string
          title: string
          updated_at?: string
          website_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          order_index?: number | null
          page_type?: string
          title?: string
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_pages_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "public_websites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_pages_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      websites: {
        Row: {
          address: string | null
          contact_subtitle: string | null
          contact_title: string | null
          created_at: string
          custom_css: string | null
          description: string | null
          dish1_image_url: string | null
          dish1_name: string | null
          dish1_price: string | null
          dish1_rating: string | null
          dish2_image_url: string | null
          dish2_name: string | null
          dish2_price: string | null
          dish2_rating: string | null
          dish3_image_url: string | null
          dish3_name: string | null
          dish3_price: string | null
          dish3_rating: string | null
          domain: string | null
          email: string | null
          header_image_url: string | null
          hero_button_primary: string | null
          hero_button_secondary: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          is_published: boolean | null
          logo_url: string | null
          name: string
          opening_hours: Json | null
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          social_links: Json | null
          specialities_subtitle: string | null
          specialities_title: string | null
          stats_clients: string | null
          stats_dishes: string | null
          stats_experience: string | null
          stats_rating: string | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_subtitle?: string | null
          contact_title?: string | null
          created_at?: string
          custom_css?: string | null
          description?: string | null
          dish1_image_url?: string | null
          dish1_name?: string | null
          dish1_price?: string | null
          dish1_rating?: string | null
          dish2_image_url?: string | null
          dish2_name?: string | null
          dish2_price?: string | null
          dish2_rating?: string | null
          dish3_image_url?: string | null
          dish3_name?: string | null
          dish3_price?: string | null
          dish3_rating?: string | null
          domain?: string | null
          email?: string | null
          header_image_url?: string | null
          hero_button_primary?: string | null
          hero_button_secondary?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          social_links?: Json | null
          specialities_subtitle?: string | null
          specialities_title?: string | null
          stats_clients?: string | null
          stats_dishes?: string | null
          stats_experience?: string | null
          stats_rating?: string | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_subtitle?: string | null
          contact_title?: string | null
          created_at?: string
          custom_css?: string | null
          description?: string | null
          dish1_image_url?: string | null
          dish1_name?: string | null
          dish1_price?: string | null
          dish1_rating?: string | null
          dish2_image_url?: string | null
          dish2_name?: string | null
          dish2_price?: string | null
          dish2_rating?: string | null
          dish3_image_url?: string | null
          dish3_name?: string | null
          dish3_price?: string | null
          dish3_rating?: string | null
          domain?: string | null
          email?: string | null
          header_image_url?: string | null
          hero_button_primary?: string | null
          hero_button_secondary?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          social_links?: Json | null
          specialities_subtitle?: string | null
          specialities_title?: string | null
          stats_clients?: string | null
          stats_dishes?: string | null
          stats_experience?: string | null
          stats_rating?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_revenue_stats: {
        Row: {
          active_subscribers: number | null
          churned_subscribers: number | null
          month: string | null
          monthly_revenue: number | null
          new_subscribers: number | null
        }
        Relationships: []
      }
      public_websites: {
        Row: {
          contact_subtitle: string | null
          contact_title: string | null
          created_at: string | null
          custom_css: string | null
          description: string | null
          dish1_image_url: string | null
          dish1_name: string | null
          dish1_price: string | null
          dish1_rating: string | null
          dish2_image_url: string | null
          dish2_name: string | null
          dish2_price: string | null
          dish2_rating: string | null
          dish3_image_url: string | null
          dish3_name: string | null
          dish3_price: string | null
          dish3_rating: string | null
          header_image_url: string | null
          hero_button_primary: string | null
          hero_button_secondary: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string | null
          logo_url: string | null
          name: string | null
          opening_hours: Json | null
          primary_color: string | null
          secondary_color: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          social_links: Json | null
          specialities_subtitle: string | null
          specialities_title: string | null
          stats_clients: string | null
          stats_dishes: string | null
          stats_experience: string | null
          stats_rating: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          contact_subtitle?: string | null
          contact_title?: string | null
          created_at?: string | null
          custom_css?: string | null
          description?: string | null
          dish1_image_url?: string | null
          dish1_name?: string | null
          dish1_price?: string | null
          dish1_rating?: string | null
          dish2_image_url?: string | null
          dish2_name?: string | null
          dish2_price?: string | null
          dish2_rating?: string | null
          dish3_image_url?: string | null
          dish3_name?: string | null
          dish3_price?: string | null
          dish3_rating?: string | null
          header_image_url?: string | null
          hero_button_primary?: string | null
          hero_button_secondary?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          opening_hours?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          social_links?: Json | null
          specialities_subtitle?: string | null
          specialities_title?: string | null
          stats_clients?: string | null
          stats_dishes?: string | null
          stats_experience?: string | null
          stats_rating?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_subtitle?: string | null
          contact_title?: string | null
          created_at?: string | null
          custom_css?: string | null
          description?: string | null
          dish1_image_url?: string | null
          dish1_name?: string | null
          dish1_price?: string | null
          dish1_rating?: string | null
          dish2_image_url?: string | null
          dish2_name?: string | null
          dish2_price?: string | null
          dish2_rating?: string | null
          dish3_image_url?: string | null
          dish3_name?: string | null
          dish3_price?: string | null
          dish3_rating?: string | null
          header_image_url?: string | null
          hero_button_primary?: string | null
          hero_button_secondary?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          opening_hours?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          social_links?: Json | null
          specialities_subtitle?: string | null
          specialities_title?: string | null
          stats_clients?: string | null
          stats_dishes?: string | null
          stats_experience?: string | null
          stats_rating?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_team_invitation: {
        Args: { _email: string; _token: string }
        Returns: {
          full_name: string
          member_id: string
          member_role: string
          outlet_id: string
          owner_id: string
        }[]
      }
      admin_revenue_stats_policy: { Args: never; Returns: boolean }
      calculate_churn_rate: {
        Args: { period_months?: number }
        Returns: {
          active_start: number
          churn_rate: number
          churned: number
          period_end: string
          period_start: string
        }[]
      }
      calculate_reorder_suggestions: {
        Args: { p_outlet_id: string; p_user_id: string }
        Returns: {
          current_stock: number
          item_id: string
          item_name: string
          min_stock: number
          suggested_order_quantity: number
          supplier_name: string
          total_cost: number
          unit_price: number
        }[]
      }
      check_team_member_permission: {
        Args: { _member_email: string; _permission_name: string }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      cleanup_stale_table_sessions: { Args: never; Returns: undefined }
      complete_team_member_setup: {
        Args: { _email: string; _new_access_code?: string; _token: string }
        Returns: {
          full_name: string
          member_id: string
          member_role: string
          outlet_id: string
          owner_id: string
        }[]
      }
      generate_invoice_number: { Args: never; Returns: string }
      generate_outlet_access_code: {
        Args: {
          _outlet_id: string
          _role: Database["public"]["Enums"]["outlet_role"]
        }
        Returns: string
      }
      generate_purchase_order_number: { Args: never; Returns: string }
      generate_team_access_code: { Args: never; Returns: string }
      get_admin_revenue_stats: {
        Args: never
        Returns: {
          active_subscribers: number
          churned_subscribers: number
          month: string
          monthly_revenue: number
          new_subscribers: number
        }[]
      }
      get_button_usage_stats: {
        Args: never
        Returns: {
          button_category: string
          button_name: string
          click_count: number
          last_clicked_at: string
        }[]
      }
      get_overdue_invoices: {
        Args: never
        Returns: {
          billing_address: string
          business_customer_id: string
          company_name: string
          contact_person: string
          created_at: string
          customer_email: string
          customer_email_b2b: string
          customer_name: string
          customer_phone: string
          days_overdue: number
          due_date: string
          id: string
          invoice_number: string
          invoice_type: string
          items: Json
          notes: string
          order_id: string
          outlet_id: string
          paid_date: string
          payment_terms_days: number
          session_id: string
          siret: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }[]
      }
      get_public_menu_data: {
        Args: { _menu_id: string }
        Returns: {
          description: string
          header_image_url: string
          id: string
          logo_url: string
          name: string
          outlet_id: string
          user_id: string
        }[]
      }
      get_public_website_by_slug: {
        Args: { website_slug: string }
        Returns: {
          contact_subtitle: string
          contact_title: string
          created_at: string
          custom_css: string
          description: string
          dish1_image_url: string
          dish1_name: string
          dish1_price: string
          dish1_rating: string
          dish2_image_url: string
          dish2_name: string
          dish2_price: string
          dish2_rating: string
          dish3_image_url: string
          dish3_name: string
          dish3_price: string
          dish3_rating: string
          header_image_url: string
          hero_button_primary: string
          hero_button_secondary: string
          hero_image_url: string
          hero_subtitle: string
          hero_title: string
          id: string
          logo_url: string
          name: string
          opening_hours: Json
          primary_color: string
          secondary_color: string
          seo_description: string
          seo_title: string
          slug: string
          social_links: Json
          specialities_subtitle: string
          specialities_title: string
          stats_clients: string
          stats_dishes: string
          stats_experience: string
          stats_rating: string
          template_id: string
          updated_at: string
        }[]
      }
      get_public_website_safe_data: {
        Args: { website_slug: string }
        Returns: {
          contact_subtitle: string
          contact_title: string
          created_at: string
          custom_css: string
          description: string
          dish1_image_url: string
          dish1_name: string
          dish1_price: string
          dish1_rating: string
          dish2_image_url: string
          dish2_name: string
          dish2_price: string
          dish2_rating: string
          dish3_image_url: string
          dish3_name: string
          dish3_price: string
          dish3_rating: string
          header_image_url: string
          hero_button_primary: string
          hero_button_secondary: string
          hero_image_url: string
          hero_subtitle: string
          hero_title: string
          id: string
          logo_url: string
          name: string
          opening_hours: Json
          primary_color: string
          secondary_color: string
          seo_description: string
          seo_title: string
          slug: string
          social_links: Json
          specialities_subtitle: string
          specialities_title: string
          stats_clients: string
          stats_dishes: string
          stats_experience: string
          stats_rating: string
          template_id: string
          updated_at: string
        }[]
      }
      get_restaurants_total_revenue: {
        Args: never
        Returns: {
          combined_revenue: number
          total_invoices_revenue: number
          total_orders_revenue: number
          total_restaurants: number
        }[]
      }
      get_role_permissions: {
        Args: { _role_name: string }
        Returns: {
          permission_category: string
          permission_description: string
          permission_name: string
        }[]
      }
      get_subscription_revenue_stats: {
        Args: never
        Returns: {
          active_subscribers: number
          churned_subscribers: number
          month: string
          monthly_revenue: number
          new_subscribers: number
        }[]
      }
      get_team_member_outlets: {
        Args: { _member_id: string }
        Returns: {
          outlet_id: string
          outlet_name: string
        }[]
      }
      get_team_member_permissions: {
        Args: { _member_id: string }
        Returns: {
          category: string
          description: string
          permission_name: string
        }[]
      }
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["user_role"]
              _user_id: string
            }
            Returns: boolean
          }
      is_active_team_member_for_owner: {
        Args: { _owner_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_menu_publicly_active: { Args: { _menu_id: string }; Returns: boolean }
      is_valid_public_outlet_owner: {
        Args: { _outlet_id: string; _owner_id: string }
        Returns: boolean
      }
      log_team_activity: {
        Args: {
          _action_description?: string
          _action_type: string
          _member_id: string
        }
        Returns: undefined
      }
      logout_outlet_profile: {
        Args: { _profile_id: string }
        Returns: undefined
      }
      public_reset_password: {
        Args: { new_password: string; user_email: string }
        Returns: Json
      }
      resolve_public_menu: {
        Args: { _outlet_slug: string; _restaurant_slug: string }
        Returns: {
          menu_id: string
          outlet_id: string
          outlet_name: string
          restaurant_name: string
          user_id: string
          whatsapp_number: string
        }[]
      }
      slugify: { Args: { _input: string }; Returns: string }
      team_member_login: {
        Args: { _access_code: string; _email: string }
        Returns: {
          member_id: string
          member_role: string
          outlet_id: string
          owner_id: string
          status: string
        }[]
      }
      track_button_click: {
        Args: { _button_category?: string; _button_name: string }
        Returns: undefined
      }
      unaccent_string: { Args: { _input: string }; Returns: string }
      update_user_access_codes: {
        Args: { _accounting_code: string; _management_code: string }
        Returns: boolean
      }
      verify_outlet_access_code: {
        Args: { _access_code: string; _session_id: string }
        Returns: {
          outlet_id: string
          outlet_name: string
          owner_id: string
          profile_id: string
          profile_name: string
          role: Database["public"]["Enums"]["outlet_role"]
        }[]
      }
      verify_profile_access_code: {
        Args: { _access_code: string; _profile_title: string }
        Returns: boolean
      }
      verify_team_access: {
        Args: { _access_code: string; _email: string }
        Returns: {
          member_id: string
          outlet_id: string
          owner_id: string
          role: string
          status: string
        }[]
      }
      verify_team_invitation: {
        Args: { _token: string }
        Returns: {
          full_name: string
          id: string
          member_email: string
          outlet_id: string
          owner_id: string
          role: string
          status: string
        }[]
      }
      verify_user_access_code: {
        Args: { _code: string; _type: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      outlet_role: "proprietaire" | "superviseur" | "comptable" | "caissier"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      outlet_role: ["proprietaire", "superviseur", "comptable", "caissier"],
      user_role: ["admin", "user"],
    },
  },
} as const
