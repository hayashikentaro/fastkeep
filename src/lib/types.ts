export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type NoteColor = "plain" | "amber" | "mint" | "rose" | "sky";
export type ProjectionStatus = "none" | "synced" | "error";

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          color: NoteColor;
          is_pinned: boolean;
          is_archived: boolean;
          due_at: string | null;
          calendar_event_id: string | null;
          calendar_projection_status: ProjectionStatus;
          calendar_projection_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          content?: string;
          color?: NoteColor;
          is_pinned?: boolean;
          is_archived?: boolean;
          due_at?: string | null;
          calendar_event_id?: string | null;
          calendar_projection_status?: ProjectionStatus;
          calendar_projection_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          color?: NoteColor;
          is_pinned?: boolean;
          is_archived?: boolean;
          due_at?: string | null;
          calendar_event_id?: string | null;
          calendar_projection_status?: ProjectionStatus;
          calendar_projection_error?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      google_connections: {
        Row: {
          user_id: string;
          access_token: string;
          refresh_token: string | null;
          expires_at: string | null;
          scope: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          access_token: string;
          refresh_token?: string | null;
          expires_at?: string | null;
          scope?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          access_token?: string;
          refresh_token?: string | null;
          expires_at?: string | null;
          scope?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type GoogleConnection = Database["public"]["Tables"]["google_connections"]["Row"];
