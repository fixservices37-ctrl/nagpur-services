CREATE SEQUENCE IF NOT EXISTS public.service_request_seq START 125;

CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text NOT NULL UNIQUE DEFAULT ('REQ-' || lpad(nextval('public.service_request_seq')::text, 5, '0')),
  full_name text NOT NULL,
  mobile text NOT NULL,
  service text NOT NULL,
  problem_description text NOT NULL,
  full_address text NOT NULL,
  area text,
  latitude double precision,
  longitude double precision,
  preferred_date date,
  preferred_time text,
  photo_paths text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.service_requests TO anon, authenticated;
GRANT ALL ON public.service_requests TO service_role;
GRANT USAGE ON SEQUENCE public.service_request_seq TO anon, authenticated, service_role;

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a service request"
  ON public.service_requests FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(full_name) BETWEEN 2 AND 100
    AND mobile ~ '^[6-9][0-9]{9}$'
    AND service IN ('Electrical','Plumbing','Carpenter','RO / Water Filter')
    AND length(problem_description) BETWEEN 5 AND 2000
    AND length(full_address) BETWEEN 5 AND 500
    AND status = 'New'
  );