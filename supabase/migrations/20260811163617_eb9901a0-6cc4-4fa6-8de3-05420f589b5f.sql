DELETE FROM public.service_requests WHERE full_name = 'Debug3';

CREATE OR REPLACE FUNCTION public.submit_service_request(
  p_full_name text,
  p_mobile text,
  p_service text,
  p_problem_description text,
  p_full_address text,
  p_area text DEFAULT NULL,
  p_latitude double precision DEFAULT NULL,
  p_longitude double precision DEFAULT NULL,
  p_preferred_date date DEFAULT NULL,
  p_preferred_time text DEFAULT NULL,
  p_photo_paths text[] DEFAULT '{}'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_number text;
BEGIN
  IF length(btrim(p_full_name)) < 2 OR length(p_full_name) > 100 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF p_mobile !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Invalid mobile number';
  END IF;
  IF p_service NOT IN ('Electrical','Plumbing','Carpenter','RO / Water Filter') THEN
    RAISE EXCEPTION 'Invalid service';
  END IF;
  IF length(btrim(p_problem_description)) < 5 OR length(p_problem_description) > 2000 THEN
    RAISE EXCEPTION 'Invalid problem description';
  END IF;
  IF length(btrim(p_full_address)) < 5 OR length(p_full_address) > 500 THEN
    RAISE EXCEPTION 'Invalid address';
  END IF;
  IF coalesce(array_length(p_photo_paths, 1), 0) > 5 THEN
    RAISE EXCEPTION 'Too many photos';
  END IF;

  INSERT INTO public.service_requests (
    full_name, mobile, service, problem_description, full_address, area,
    latitude, longitude, preferred_date, preferred_time, photo_paths
  ) VALUES (
    btrim(p_full_name), p_mobile, p_service, btrim(p_problem_description), btrim(p_full_address),
    nullif(btrim(coalesce(p_area, '')), ''), p_latitude, p_longitude, p_preferred_date,
    nullif(btrim(coalesce(p_preferred_time, '')), ''), coalesce(p_photo_paths, '{}')
  )
  RETURNING request_number INTO v_number;

  RETURN v_number;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_service_request(text,text,text,text,text,text,double precision,double precision,date,text,text[]) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_service_request(text,text,text,text,text,text,double precision,double precision,date,text,text[]) TO anon, authenticated;