import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, Trash2 } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  course: string;
  year: string;
  created_at?: string;
  updated_at?: string;
}

interface Dataset {
  id: string;
  name: string;
  file_path: string;
  description: string;
  created_at: string;
}

interface DatasetManagerProps {
  students: Student[];
  onDatasetLoad: (students: Student[]) => void;
  onRefreshStudents: () => void;
}

const DatasetManager: React.FC<DatasetManagerProps> = ({ 
  students, 
  onDatasetLoad, 
  onRefreshStudents 
}) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('student_datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDatasets(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch datasets",
        variant: "destructive"
      });
    }
  };

  const exportStudents = () => {
    if (students.length === 0) {
      toast({
        title: "Warning",
        description: "No students to export",
        variant: "destructive"
      });
      return;
    }

    const dataToExport = {
      exportDate: new Date().toISOString(),
      totalStudents: students.length,
      students: students
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Students data exported successfully",
    });
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !datasetName) {
      toast({
        title: "Error",
        description: "Please select a file and enter a dataset name",
        variant: "destructive"
      });
      return;
    }

    try {
      // Read and validate the JSON file
      const fileContent = await uploadFile.text();
      let parsedData;
      
      try {
        parsedData = JSON.parse(fileContent);
      } catch (e) {
        throw new Error('Invalid JSON file');
      }

      // Validate the data structure
      const studentsData = parsedData.students || parsedData;
      if (!Array.isArray(studentsData)) {
        throw new Error('File must contain an array of students');
      }

      // Validate student objects
      for (const student of studentsData) {
        if (!student.id || !student.name || !student.course || !student.year) {
          throw new Error('Each student must have id, name, course, and year fields');
        }
      }

      // Upload file to Supabase Storage
      const fileName = `${datasetName.replace(/\s+/g, '_')}_${Date.now()}.json`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-data')
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      // Save dataset metadata
      const { error: dbError } = await (supabase as any)
        .from('student_datasets')
        .insert([{
          name: datasetName,
          file_path: uploadData.path,
          description: datasetDescription
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Dataset uploaded successfully",
      });

      setIsUploadDialogOpen(false);
      setUploadFile(null);
      setDatasetName('');
      setDatasetDescription('');
      fetchDatasets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload dataset",
        variant: "destructive"
      });
    }
  };

  const loadDataset = async (dataset: Dataset) => {
    try {
      // Download file from Supabase Storage
      const { data: fileData, error } = await supabase.storage
        .from('student-data')
        .download(dataset.file_path);

      if (error) throw error;

      const fileContent = await fileData.text();
      const parsedData = JSON.parse(fileContent);
      const studentsData = parsedData.students || parsedData;

      // Clear current students and load new ones
      await (supabase as any)
        .from('students')
        .delete()
        .neq('id', ''); // Delete all

      // Insert new students
      const { error: insertError } = await (supabase as any)
        .from('students')
        .insert(studentsData);

      if (insertError) throw insertError;

      onDatasetLoad(studentsData);
      onRefreshStudents();

      toast({
        title: "Success",
        description: `Loaded ${studentsData.length} students from ${dataset.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dataset",
        variant: "destructive"
      });
    }
  };

  const deleteDataset = async (dataset: Dataset) => {
    if (!confirm(`Are you sure you want to delete the dataset "${dataset.name}"?`)) {
      return;
    }

    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('student-data')
        .remove([dataset.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await (supabase as any)
        .from('student_datasets')
        .delete()
        .eq('id', dataset.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Dataset deleted successfully",
      });

      fetchDatasets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete dataset",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export/Import Controls */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={exportStudents} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Current Data
          </Button>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Dataset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Student Dataset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataset-name">Dataset Name</Label>
                  <Input
                    id="dataset-name"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="e.g., Students 2024, Second Year, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataset-description">Description (Optional)</Label>
                  <Input
                    id="dataset-description"
                    value={datasetDescription}
                    onChange={(e) => setDatasetDescription(e.target.value)}
                    placeholder="Brief description of this dataset"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file-upload">JSON File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleFileUpload}>
                    Upload Dataset
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dataset Selection */}
        {datasets.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Available Datasets</h4>
            <div className="grid gap-2">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h5 className="font-medium">{dataset.name}</h5>
                    {dataset.description && (
                      <p className="text-sm text-muted-foreground">{dataset.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(dataset.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => loadDataset(dataset)}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteDataset(dataset)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatasetManager;