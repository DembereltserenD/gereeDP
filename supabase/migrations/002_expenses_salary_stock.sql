-- =============================================
-- Expenses, Salary, and Stock Tables
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create expenses table (Зардал)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Оффис', 'Тоног төхөөрөмж', 'Тээвэр', 'Маркетинг', 'Бусад')),
  amount NUMERIC(15,2) NOT NULL,
  expense_date DATE NOT NULL,
  vendor TEXT,
  receipt_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create salary table (Цалин)
CREATE TABLE IF NOT EXISTS public.salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  position TEXT,
  base_salary NUMERIC(15,2) NOT NULL,
  bonus NUMERIC(15,2) DEFAULT 0,
  deductions NUMERIC(15,2) DEFAULT 0,
  net_salary NUMERIC(15,2),
  payment_date DATE NOT NULL,
  payment_month TEXT NOT NULL,
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Cancelled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create stock table (Бараа материал)
CREATE TABLE IF NOT EXISTS public.stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  sku TEXT UNIQUE,
  category TEXT CHECK (category IN ('FAS', 'PAS', 'CCTV', 'Access', 'Бусад')),
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC(15,2),
  total_value NUMERIC(15,2),
  min_stock_level INTEGER DEFAULT 0,
  location TEXT,
  supplier TEXT,
  last_restock_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON public.expenses(created_by);

CREATE INDEX IF NOT EXISTS idx_salaries_employee ON public.salaries(employee_name);
CREATE INDEX IF NOT EXISTS idx_salaries_payment_date ON public.salaries(payment_date);
CREATE INDEX IF NOT EXISTS idx_salaries_status ON public.salaries(payment_status);

CREATE INDEX IF NOT EXISTS idx_stock_product ON public.stock(product_name);
CREATE INDEX IF NOT EXISTS idx_stock_category ON public.stock(category);
CREATE INDEX IF NOT EXISTS idx_stock_sku ON public.stock(sku);

-- 5. Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for expenses
CREATE POLICY "Users can view all expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own expenses or admins/managers can update any"
  ON public.expenses FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Admins can delete expenses"
  ON public.expenses FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. RLS Policies for salaries
CREATE POLICY "Only admins and managers can view salaries"
  ON public.salaries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Only admins can insert salaries"
  ON public.salaries FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update salaries"
  ON public.salaries FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete salaries"
  ON public.salaries FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. RLS Policies for stock
CREATE POLICY "Users can view all stock"
  ON public.stock FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert stock"
  ON public.stock FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own stock or admins/managers can update any"
  ON public.stock FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Admins can delete stock"
  ON public.stock FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 9. Triggers for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_salaries_updated_at
  BEFORE UPDATE ON public.salaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_stock_updated_at
  BEFORE UPDATE ON public.stock
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 10. Function to calculate net salary automatically
CREATE OR REPLACE FUNCTION public.calculate_net_salary()
RETURNS TRIGGER AS $$
BEGIN
  NEW.net_salary = NEW.base_salary + COALESCE(NEW.bonus, 0) - COALESCE(NEW.deductions, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_salary_net
  BEFORE INSERT OR UPDATE ON public.salaries
  FOR EACH ROW EXECUTE FUNCTION public.calculate_net_salary();

-- 11. Function to calculate stock total value
CREATE OR REPLACE FUNCTION public.calculate_stock_value()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_value = NEW.quantity * COALESCE(NEW.unit_price, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_stock_total
  BEFORE INSERT OR UPDATE ON public.stock
  FOR EACH ROW EXECUTE FUNCTION public.calculate_stock_value();
