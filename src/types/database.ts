export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type RoleType = "hire" | "work";
export type JobStatus = "open" | "booked" | "completed" | "cancelled";
export type ApplicationStatus = "applied" | "accepted" | "declined";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          role: RoleType;
          full_name: string | null;
          bio: string | null;
          skills: string[] | null;
          hourly_rate: number | null;
          location: string | null;
          avatar_url: string | null;
          experience_years: number | null;
          certifications: string[] | null;
          availability: Json | null;
        };
        Insert: {
          id: string;
          role: RoleType;
          full_name?: string | null;
          bio?: string | null;
          skills?: string[] | null;
          hourly_rate?: number | null;
          location?: string | null;
          avatar_url?: string | null;
          experience_years?: number | null;
          certifications?: string[] | null;
          availability?: Json | null;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["profiles"]["Insert"], "id">>;
      };
      jobs: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string;
          event_date: string;
          start_time: string | null;
          end_time: string | null;
          location: string;
          rate: number | null;
          status: JobStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description: string;
          event_date: string;
          start_time?: string | null;
          end_time?: string | null;
          location: string;
          rate?: number | null;
          status?: JobStatus;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["jobs"]["Insert"], "client_id">>;
      };
      job_applications: {
        Row: {
          id: string;
          job_id: string;
          worker_id: string;
          cover_letter: string | null;
          status: ApplicationStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          worker_id: string;
          cover_letter?: string | null;
          status?: ApplicationStatus;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["job_applications"]["Insert"], "job_id" | "worker_id">>;
      };
      messages: {
        Row: {
          id: string;
          job_id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["messages"]["Insert"], "job_id" | "sender_id" | "recipient_id">>;
      };
      reviews: {
        Row: {
          id: string;
          job_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["reviews"]["Insert"], "job_id" | "reviewer_id" | "reviewee_id">>;
      };
    };
    Functions: Record<string, never>;
    Enums: {
      role_type: RoleType;
      job_status: JobStatus;
      application_status: ApplicationStatus;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type JobApplication = Database["public"]["Tables"]["job_applications"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
