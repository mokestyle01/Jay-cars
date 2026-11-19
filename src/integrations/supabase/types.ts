export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cars: {
        Row: {
          availability: string;
          brand: string;
          created_at: string;
          currency: string;
          description: string;
          engine_specs: Json;
          exterior_details: string;
          featured: boolean;
          features: string[];
          fuel_type: string;
          id: string;
          interior_details: string;
          mileage: number;
          model: string;
          name: string;
          price: number;
          specifications: Json;
          transmission: string;
          updated_at: string;
          year: number;
        };
        Insert: {
          availability?: string;
          brand: string;
          created_at?: string;
          currency?: string;
          description?: string;
          engine_specs?: Json;
          exterior_details?: string;
          featured?: boolean;
          features?: string[];
          fuel_type: string;
          id?: string;
          interior_details?: string;
          mileage?: number;
          model: string;
          name: string;
          price: number;
          specifications?: Json;
          transmission: string;
          updated_at?: string;
          year: number;
        };
        Update: {
          availability?: string;
          brand?: string;
          created_at?: string;
          currency?: string;
          description?: string;
          engine_specs?: Json;
          exterior_details?: string;
          featured?: boolean;
          features?: string[];
          fuel_type?: string;
          id?: string;
          interior_details?: string;
          mileage?: number;
          model?: string;
          name?: string;
          price?: number;
          specifications?: Json;
          transmission?: string;
          updated_at?: string;
          year?: number;
        };
        Relationships: [];
      };
      car_images: {
        Row: {
          alt_text: string;
          car_id: string;
          created_at: string;
          id: string;
          sort_order: number;
          storage_path: string;
        };
        Insert: {
          alt_text?: string;
          car_id: string;
          created_at?: string;
          id?: string;
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          alt_text?: string;
          car_id?: string;
          created_at?: string;
          id?: string;
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [];
      };
      car_videos: {
        Row: {
          car_id: string;
          created_at: string;
          id: string;
          storage_path: string;
          title: string;
        };
        Insert: {
          car_id: string;
          created_at?: string;
          id?: string;
          storage_path: string;
          title?: string;
        };
        Update: {
          car_id?: string;
          created_at?: string;
          id?: string;
          storage_path?: string;
          title?: string;
        };
        Relationships: [];
      };
      car_enquiries: {
        Row: {
          car_id: string | null;
          car_name: string;
          created_at: string;
          customer_name: string;
          email: string;
          id: string;
          message: string;
          phone: string;
          status: string;
          subject: string;
          user_id: string;
        };
        Insert: {
          car_id?: string | null;
          car_name: string;
          created_at?: string;
          customer_name: string;
          email: string;
          id?: string;
          message: string;
          phone: string;
          status?: string;
          subject: string;
          user_id: string;
        };
        Update: {
          car_id?: string | null;
          car_name?: string;
          created_at?: string;
          customer_name?: string;
          email?: string;
          id?: string;
          message?: string;
          phone?: string;
          status?: string;
          subject?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      car_orders: {
        Row: {
          additional_information: string;
          car_id: string | null;
          car_name: string;
          city: string;
          country: string;
          created_at: string;
          customer_name: string;
          email: string;
          fulfilment: string;
          id: string;
          order_reference: string;
          phone: string;
          status: string;
          user_id: string;
        };
        Insert: {
          additional_information?: string;
          car_id?: string | null;
          car_name: string;
          city: string;
          country: string;
          created_at?: string;
          customer_name: string;
          email: string;
          fulfilment: string;
          id?: string;
          order_reference?: string;
          phone: string;
          status?: string;
          user_id: string;
        };
        Update: {
          additional_information?: string;
          car_id?: string | null;
          car_name?: string;
          city?: string;
          country?: string;
          created_at?: string;
          customer_name?: string;
          email?: string;
          fulfilment?: string;
          id?: string;
          order_reference?: string;
          phone?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      customer_requests: {
        Row: {
          budget: string | null;
          created_at: string;
          customer_name: string;
          email: string;
          id: string;
          intended_use: string | null;
          message: string | null;
          phone: string | null;
          request_type: string;
          user_id: string;
          vehicle_id: string | null;
          vehicle_name: string | null;
        };
        Insert: {
          budget?: string | null;
          created_at?: string;
          customer_name: string;
          email: string;
          id?: string;
          intended_use?: string | null;
          message?: string | null;
          phone?: string | null;
          request_type: string;
          user_id: string;
          vehicle_id?: string | null;
          vehicle_name?: string | null;
        };
        Update: {
          budget?: string | null;
          created_at?: string;
          customer_name?: string;
          email?: string;
          id?: string;
          intended_use?: string | null;
          message?: string | null;
          phone?: string | null;
          request_type?: string;
          user_id?: string;
          vehicle_id?: string | null;
          vehicle_name?: string | null;
        };
        Relationships: [];
      };
      customer_vehicle_submissions: {
        Row: {
          created_at: string;
          id: string;
          image_paths: string[];
          make: string;
          model: string;
          notes: string | null;
          status: string;
          user_id: string;
          year: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_paths?: string[];
          make: string;
          model: string;
          notes?: string | null;
          status?: string;
          user_id: string;
          year: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_paths?: string[];
          make?: string;
          model?: string;
          notes?: string | null;
          status?: string;
          user_id?: string;
          year?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_superadmin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      set_profile_role: {
        Args: { target_role: string; target_user_id: string };
        Returns: undefined;
      };
      has_staff_role: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
