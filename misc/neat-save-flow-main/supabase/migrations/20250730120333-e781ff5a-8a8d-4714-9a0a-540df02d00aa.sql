-- Enable Row Level Security on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access to customers (since no user authentication)
CREATE POLICY "Allow public access to customers" 
ON public.customers 
FOR ALL 
USING (true);

-- Fix the function security by setting search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;