REVOKE ALL ON FUNCTION public.create_secure_link_record(text, text, timestamp with time zone) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_secure_link_for_access(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_secure_link_accessed(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_secure_link_record(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_secure_link_record(text, text, timestamp with time zone) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_secure_link_for_access(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_secure_link_accessed(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_secure_link_record(uuid) TO service_role;