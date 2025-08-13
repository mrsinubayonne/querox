export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
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
          phone?: string | null
          status?: string | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          category: string
          created_at: string
          current_stock: number | null
          id: string
          min_stock: number | null
          name: string
          supplier: string | null
          unit: string
          unit_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          current_stock?: number | null
          id?: string
          min_stock?: number | null
          name: string
          supplier?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_stock?: number | null
          id?: string
          min_stock?: number | null
          name?: string
          supplier?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      menu_items: {
        Row: {
          allergens: string[] | null
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
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
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          status?: string
          table_number?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
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
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          date: string
          id: string
          notes: string | null
          party_size: number
          status: string | null
          time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          date: string
          id?: string
          notes?: string | null
          party_size: number
          status?: string | null
          time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          date?: string
          id?: string
          notes?: string | null
          party_size?: number
          status?: string | null
          time?: string
          updated_at?: string
          user_id?: string
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
          created_at: string
          id: string
          item_id: string
          movement_type: string
          quantity: number
          reason: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          movement_type: string
          quantity: number
          reason?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          movement_type?: string
          quantity?: number
          reason?: string | null
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
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
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
          status?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
      get_public_website_by_slug: {
        Args: { website_slug: string }
        Returns: {
          id: string
          name: string
          description: string
          logo_url: string
          header_image_url: string
          hero_title: string
          hero_subtitle: string
          hero_image_url: string
          hero_button_primary: string
          hero_button_secondary: string
          stats_experience: string
          stats_clients: string
          stats_dishes: string
          stats_rating: string
          specialities_title: string
          specialities_subtitle: string
          dish1_name: string
          dish1_price: string
          dish1_rating: string
          dish1_image_url: string
          dish2_name: string
          dish2_price: string
          dish2_rating: string
          dish2_image_url: string
          dish3_name: string
          dish3_price: string
          dish3_rating: string
          dish3_image_url: string
          contact_title: string
          contact_subtitle: string
          primary_color: string
          secondary_color: string
          template_id: string
          custom_css: string
          seo_title: string
          seo_description: string
          slug: string
          opening_hours: Json
          social_links: Json
          created_at: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
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
      user_role: ["admin", "user"],
    },
  },
} as const
