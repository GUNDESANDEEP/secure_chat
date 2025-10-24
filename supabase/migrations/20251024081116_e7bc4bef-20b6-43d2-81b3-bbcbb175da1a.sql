-- Fix the delete_expired_links function to set search_path
CREATE OR REPLACE FUNCTION public.delete_expired_links()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.secure_links
  WHERE expires_at < now() OR accessed = true;
END;
$$;