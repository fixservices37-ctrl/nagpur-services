-- =====================================================================
-- Service areas
--
-- Moves the Nagpur locality list out of static code (src/lib/services.ts)
-- into a table the admin panel can edit. Anonymous visitors can read
-- active areas (used on the homepage + /service-areas). Staff can add,
-- rename, reorder, deactivate or delete rows.
--
-- Seeded with the exact list that was previously hard-coded, so the
-- public site keeps rendering the same values after the migration runs.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT service_areas_name_length CHECK (length(btrim(name)) BETWEEN 1 AND 120)
);

-- Prevent duplicates like "manish nagar" / "Manish Nagar" / "  Manish Nagar ".
CREATE UNIQUE INDEX IF NOT EXISTS service_areas_name_key
  ON public.service_areas (lower(btrim(name)));

CREATE INDEX IF NOT EXISTS service_areas_active_sort_idx
  ON public.service_areas (is_active, sort_order, name);

ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

-- Active rows are public; staff can see everything (including deactivated ones).
DROP POLICY IF EXISTS "Anyone can view active service areas" ON public.service_areas;
CREATE POLICY "Anyone can view active service areas"
  ON public.service_areas FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff can insert service areas" ON public.service_areas;
CREATE POLICY "Staff can insert service areas"
  ON public.service_areas FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff can update service areas" ON public.service_areas;
CREATE POLICY "Staff can update service areas"
  ON public.service_areas FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins can delete service areas" ON public.service_areas;
CREATE POLICY "Admins can delete service areas"
  ON public.service_areas FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.service_areas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_areas TO authenticated;
GRANT ALL ON public.service_areas TO service_role;

CREATE OR REPLACE FUNCTION public.touch_service_area()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_areas_touch ON public.service_areas;
CREATE TRIGGER service_areas_touch
  BEFORE UPDATE ON public.service_areas
  FOR EACH ROW EXECUTE FUNCTION public.touch_service_area();

-- Seed with the list that was previously hard-coded. `ON CONFLICT DO NOTHING`
-- keeps repeated migration runs and hand-added rows from being clobbered.
INSERT INTO public.service_areas (name, sort_order) VALUES
  ('Manish Nagar', 10),
  ('Dharampeth', 20),
  ('Sadar', 30),
  ('Pratap Nagar', 40),
  ('Trimurti Nagar', 50),
  ('Wardha Road', 60),
  ('Besa', 70),
  ('Beltarodi', 80),
  ('Mihan', 90),
  ('Hingna', 100),
  ('Wadi', 110),
  ('Nandanvan', 120),
  ('Jaripatka', 130),
  ('Koradi', 140),
  ('Kamptee Road', 150)
ON CONFLICT DO NOTHING;
