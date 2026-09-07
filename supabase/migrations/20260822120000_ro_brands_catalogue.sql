-- =====================================================================
-- RO brands: catalogue fields
--
-- Adds enough structured information to render an Urban Company-style
-- catalogue card on /ro-installation (image, key features, purification
-- stages, warranty, starting price). Existing rows are backfilled with
-- neutral placeholder values that the owner can refine from the admin
-- panel — no third-party trademarks, marketing copy or product photos
-- are hard-coded into the schema.
-- =====================================================================

ALTER TABLE public.ro_brands
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS features text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stages integer,
  ADD COLUMN IF NOT EXISTS warranty_months integer,
  ADD COLUMN IF NOT EXISTS starting_price_inr integer;

-- Reject junk inputs at the database boundary so the admin form gets a
-- clean, actionable error instead of silently accepting bad data.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ro_brands_image_url_length'
  ) THEN
    ALTER TABLE public.ro_brands
      ADD CONSTRAINT ro_brands_image_url_length
      CHECK (image_url IS NULL OR length(image_url) <= 500);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ro_brands_stages_range'
  ) THEN
    ALTER TABLE public.ro_brands
      ADD CONSTRAINT ro_brands_stages_range
      CHECK (stages IS NULL OR (stages BETWEEN 1 AND 20));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ro_brands_warranty_months_range'
  ) THEN
    ALTER TABLE public.ro_brands
      ADD CONSTRAINT ro_brands_warranty_months_range
      CHECK (warranty_months IS NULL OR (warranty_months BETWEEN 0 AND 240));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ro_brands_starting_price_range'
  ) THEN
    ALTER TABLE public.ro_brands
      ADD CONSTRAINT ro_brands_starting_price_range
      CHECK (starting_price_inr IS NULL OR (starting_price_inr BETWEEN 0 AND 10000000));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ro_brands_features_bounds'
  ) THEN
    ALTER TABLE public.ro_brands
      ADD CONSTRAINT ro_brands_features_bounds
      CHECK (coalesce(array_length(features, 1), 0) <= 8);
  END IF;
END $$;

-- Backfill with generic, non-marketing placeholder values so the owner
-- opens the admin form and sees representative data to correct rather
-- than empty fields. Rows the owner has already customised are left
-- alone (only NULL/empty columns are touched).
UPDATE public.ro_brands
SET
  features = COALESCE(NULLIF(features, '{}')::text[],
                       ARRAY['RO purification', 'Copper stage', 'Alkaline stage', 'Wall / counter-top mount']),
  stages = COALESCE(stages, 7),
  warranty_months = COALESCE(warranty_months, 12),
  starting_price_inr = COALESCE(starting_price_inr, 9000)
WHERE lower(name) IN ('aqua fresh', 'purosis', 'lexpure', 'fonix');

-- Row-level nudges where the marketing material shown to the shop owner
-- points to a materially different spec. Kept minimal and non-branded.
UPDATE public.ro_brands
SET stages = 5, starting_price_inr = 20499
WHERE lower(name) = 'lexpure';
