-- Create secure_links table for storing encrypted one-time links
CREATE TABLE public.secure_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  encrypted_content TEXT NOT NULL,
  access_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accessed BOOLEAN NOT NULL DEFAULT false,
  accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_secure_links_access_token ON public.secure_links(access_token);
CREATE INDEX idx_secure_links_expires_at ON public.secure_links(expires_at);

-- Enable Row Level Security
ALTER TABLE public.secure_links ENABLE ROW LEVEL SECURITY;

-- Create policy for public link creation (no auth required)
CREATE POLICY "Anyone can create secure links" 
ON public.secure_links 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public link viewing (no auth required)
CREATE POLICY "Anyone can view secure links via token" 
ON public.secure_links 
FOR SELECT 
USING (true);

-- Create policy for updating (marking as accessed)
CREATE POLICY "Anyone can update secure links" 
ON public.secure_links 
FOR UPDATE 
USING (true);

-- Create function to auto-delete expired links
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

-- Create trigger to validate expiration time
CREATE OR REPLACE FUNCTION public.validate_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Expiration time must be in the future';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_expiration_before_insert
BEFORE INSERT ON public.secure_links
FOR EACH ROW
EXECUTE FUNCTION public.validate_expiration();