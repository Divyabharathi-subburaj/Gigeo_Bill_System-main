export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string
          company_address: string | null
          gstin: string | null
          signature_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string
          company_address?: string | null
          gstin?: string | null
          signature_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string
          company_address?: string | null
          gstin?: string | null
          signature_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          mobile_number: string | null
          email: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          mobile_number?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          mobile_number?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          invoice_number: string
          customer_id: string
          sub_total: number
          discount: number
          total: number
          payment_mode: string
          amount_received: number
          balance: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          customer_id: string
          sub_total?: number
          discount?: number
          total?: number
          payment_mode: string
          amount_received?: number
          balance?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          customer_id?: string
          sub_total?: number
          discount?: number
          total?: number
          payment_mode?: string
          amount_received?: number
          balance?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      bill_items: {
        Row: {
          id: string
          bill_id: string
          item_name: string
          quantity: number
          price: number
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          bill_id: string
          item_name: string
          quantity?: number
          price?: number
          amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          bill_id?: string
          item_name?: string
          quantity?: number
          price?: number
          amount?: number
          created_at?: string
        }
      }
    }
  }
}