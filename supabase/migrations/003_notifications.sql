-- =============================================
-- Notifications Table
-- =============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'reminder', -- reminder, alert, info
  link TEXT, -- Link to related item (e.g., /sales-funnel/123)
  related_id UUID, -- ID of related record
  related_type TEXT, -- 'sales_funnel' or 'service_contract'
  is_read BOOLEAN DEFAULT FALSE,
  is_push_sent BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create push_subscriptions table for browser push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON public.notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Function to create reminder notifications
CREATE OR REPLACE FUNCTION create_reminder_notifications()
RETURNS void AS $$
DECLARE
  rec RECORD;
  notification_date DATE;
BEGIN
  -- Check sales_funnel close dates
  FOR rec IN
    SELECT sf.id, sf.client_name, sf.close_date, sf.created_by
    FROM public.sales_funnel sf
    WHERE sf.close_date IS NOT NULL
      AND sf.close_date::date = CURRENT_DATE + INTERVAL '1 day'
      AND sf.stage NOT IN ('Closed', 'Lost')
      AND sf.created_by IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.related_id = sf.id
          AND n.related_type = 'sales_funnel'
          AND n.scheduled_for::date = CURRENT_DATE
      )
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, link, related_id, related_type, scheduled_for)
    VALUES (
      rec.created_by,
      'Борлуулалт дуусах огноо ойртлоо',
      rec.client_name || ' - маргааш дуусна',
      'reminder',
      '/sales-funnel/' || rec.id,
      rec.id,
      'sales_funnel',
      NOW()
    );
  END LOOP;

  -- Check service_contracts close dates
  FOR rec IN
    SELECT sc.id, sc.client_name, sc.close_date, sc.created_by
    FROM public.service_contracts sc
    WHERE sc.close_date IS NOT NULL
      AND sc.close_date::date = CURRENT_DATE + INTERVAL '1 day'
      AND sc.stage != 'Closed'
      AND sc.created_by IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.related_id = sc.id
          AND n.related_type = 'service_contract'
          AND n.scheduled_for::date = CURRENT_DATE
      )
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, link, related_id, related_type, scheduled_for)
    VALUES (
      rec.created_by,
      'Гэрээ дуусах огноо ойртлоо',
      rec.client_name || ' - маргааш дуусна',
      'reminder',
      '/service-contracts/' || rec.id,
      rec.id,
      'service_contract',
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
