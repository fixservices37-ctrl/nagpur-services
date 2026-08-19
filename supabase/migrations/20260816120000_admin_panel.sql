-- =====================================================================
-- Admin panel
--
-- Adds staff authentication (roles), admin-only read/update access to
-- service requests, workflow fields the owner needs when following up on
-- a request, and hardening for the customer photo bucket.
--
-- The public request form is untouched: anonymous customers can still
-- submit through public.submit_service_request(), and still cannot read
-- anything back.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Roles
-- ---------------------------------------------------------------------

DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Roles are read through SECURITY DEFINER helpers so RLS policies that
-- depend on them never recurse back into user_roles.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- True for any signed-in user who has been given a role (admin or staff).
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- ---------------------------------------------------------------------
-- 2. Workflow fields on service requests
-- ---------------------------------------------------------------------

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS assigned_to text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

-- Status is a small, fixed workflow. 'New' stays the insert default so the
-- public submit function keeps working unchanged.
ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_status_check;
UPDATE public.service_requests
  SET status = 'New'
  WHERE status NOT IN ('New', 'Contacted', 'Scheduled', 'In Progress', 'Completed', 'Cancelled');
ALTER TABLE public.service_requests
  ADD CONSTRAINT service_requests_status_check
  CHECK (status IN ('New', 'Contacted', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'));

CREATE INDEX IF NOT EXISTS service_requests_created_at_idx
  ON public.service_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS service_requests_status_idx
  ON public.service_requests (status);
CREATE INDEX IF NOT EXISTS service_requests_service_idx
  ON public.service_requests (service);
CREATE INDEX IF NOT EXISTS service_requests_mobile_idx
  ON public.service_requests (mobile);

CREATE OR REPLACE FUNCTION public.touch_service_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  -- Customer-submitted facts are immutable from the admin panel; the owner
  -- edits workflow fields only.
  NEW.request_number := OLD.request_number;
  NEW.created_at := OLD.created_at;
  NEW.full_name := OLD.full_name;
  NEW.mobile := OLD.mobile;
  NEW.service := OLD.service;
  NEW.problem_description := OLD.problem_description;
  NEW.full_address := OLD.full_address;
  NEW.area := OLD.area;
  NEW.latitude := OLD.latitude;
  NEW.longitude := OLD.longitude;
  NEW.preferred_date := OLD.preferred_date;
  NEW.preferred_time := OLD.preferred_time;
  NEW.photo_paths := OLD.photo_paths;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_requests_touch ON public.service_requests;
CREATE TRIGGER service_requests_touch
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_service_request();

-- ---------------------------------------------------------------------
-- 3. Admin access policies on service requests
-- ---------------------------------------------------------------------

DROP POLICY IF EXISTS "Staff can view service requests" ON public.service_requests;
CREATE POLICY "Staff can view service requests"
  ON public.service_requests FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can update service requests" ON public.service_requests;
CREATE POLICY "Staff can update service requests"
  ON public.service_requests FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins can delete service requests" ON public.service_requests;
CREATE POLICY "Admins can delete service requests"
  ON public.service_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, UPDATE, DELETE ON public.service_requests TO authenticated;

-- ---------------------------------------------------------------------
-- 4. Dashboard counters
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_request_stats()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT json_build_object(
    'total', count(*),
    'new', count(*) FILTER (WHERE status = 'New'),
    'contacted', count(*) FILTER (WHERE status = 'Contacted'),
    'scheduled', count(*) FILTER (WHERE status = 'Scheduled'),
    'in_progress', count(*) FILTER (WHERE status = 'In Progress'),
    'completed', count(*) FILTER (WHERE status = 'Completed'),
    'cancelled', count(*) FILTER (WHERE status = 'Cancelled'),
    'open', count(*) FILTER (WHERE status IN ('New', 'Contacted', 'Scheduled', 'In Progress')),
    'today', count(*) FILTER (
      WHERE (created_at AT TIME ZONE 'Asia/Kolkata')::date
            = (now() AT TIME ZONE 'Asia/Kolkata')::date
    ),
    'last_7_days', count(*) FILTER (WHERE created_at >= now() - interval '7 days')
  )
  INTO v_result
  FROM public.service_requests;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_request_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_request_stats() TO authenticated;

-- ---------------------------------------------------------------------
-- 5. Customer photo bucket
-- ---------------------------------------------------------------------

-- Private bucket, 5 MB per file, images only — enforced by storage itself
-- so a crafted client cannot bypass the browser-side validation.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'request-photos',
  'request-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 5242880,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Staff can view request photos" ON storage.objects;
CREATE POLICY "Staff can view request photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'request-photos' AND public.is_staff());

DROP POLICY IF EXISTS "Admins can delete request photos" ON storage.objects;
CREATE POLICY "Admins can delete request photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'request-photos' AND public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- 6. Granting the first admin
-- ---------------------------------------------------------------------
-- Create the user in Supabase → Authentication → Users (email + password),
-- then run, with that email:
--
--   INSERT INTO public.user_roles (user_id, role)
--   SELECT id, 'admin' FROM auth.users WHERE email = 'owner@example.com'
--   ON CONFLICT DO NOTHING;
-- ---------------------------------------------------------------------
