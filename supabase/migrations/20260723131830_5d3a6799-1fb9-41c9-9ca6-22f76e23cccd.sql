CREATE POLICY "Direct clients cannot create secure links"
ON public.secure_links
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Direct clients cannot view secure links"
ON public.secure_links
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "Direct clients cannot update secure links"
ON public.secure_links
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Direct clients cannot delete secure links"
ON public.secure_links
FOR DELETE
TO anon, authenticated
USING (false);