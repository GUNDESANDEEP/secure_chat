GRANT SELECT, INSERT, UPDATE, DELETE ON public.secure_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.secure_links TO authenticated;
GRANT ALL ON public.secure_links TO service_role;

GRANT EXECUTE ON FUNCTION public.delete_expired_links() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_expired_links() TO service_role;