DROP POLICY IF EXISTS "Anyone can create secure links" ON public.secure_links;
DROP POLICY IF EXISTS "Anyone can view secure links via token" ON public.secure_links;
DROP POLICY IF EXISTS "Anyone can update secure links" ON public.secure_links;

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.secure_links FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.secure_links FROM authenticated;
GRANT ALL ON public.secure_links TO service_role;

REVOKE EXECUTE ON FUNCTION public.delete_expired_links() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_expired_links() FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_expired_links() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.delete_expired_links() TO service_role;