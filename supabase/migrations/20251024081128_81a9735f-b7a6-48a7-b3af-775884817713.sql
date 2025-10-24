-- Fix the validate_expiration function to set search_path
CREATE OR REPLACE FUNCTION public.validate_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Expiration time must be in the future';
  END IF;
  RETURN NEW;
END;
$$;