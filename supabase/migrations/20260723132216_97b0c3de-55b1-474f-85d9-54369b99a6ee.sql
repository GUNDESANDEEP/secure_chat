CREATE OR REPLACE FUNCTION public.create_secure_link_record(
  _encrypted_content text,
  _access_token text,
  _expires_at timestamp with time zone
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  INSERT INTO public.secure_links (encrypted_content, access_token, expires_at)
  VALUES (_encrypted_content, _access_token, _expires_at)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_secure_link_for_access(_access_token text)
RETURNS TABLE(
  id uuid,
  encrypted_content text,
  expires_at timestamp with time zone,
  accessed boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT secure_links.id,
         secure_links.encrypted_content,
         secure_links.expires_at,
         secure_links.accessed,
         secure_links.created_at
  FROM public.secure_links
  WHERE secure_links.access_token = _access_token
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.mark_secure_link_accessed(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.secure_links
  SET accessed = true,
      accessed_at = now()
  WHERE id = _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_secure_link_record(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.secure_links
  WHERE id = _id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_secure_link_record(text, text, timestamp with time zone) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_secure_link_for_access(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_secure_link_accessed(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_secure_link_record(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_secure_link_record(text, text, timestamp with time zone) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_secure_link_for_access(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_secure_link_accessed(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_secure_link_record(uuid) TO anon, authenticated, service_role;