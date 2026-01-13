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
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: 'admin' | 'manager' | 'sales_rep'
          team: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: 'admin' | 'manager' | 'sales_rep'
          team?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: 'admin' | 'manager' | 'sales_rep'
          team?: string | null
          created_at?: string
        }
      }
      sales_funnel: {
        Row: {
          id: string
          client_name: string
          work_info: string | null
          stage: 'Closed' | 'Won' | 'Hot' | 'Warm' | 'Cold' | 'Lost'
          price: number | null
          price_without_vat: number | null
          payment_percentage: number | null
          paid_amount: number | null
          created_date: string | null
          close_date: string | null
          team_member: string | null
          progress_to_won: number | null
          progress_notes: string | null
          status: 'Not started' | 'In progress' | 'Complate' | null
          remarks: string | null
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          work_info?: string | null
          stage: 'Closed' | 'Won' | 'Hot' | 'Warm' | 'Cold' | 'Lost'
          price?: number | null
          price_without_vat?: number | null
          payment_percentage?: number | null
          paid_amount?: number | null
          created_date?: string | null
          close_date?: string | null
          team_member?: string | null
          progress_to_won?: number | null
          progress_notes?: string | null
          status?: 'Not started' | 'In progress' | 'Complate' | null
          remarks?: string | null
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          work_info?: string | null
          stage?: 'Closed' | 'Won' | 'Hot' | 'Warm' | 'Cold' | 'Lost'
          price?: number | null
          price_without_vat?: number | null
          payment_percentage?: number | null
          paid_amount?: number | null
          created_date?: string | null
          close_date?: string | null
          team_member?: string | null
          progress_to_won?: number | null
          progress_notes?: string | null
          status?: 'Not started' | 'In progress' | 'Complate' | null
          remarks?: string | null
          created_by?: string | null
          updated_at?: string
        }
      }
      service_contracts: {
        Row: {
          id: string
          client_name: string
          contract_info: string | null
          stage: 'Closed' | 'Hot' | 'Warm'
          price: number | null
          price_without_vat: number | null
          payment_percentage: number | null
          yearly_payment: number | null
          created_date: string | null
          close_date: string | null
          team_member: string | null
          progress_to_won: number | null
          progress_notes: string | null
          status: 'Not started' | 'In progress' | 'Complate' | null
          remarks: string | null
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          contract_info?: string | null
          stage: 'Closed' | 'Hot' | 'Warm'
          price?: number | null
          price_without_vat?: number | null
          payment_percentage?: number | null
          yearly_payment?: number | null
          created_date?: string | null
          close_date?: string | null
          team_member?: string | null
          progress_to_won?: number | null
          progress_notes?: string | null
          status?: 'Not started' | 'In progress' | 'Complate' | null
          remarks?: string | null
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          contract_info?: string | null
          stage?: 'Closed' | 'Hot' | 'Warm'
          price?: number | null
          price_without_vat?: number | null
          payment_percentage?: number | null
          yearly_payment?: number | null
          created_date?: string | null
          close_date?: string | null
          team_member?: string | null
          progress_to_won?: number | null
          progress_notes?: string | null
          status?: 'Not started' | 'In progress' | 'Complate' | null
          remarks?: string | null
          created_by?: string | null
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          setting_type: 'sales_funnel' | 'service_contract'
          stage_name: string | null
          probability: number | null
          team_name: string | null
          target_2026: number | null
        }
        Insert: {
          id?: string
          setting_type: 'sales_funnel' | 'service_contract'
          stage_name?: string | null
          probability?: number | null
          team_name?: string | null
          target_2026?: number | null
        }
        Update: {
          id?: string
          setting_type?: 'sales_funnel' | 'service_contract'
          stage_name?: string | null
          probability?: number | null
          team_name?: string | null
          target_2026?: number | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'reminder' | 'alert' | 'info'
          link: string | null
          related_id: string | null
          related_type: 'sales_funnel' | 'service_contract' | null
          is_read: boolean
          is_push_sent: boolean
          scheduled_for: string | null
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'reminder' | 'alert' | 'info'
          link?: string | null
          related_id?: string | null
          related_type?: 'sales_funnel' | 'service_contract' | null
          is_read?: boolean
          is_push_sent?: boolean
          scheduled_for?: string | null
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'reminder' | 'alert' | 'info'
          link?: string | null
          related_id?: string | null
          related_type?: 'sales_funnel' | 'service_contract' | null
          is_read?: boolean
          is_push_sent?: boolean
          scheduled_for?: string | null
          created_at?: string
          read_at?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          description: string
          category: 'Оффис' | 'Тоног төхөөрөмж' | 'Тээвэр' | 'Маркетинг' | 'Бусад'
          amount: number
          expense_date: string
          vendor: string | null
          receipt_number: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          category: 'Оффис' | 'Тоног төхөөрөмж' | 'Тээвэр' | 'Маркетинг' | 'Бусад'
          amount: number
          expense_date: string
          vendor?: string | null
          receipt_number?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          category?: 'Оффис' | 'Тоног төхөөрөмж' | 'Тээвэр' | 'Маркетинг' | 'Бусад'
          amount?: number
          expense_date?: string
          vendor?: string | null
          receipt_number?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      salaries: {
        Row: {
          id: string
          employee_name: string
          position: string | null
          base_salary: number
          bonus: number | null
          deductions: number | null
          net_salary: number | null
          payment_date: string
          payment_month: string
          payment_status: 'Pending' | 'Paid' | 'Cancelled'
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_name: string
          position?: string | null
          base_salary: number
          bonus?: number | null
          deductions?: number | null
          net_salary?: number | null
          payment_date: string
          payment_month: string
          payment_status?: 'Pending' | 'Paid' | 'Cancelled'
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_name?: string
          position?: string | null
          base_salary?: number
          bonus?: number | null
          deductions?: number | null
          net_salary?: number | null
          payment_date?: string
          payment_month?: string
          payment_status?: 'Pending' | 'Paid' | 'Cancelled'
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stock: {
        Row: {
          id: string
          product_name: string
          sku: string | null
          category: 'FAS' | 'PAS' | 'CCTV' | 'Access' | 'Бусад' | null
          quantity: number
          unit_price: number | null
          total_value: number | null
          min_stock_level: number | null
          location: string | null
          supplier: string | null
          last_restock_date: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_name: string
          sku?: string | null
          category?: 'FAS' | 'PAS' | 'CCTV' | 'Access' | 'Бусад' | null
          quantity?: number
          unit_price?: number | null
          total_value?: number | null
          min_stock_level?: number | null
          location?: string | null
          supplier?: string | null
          last_restock_date?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_name?: string
          sku?: string | null
          category?: 'FAS' | 'PAS' | 'CCTV' | 'Access' | 'Бусад' | null
          quantity?: number
          unit_price?: number | null
          total_value?: number | null
          min_stock_level?: number | null
          location?: string | null
          supplier?: string | null
          last_restock_date?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type SalesFunnel = Database['public']['Tables']['sales_funnel']['Row']
export type SalesFunnelInsert = Database['public']['Tables']['sales_funnel']['Insert']
export type SalesFunnelUpdate = Database['public']['Tables']['sales_funnel']['Update']

export type ServiceContract = Database['public']['Tables']['service_contracts']['Row']
export type ServiceContractInsert = Database['public']['Tables']['service_contracts']['Insert']
export type ServiceContractUpdate = Database['public']['Tables']['service_contracts']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Settings = Database['public']['Tables']['settings']['Row']

export type Stage = 'Closed' | 'Won' | 'Hot' | 'Warm' | 'Cold' | 'Lost'
export type ServiceContractStage = 'Closed' | 'Hot' | 'Warm'
export type Status = 'Not started' | 'In progress' | 'Complate'
export type TeamMember = 'FAS' | 'PAS' | 'CCTV' | 'Access' | 'Other' | 'Бараа нийлүүлэлт'
export type Role = 'admin' | 'manager' | 'sales_rep'

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']
export type ExpenseCategory = 'Оффис' | 'Тоног төхөөрөмж' | 'Тээвэр' | 'Маркетинг' | 'Бусад'

export type Salary = Database['public']['Tables']['salaries']['Row']
export type SalaryInsert = Database['public']['Tables']['salaries']['Insert']
export type SalaryUpdate = Database['public']['Tables']['salaries']['Update']
export type PaymentStatus = 'Pending' | 'Paid' | 'Cancelled'

export type Stock = Database['public']['Tables']['stock']['Row']
export type StockInsert = Database['public']['Tables']['stock']['Insert']
export type StockUpdate = Database['public']['Tables']['stock']['Update']
export type StockCategory = 'FAS' | 'PAS' | 'CCTV' | 'Access' | 'Бусад'

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type PushSubscription = Database['public']['Tables']['push_subscriptions']['Row']
export type PushSubscriptionInsert = Database['public']['Tables']['push_subscriptions']['Insert']
export type PushSubscriptionUpdate = Database['public']['Tables']['push_subscriptions']['Update']
