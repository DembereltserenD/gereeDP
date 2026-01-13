-- =============================================
-- Sales Funnel CRM Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'sales_rep' CHECK (role IN ('admin', 'manager', 'sales_rep')),
  team TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create sales_funnel table
CREATE TABLE IF NOT EXISTS public.sales_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  work_info TEXT,
  stage TEXT NOT NULL CHECK (stage IN ('Closed', 'Won', 'Hot', 'Warm', 'Cold', 'Lost')),
  price NUMERIC(15,2),
  price_without_vat NUMERIC(15,2),
  payment_percentage NUMERIC(3,2) CHECK (payment_percentage >= 0 AND payment_percentage <= 1),
  paid_amount NUMERIC(15,2),
  created_date DATE,
  close_date DATE,
  team_member TEXT,
  progress_to_won NUMERIC(3,2) CHECK (progress_to_won >= 0 AND progress_to_won <= 1),
  progress_notes TEXT,
  status TEXT CHECK (status IN ('Not started', 'In progress', 'Complate')),
  remarks TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create service_contracts table
CREATE TABLE IF NOT EXISTS public.service_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  contract_info TEXT DEFAULT 'Service',
  stage TEXT NOT NULL CHECK (stage IN ('Closed', 'Hot', 'Warm')),
  price NUMERIC(15,2),
  price_without_vat NUMERIC(15,2),
  payment_percentage NUMERIC(3,2) CHECK (payment_percentage >= 0 AND payment_percentage <= 1),
  yearly_payment NUMERIC(15,2),
  created_date DATE,
  close_date DATE,
  team_member TEXT DEFAULT 'Сервис гэрээ',
  progress_to_won NUMERIC(3,2) CHECK (progress_to_won >= 0 AND progress_to_won <= 1),
  progress_notes TEXT,
  status TEXT CHECK (status IN ('Not started', 'In progress', 'Complate')),
  remarks TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_type TEXT NOT NULL CHECK (setting_type IN ('sales_funnel', 'service_contract')),
  stage_name TEXT,
  probability NUMERIC(3,2),
  team_name TEXT,
  target_2026 NUMERIC(15,2)
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_funnel_stage ON public.sales_funnel(stage);
CREATE INDEX IF NOT EXISTS idx_sales_funnel_team ON public.sales_funnel(team_member);
CREATE INDEX IF NOT EXISTS idx_sales_funnel_created_date ON public.sales_funnel(created_date);
CREATE INDEX IF NOT EXISTS idx_sales_funnel_client ON public.sales_funnel(client_name);

CREATE INDEX IF NOT EXISTS idx_service_contracts_stage ON public.service_contracts(stage);
CREATE INDEX IF NOT EXISTS idx_service_contracts_created_date ON public.service_contracts(created_date);
CREATE INDEX IF NOT EXISTS idx_service_contracts_client ON public.service_contracts(client_name);

-- 6. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. RLS Policies for sales_funnel
CREATE POLICY "Users can view all sales_funnel"
  ON public.sales_funnel FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert sales_funnel"
  ON public.sales_funnel FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own sales_funnel or admins/managers can update any"
  ON public.sales_funnel FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Admins can delete sales_funnel"
  ON public.sales_funnel FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 9. RLS Policies for service_contracts
CREATE POLICY "Users can view all service_contracts"
  ON public.service_contracts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert service_contracts"
  ON public.service_contracts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own service_contracts or admins/managers can update any"
  ON public.service_contracts FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Admins can delete service_contracts"
  ON public.service_contracts FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 10. RLS Policies for settings
CREATE POLICY "Anyone can view settings"
  ON public.settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 11. Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'sales_rep')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_sales_funnel_updated_at
  BEFORE UPDATE ON public.sales_funnel
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_service_contracts_updated_at
  BEFORE UPDATE ON public.service_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 13. Insert default settings
INSERT INTO public.settings (setting_type, team_name, target_2026) VALUES
  ('sales_funnel', 'Team target', 1000000000),
  ('sales_funnel', 'FAS', 400000000),
  ('sales_funnel', 'PAS', 100000000),
  ('sales_funnel', 'CCTV', 200000000),
  ('sales_funnel', 'Бараа нийлүүлэлт', 100000000),
  ('sales_funnel', 'Access', 100000000),
  ('sales_funnel', 'Other', 100000000),
  ('service_contract', 'Team target', 1800000000),
  ('service_contract', 'Сервис гэрээ', 1800000000);

-- Stage probabilities
INSERT INTO public.settings (setting_type, stage_name, probability) VALUES
  ('sales_funnel', 'Cold', 0),
  ('sales_funnel', 'Warm', 0),
  ('sales_funnel', 'Hot', 0),
  ('sales_funnel', 'Won', 0.3),
  ('sales_funnel', 'Closed', 1),
  ('sales_funnel', 'Lost', 0);

-- 14. Function to get dashboard metrics
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(year_filter INTEGER DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_opportunities', (SELECT COUNT(*) FROM public.sales_funnel WHERE (year_filter IS NULL OR EXTRACT(YEAR FROM created_date) = year_filter)),
    'total_value', (SELECT COALESCE(SUM(price), 0) FROM public.sales_funnel WHERE (year_filter IS NULL OR EXTRACT(YEAR FROM created_date) = year_filter)),
    'closed_value', (SELECT COALESCE(SUM(price), 0) FROM public.sales_funnel WHERE stage = 'Closed' AND (year_filter IS NULL OR EXTRACT(YEAR FROM created_date) = year_filter)),
    'won_value', (SELECT COALESCE(SUM(price), 0) FROM public.sales_funnel WHERE stage = 'Won' AND (year_filter IS NULL OR EXTRACT(YEAR FROM created_date) = year_filter)),
    'hot_value', (SELECT COALESCE(SUM(price), 0) FROM public.sales_funnel WHERE stage = 'Hot' AND (year_filter IS NULL OR EXTRACT(YEAR FROM created_date) = year_filter)),
    'lost_value', (SELECT COALESCE(SUM(price), 0) FROM public.sales_funnel WHERE stage = 'Lost' AND (year_filter IS NULL OR EXTRACT(YEAR FROM created_date) = year_filter)),
    'by_stage', (
      SELECT json_agg(json_build_object('stage', stage, 'count', cnt, 'value', total))
      FROM (
        SELECT stage, COUNT(*) as cnt, COALESCE(SUM(price), 0) as total
        FROM public.sales_funnel
        WHERE (year_filter IS NULL OR EXTRACT(YEAR FROM created_date) = year_filter)
        GROUP BY stage
      ) s
    ),
    'by_team', (
      SELECT json_agg(json_build_object('team', team_member, 'count', cnt, 'value', total))
      FROM (
        SELECT team_member, COUNT(*) as cnt, COALESCE(SUM(price), 0) as total
        FROM public.sales_funnel
        WHERE (year_filter IS NULL OR EXTRACT(YEAR FROM created_date) = year_filter)
        GROUP BY team_member
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Function to get funnel conversion rates
CREATE OR REPLACE FUNCTION public.get_funnel_conversions()
RETURNS TABLE (
  stage TEXT,
  count BIGINT,
  value NUMERIC,
  conversion_rate NUMERIC
) AS $$
DECLARE
  total_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_count FROM public.sales_funnel;

  RETURN QUERY
  SELECT
    sf.stage,
    COUNT(*)::BIGINT as count,
    COALESCE(SUM(sf.price), 0) as value,
    CASE WHEN total_count > 0 THEN (COUNT(*)::NUMERIC / total_count * 100) ELSE 0 END as conversion_rate
  FROM public.sales_funnel sf
  GROUP BY sf.stage
  ORDER BY
    CASE sf.stage
      WHEN 'Cold' THEN 1
      WHEN 'Warm' THEN 2
      WHEN 'Hot' THEN 3
      WHEN 'Won' THEN 4
      WHEN 'Closed' THEN 5
      WHEN 'Lost' THEN 6
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
