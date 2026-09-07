-- =====================================================================
-- RO installation brands
--
-- The "New RO Installation" flow shows customers a list of brands the
-- owner installs (Aqua Fresh, Purosis, Lexpure, Fonix…). The list lives
-- in this table so the owner can add or retire brands from the admin
-- panel without a code change.
--
-- Same access pattern as service_areas:
--   - anonymous visitors can read active rows
--   - staff can insert / update
--   - admins can delete
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.ro_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tagline text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT ro_brands_name_length CHECK (length(btrim(name)) BETWEEN 1 AND 80),
  CONSTRAINT ro_brands_tagline_length CHECK (tagline IS NULL OR length(tagline) <= 160),
  CONSTRAINT ro_brands_description_length CHECK (description IS NULL OR length(description) <= 600)
);

-- Case-insensitive uniqueness ("Aqua Fresh" == "aqua fresh").
CREATE UNIQUE INDEX IF NOT EXISTS ro_brands_name_key
  ON public.ro_brands (lower(btrim(name)));

CREATE INDEX IF NOT EXISTS ro_brands_active_sort_idx
  ON public.ro_brands (is_active, sort_order, name);

ALTER TABLE public.ro_brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active RO brands" ON public.ro_brands;
CREATE POLICY "Anyone can view active RO brands"
  ON public.ro_brands FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff can insert RO brands" ON public.ro_brands;
CREATE POLICY "Staff can insert RO brands"
  ON public.ro_brands FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff can update RO brands" ON public.ro_brands;
CREATE POLICY "Staff can update RO brands"
  ON public.ro_brands FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins can delete RO brands" ON public.ro_brands;
CREATE POLICY "Admins can delete RO brands"
  ON public.ro_brands FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.ro_brands TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ro_brands TO authenticated;
GRANT ALL ON public.ro_brands TO service_role;

CREATE OR REPLACE FUNCTION public.touch_ro_brand()
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

DROP TRIGGER IF EXISTS ro_brands_touch ON public.ro_brands;
CREATE TRIGGER ro_brands_touch
  BEFORE UPDATE ON public.ro_brands
  FOR EACH ROW EXECUTE FUNCTION public.touch_ro_brand();

-- Seed with the four brands the owner currently installs. The order here
-- matches the launch preference; adjust freely from /admin/ro-brands.
INSERT INTO public.ro_brands (name, tagline, description, sort_order) VALUES
  ('Aqua Fresh',
   'RO + Copper with Alkaline',
   'Popular home purifier with copper, mineral and alkaline stages. Detachable storage tank options and a range of colours.',
   10),
  ('Purosis',
   'Multi-stage RO purification',
   'Reliable everyday RO for Nagpur homes with multi-stage filtration and antioxidant alkaline treatment.',
   20),
  ('Lexpure',
   'RO + H2AAA Smart Timer Technology',
   '5-stage RO with a smart timer display and 15–18 L storage. A step-up option for larger households.',
   30),
  ('Fonix',
   'Simplicity Next',
   'Compact and modern water purifier with triple-protection technology. Suits smaller kitchens and modular fittings.',
   40)
ON CONFLICT DO NOTHING;
