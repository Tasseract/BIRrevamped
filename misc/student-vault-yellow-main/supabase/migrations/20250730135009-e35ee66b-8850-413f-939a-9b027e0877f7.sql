-- Create storage bucket for JSON files
INSERT INTO storage.buckets (id, name, public) VALUES ('student-data', 'student-data', true);

-- Create policies for the storage bucket
CREATE POLICY "Allow public access to student data files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'student-data');

CREATE POLICY "Allow public upload of student data files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'student-data');

CREATE POLICY "Allow public update of student data files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'student-data');

CREATE POLICY "Allow public delete of student data files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'student-data');

-- Create a table to track uploaded datasets
CREATE TABLE public.student_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (but allow all operations for public access)
ALTER TABLE public.student_datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on student datasets" 
ON public.student_datasets 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_student_datasets_updated_at
BEFORE UPDATE ON public.student_datasets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();