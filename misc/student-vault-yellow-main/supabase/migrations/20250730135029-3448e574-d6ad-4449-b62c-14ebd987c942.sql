-- Fix RLS on students table by enabling it (it was missing from the original table creation)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public access to students table
CREATE POLICY "Allow all operations on students" 
ON public.students 
FOR ALL 
USING (true) 
WITH CHECK (true);