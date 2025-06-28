type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          email_confirmed_at: string | null
          last_sign_in_at: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          email_confirmed_at?: string | null
          last_sign_in_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          email_confirmed_at?: string | null
          last_sign_in_at?: string | null
        }
      }
    }
  }
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          is_system: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_system?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_system?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      permissions: {
        Row: {
          id: string
          name: string
          description: string | null
          resource: string
          action: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          resource: string
          action: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          resource?: string
          action?: string
          created_at?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          assigned_by: string | null
          assigned_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          assigned_by?: string | null
          assigned_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          assigned_by?: string | null
          assigned_at?: string | null
          expires_at?: string | null
        }
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          granted_at: string | null
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          granted_at?: string | null
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          granted_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invitations: {
        Row: {
          id: string
          user_id: string
          title: string
          template_id: string | null
          bride_name: string | null
          groom_name: string | null
          event_date: string | null
          event_time: string | null
          venue: string | null
          address: string | null
          message: string | null
          dress_code: string | null
          rsvp_deadline: string | null
          status: string | null
          settings: Json | null
          design_settings: Json | null
          created_at: string | null
          updated_at: string | null
          custom_url: string | null
          custom_domain: string | null
          is_public: boolean | null
          password: string | null
          view_count: number | null
          last_viewed_at: string | null
          theme_color: string | null
          font_family: string | null
          background_image_url: string | null
          logo_url: string | null
          custom_css: string | null
          custom_js: string | null
          meta_title: string | null
          meta_description: string | null
          meta_image_url: string | null
          social_sharing: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          template_id?: string | null
          bride_name?: string | null
          groom_name?: string | null
          event_date?: string | null
          event_time?: string | null
          venue?: string | null
          address?: string | null
          message?: string | null
          dress_code?: string | null
          rsvp_deadline?: string | null
          status?: string | null
          settings?: Json | null
          design_settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
          custom_url?: string | null
          custom_domain?: string | null
          is_public?: boolean | null
          password?: string | null
          view_count?: number | null
          last_viewed_at?: string | null
          theme_color?: string | null
          font_family?: string | null
          background_image_url?: string | null
          logo_url?: string | null
          custom_css?: string | null
          custom_js?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_image_url?: string | null
          social_sharing?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          template_id?: string | null
          bride_name?: string | null
          groom_name?: string | null
          event_date?: string | null
          event_time?: string | null
          venue?: string | null
          address?: string | null
          message?: string | null
          dress_code?: string | null
          rsvp_deadline?: string | null
          status?: string | null
          settings?: Json | null
          design_settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
          custom_url?: string | null
          custom_domain?: string | null
          is_public?: boolean | null
          password?: string | null
          view_count?: number | null
          last_viewed_at?: string | null
          theme_color?: string | null
          font_family?: string | null
          background_image_url?: string | null
          logo_url?: string | null
          custom_css?: string | null
          custom_js?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_image_url?: string | null
          social_sharing?: boolean | null
        }
      }
      guests: {
        Row: {
          id: string
          user_id: string
          invitation_id: string
          name: string
          email: string
          phone: string | null
          status: string | null
          response_message: string | null
          responded_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          invitation_id: string
          name: string
          email: string
          phone?: string | null
          status?: string | null
          response_message?: string | null
          responded_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          invitation_id?: string
          name?: string
          email?: string
          phone?: string | null
          status?: string | null
          response_message?: string | null
          responded_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      email_logs: {
        Row: {
          id: string
          user_id: string
          invitation_id: string | null
          guest_id: string | null
          email_type: string
          recipient_email: string
          subject: string
          status: string | null
          provider: string | null
          external_id: string | null
          sent_at: string | null
          delivered_at: string | null
          opened_at: string | null
          clicked_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          invitation_id?: string | null
          guest_id?: string | null
          email_type: string
          recipient_email: string
          subject: string
          status?: string | null
          provider?: string | null
          external_id?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          clicked_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          invitation_id?: string | null
          guest_id?: string | null
          email_type?: string
          recipient_email?: string
          subject?: string
          status?: string | null
          provider?: string | null
          external_id?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          clicked_at?: string | null
        }
      }
      user_files: {
        Row: {
          id: string
          user_id: string
          invitation_id: string | null
          file_name: string
          file_type: string
          file_size: number
          file_path: string
          file_url: string | null
          is_public: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          invitation_id?: string | null
          file_name: string
          file_type: string
          file_size: number
          file_path: string
          file_url?: string | null
          is_public?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          invitation_id?: string | null
          file_name?: string
          file_type?: string
          file_size?: number
          file_path?: string
          file_url?: string | null
          is_public?: boolean | null
          created_at?: string | null
        }
      }
      stripe_customers: {
        Row: {
          id: number
          user_id: string
          customer_id: string
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          customer_id: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          customer_id?: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
      }
      stripe_orders: {
        Row: {
          id: number
          checkout_session_id: string
          payment_intent_id: string
          customer_id: string
          amount_subtotal: number
          amount_total: number
          currency: string
          payment_status: string
          status: string
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: number
          checkout_session_id: string
          payment_intent_id: string
          customer_id: string
          amount_subtotal: number
          amount_total: number
          currency: string
          payment_status: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: number
          checkout_session_id?: string
          payment_intent_id?: string
          customer_id?: string
          amount_subtotal?: number
          amount_total?: number
          currency?: string
          payment_status?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
      }
      stripe_subscriptions: {
        Row: {
          id: number
          customer_id: string
          subscription_id: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
          status: string
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: number
          customer_id: string
          subscription_id?: string | null
          price_id?: string | null
          current_period_start?: number | null
          current_period_end?: number | null
          cancel_at_period_end?: boolean | null
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          status: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: number
          customer_id?: string
          subscription_id?: string | null
          price_id?: string | null
          current_period_start?: number | null
          current_period_end?: number | null
          cancel_at_period_end?: boolean | null
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
      }
      plan_usage: {
        Row: {
          id: string
          user_id: string
          period_start: string
          period_end: string
          invitations_count: number | null
          guests_count: number | null
          emails_sent: number | null
          storage_used: number | null
          last_updated: string | null
        }
        Insert: {
          id?: string
          user_id: string
          period_start: string
          period_end: string
          invitations_count?: number | null
          guests_count?: number | null
          emails_sent?: number | null
          storage_used?: number | null
          last_updated?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          period_start?: string
          period_end?: string
          invitations_count?: number | null
          guests_count?: number | null
          emails_sent?: number | null
          storage_used?: number | null
          last_updated?: string | null
        }
      }
      template_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          display_order: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invitation_templates: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category_id: string | null
          is_premium: boolean | null
          is_active: boolean | null
          preview_image_url: string | null
          thumbnail_url: string | null
          color_palette: Json | null
          font_pairs: Json | null
          layout_options: Json | null
          default_settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category_id?: string | null
          is_premium?: boolean | null
          is_active?: boolean | null
          preview_image_url?: string | null
          thumbnail_url?: string | null
          color_palette?: Json | null
          font_pairs?: Json | null
          layout_options?: Json | null
          default_settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category_id?: string | null
          is_premium?: boolean | null
          is_active?: boolean | null
          preview_image_url?: string | null
          thumbnail_url?: string | null
          color_palette?: Json | null
          font_pairs?: Json | null
          layout_options?: Json | null
          default_settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      template_images: {
        Row: {
          id: string
          template_id: string
          image_url: string
          image_type: string
          display_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          template_id: string
          image_url: string
          image_type: string
          display_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          template_id?: string
          image_url?: string
          image_type?: string
          display_order?: number | null
          created_at?: string | null
        }
      }
      invitation_tables: {
        Row: {
          id: string
          invitation_id: string
          name: string
          description: string | null
          capacity: number | null
          is_vip: boolean | null
          location_description: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          invitation_id: string
          name: string
          description?: string | null
          capacity?: number | null
          is_vip?: boolean | null
          location_description?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          invitation_id?: string
          name?: string
          description?: string | null
          capacity?: number | null
          is_vip?: boolean | null
          location_description?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invitation_guests_extended: {
        Row: {
          id: string
          guest_id: string
          table_id: string | null
          guest_type: string
          dietary_restrictions: string | null
          plus_one: boolean | null
          plus_one_name: string | null
          plus_one_email: string | null
          plus_one_phone: string | null
          whatsapp_number: string | null
          telegram_username: string | null
          age_group: string | null
          relationship: string | null
          side: string | null
          gift_registry_contribution: boolean | null
          gift_description: string | null
          additional_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          guest_id: string
          table_id?: string | null
          guest_type: string
          dietary_restrictions?: string | null
          plus_one?: boolean | null
          plus_one_name?: string | null
          plus_one_email?: string | null
          plus_one_phone?: string | null
          whatsapp_number?: string | null
          telegram_username?: string | null
          age_group?: string | null
          relationship?: string | null
          side?: string | null
          gift_registry_contribution?: boolean | null
          gift_description?: string | null
          additional_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          guest_id?: string
          table_id?: string | null
          guest_type?: string
          dietary_restrictions?: string | null
          plus_one?: boolean | null
          plus_one_name?: string | null
          plus_one_email?: string | null
          plus_one_phone?: string | null
          whatsapp_number?: string | null
          telegram_username?: string | null
          age_group?: string | null
          relationship?: string | null
          side?: string | null
          gift_registry_contribution?: boolean | null
          gift_description?: string | null
          additional_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invitation_media: {
        Row: {
          id: string
          invitation_id: string
          user_id: string
          media_type: string
          file_id: string | null
          title: string | null
          description: string | null
          display_order: number | null
          is_featured: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          invitation_id: string
          user_id: string
          media_type: string
          file_id?: string | null
          title?: string | null
          description?: string | null
          display_order?: number | null
          is_featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          invitation_id?: string
          user_id?: string
          media_type?: string
          file_id?: string | null
          title?: string | null
          description?: string | null
          display_order?: number | null
          is_featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invitation_thank_you: {
        Row: {
          id: string
          invitation_id: string
          guest_id: string | null
          message: string
          author_name: string | null
          author_email: string | null
          is_public: boolean | null
          is_approved: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          invitation_id: string
          guest_id?: string | null
          message: string
          author_name?: string | null
          author_email?: string | null
          is_public?: boolean | null
          is_approved?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          invitation_id?: string
          guest_id?: string | null
          message?: string
          author_name?: string | null
          author_email?: string | null
          is_public?: boolean | null
          is_approved?: boolean | null
          created_at?: string | null
        }
      }
      invitation_rsvp_questions: {
        Row: {
          id: string
          invitation_id: string
          question: string
          question_type: string
          options: Json | null
          is_required: boolean | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          invitation_id: string
          question: string
          question_type: string
          options?: Json | null
          is_required?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          invitation_id?: string
          question?: string
          question_type?: string
          options?: Json | null
          is_required?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invitation_rsvp_answers: {
        Row: {
          id: string
          question_id: string
          guest_id: string
          answer: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          question_id: string
          guest_id: string
          answer?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          question_id?: string
          guest_id?: string
          answer?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      template_details: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          is_premium: boolean | null
          is_active: boolean | null
          preview_image_url: string | null
          thumbnail_url: string | null
          color_palette: Json | null
          font_pairs: Json | null
          layout_options: Json | null
          default_settings: Json | null
          created_at: string | null
          updated_at: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          category_icon: string | null
          usage_count: number | null
          unique_users: number | null
          total_views: number | null
        }
      }
      invitation_details: {
        Row: {
          id: string
          user_id: string
          title: string
          template_id: string | null
          template_name: string | null
          is_premium_template: boolean | null
          bride_name: string | null
          groom_name: string | null
          event_date: string | null
          event_time: string | null
          venue: string | null
          address: string | null
          message: string | null
          dress_code: string | null
          rsvp_deadline: string | null
          status: string | null
          view_count: number | null
          last_viewed_at: string | null
          created_at: string | null
          updated_at: string | null
          total_guests: number | null
          confirmed_guests: number | null
          pending_guests: number | null
          declined_guests: number | null
          confirmation_rate: number | null
          table_count: number | null
          media_count: number | null
          thank_you_count: number | null
          rsvp_question_count: number | null
        }
      }
      table_details: {
        Row: {
          id: string
          invitation_id: string
          invitation_title: string | null
          name: string
          description: string | null
          capacity: number | null
          is_vip: boolean | null
          location_description: string | null
          notes: string | null
          assigned_guests: number | null
          available_seats: number | null
          confirmed_guests: number | null
          pending_guests: number | null
          declined_guests: number | null
        }
      }
      guest_details: {
        Row: {
          id: string
          invitation_id: string
          invitation_title: string | null
          user_id: string
          name: string
          email: string
          phone: string | null
          status: string | null
          response_message: string | null
          responded_at: string | null
          created_at: string | null
          updated_at: string | null
          table_id: string | null
          table_name: string | null
          guest_type: string | null
          dietary_restrictions: string | null
          plus_one: boolean | null
          plus_one_name: string | null
          plus_one_email: string | null
          plus_one_phone: string | null
          whatsapp_number: string | null
          telegram_username: string | null
          age_group: string | null
          relationship: string | null
          side: string | null
          gift_registry_contribution: boolean | null
          gift_description: string | null
          additional_notes: string | null
          answered_questions: number | null
        }
      }
      media_details: {
        Row: {
          id: string
          invitation_id: string
          invitation_title: string | null
          user_id: string
          media_type: string
          file_id: string | null
          file_name: string | null
          file_type: string | null
          file_size: number | null
          file_url: string | null
          title: string | null
          description: string | null
          display_order: number | null
          is_featured: boolean | null
          created_at: string | null
          updated_at: string | null
        }
      }
      user_template_stats: {
        Row: {
          user_id: string
          email: string
          template_id: string
          template_name: string
          is_premium: boolean | null
          invitation_count: number | null
          total_views: number | null
          total_guests: number | null
          confirmed_guests: number | null
          last_used_at: string | null
        }
      }
      template_stats: {
        Row: {
          template_id: string
          template_name: string
          category_id: string | null
          category_name: string | null
          is_premium: boolean | null
          usage_count: number | null
          total_views: number | null
          unique_users: number | null
          created_at: string | null
          updated_at: string | null
        }
      }
      guest_stats: {
        Row: {
          invitation_id: string
          invitation_title: string
          user_id: string
          total_guests: number | null
          confirmed_guests: number | null
          pending_guests: number | null
          declined_guests: number | null
          confirmation_rate: number | null
          table_count: number | null
          plus_ones: number | null
          thank_you_count: number | null
        }
      }
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
      stripe_user_orders: {
        Row: {
          customer_id: string | null
          order_id: number | null
          checkout_session_id: string | null
          payment_intent_id: string | null
          amount_subtotal: number | null
          amount_total: number | null
          currency: string | null
          payment_status: string | null
          order_status: string | null
          order_date: string | null
        }
      }
      user_usage_stats: {
        Row: {
          user_id: string | null
          email: string | null
          invitations_this_month: number | null
          total_guests: number | null
          emails_this_month: number | null
          storage_used_mb: number | null
          subscription_status: string | null
          price_id: string | null
        }
      }
    }
    Functions: {
      user_has_permission: {
        Args: {
          user_uuid: string
          permission_name: string
        }
        Returns: boolean
      }
      get_user_roles: {
        Args: {
          user_uuid: string
        }
        Returns: {
          role_name: string
          role_description: string
          role_id: string
          assigned_at: string
          expires_at: string | null
        }[]
      }
      get_user_permissions: {
        Args: {
          user_uuid: string
        }
        Returns: {
          permission_name: string
          permission_description: string
          resource: string
          action: string
          permission_id: string
        }[]
      }
      is_admin: {
        Args: {
          user_uuid?: string
        }
        Returns: boolean
      }
      is_admin_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_role_safe: {
        Args: {
          role_name: string
        }
        Returns: boolean
      }
      search_templates: {
        Args: {
          search_term?: string
          category_slug?: string
          is_premium_only?: boolean
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          description: string
          category_id: string
          category_name: string
          is_premium: boolean
          preview_image_url: string
          thumbnail_url: string
          color_palette: Json
          usage_count: number
        }[]
      }
      create_invitation_from_template: {
        Args: {
          user_uuid: string
          template_uuid: string
          invitation_title: string
          bride_name?: string
          groom_name?: string
          event_date?: string
          event_time?: string
          venue?: string
        }
        Returns: string
      }
      duplicate_invitation: {
        Args: {
          invitation_uuid: string
          new_title?: string
        }
        Returns: string
      }
      get_template_usage_stats: {
        Args: {
          days_limit?: number
        }
        Returns: {
          template_id: string
          template_name: string
          category_name: string
          is_premium: boolean
          usage_count: number
          view_count: number
          unique_users: number
          avg_guests: number
          avg_confirmation_rate: number
        }[]
      }
      get_recommended_templates: {
        Args: {
          user_uuid: string
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          description: string
          category_name: string
          is_premium: boolean
          preview_image_url: string
          color_palette: Json
          score: number
        }[]
      }
      get_table_guests: {
        Args: {
          table_uuid: string
        }
        Returns: {
          guest_id: string
          guest_name: string
          guest_email: string
          guest_status: string
          guest_type: string
          plus_one: boolean
          plus_one_name: string
          relationship: string
          side: string
        }[]
      }
      increment_invitation_view_count: {
        Args: {
          invitation_uuid: string
        }
        Returns: undefined
      }
      calculate_user_usage: {
        Args: {
          user_uuid: string
          start_date?: string
        }
        Returns: {
          invitations_count: number
          guests_count: number
          emails_sent: number
          storage_used: number
        }
      }
      check_plan_limit: {
        Args: {
          user_uuid: string
          limit_type: string
          amount?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      stripe_subscription_status: "not_started" | "incomplete" | "incomplete_expired" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused"
      stripe_order_status: "pending" | "completed" | "canceled"
    }
  }
}