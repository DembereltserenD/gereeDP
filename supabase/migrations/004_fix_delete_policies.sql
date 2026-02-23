-- Fix delete policies to allow admins, managers, and record owners to delete

-- Service contracts: drop admin-only policy, replace with owner + admin/manager
DROP POLICY IF EXISTS "Admins can delete service_contracts" ON public.service_contracts;

CREATE POLICY "Users can delete own service_contracts or admins managers can delete any"
  ON public.service_contracts FOR DELETE
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Sales funnel: same fix for consistency
DROP POLICY IF EXISTS "Admins can delete sales_funnel" ON public.sales_funnel;

CREATE POLICY "Users can delete own sales_funnel or admins managers can delete any"
  ON public.sales_funnel FOR DELETE
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );
