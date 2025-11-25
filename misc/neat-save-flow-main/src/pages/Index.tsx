import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerForm } from "@/components/CustomerForm";
import { CustomerTable } from "@/components/CustomerTable";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Download } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

type CustomerFormData = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

const Index = () => {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data as Customer[];
    },
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: CustomerFormData) => {
      const { data, error } = await supabase
        .from("customers")
        .insert([customerData])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Customer added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer.",
        variant: "destructive",
      });
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, ...customerData }: CustomerFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("customers")
        .update(customerData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsFormOpen(false);
      setEditingCustomer(null);
      toast({
        title: "Success",
        description: "Customer updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer.",
        variant: "destructive",
      });
    },
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Success",
        description: "Customer deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer.",
        variant: "destructive",
      });
    },
  });

  // Filter customers based on search term
  const filteredCustomers = React.useMemo(() => {
    if (!searchTerm) return customers;
    
    const searchLower = searchTerm.toLowerCase();
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchLower)

    );
  }, [customers, searchTerm]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    deleteCustomerMutation.mutate(customerId);
  };

  const handleFormSubmit = (data: CustomerFormData) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({ ...data, id: editingCustomer.id });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const handleSaveData = () => {
    try {
      const dataToSave = customers.map(({ created_at, updated_at, ...customer }) => ({
        ...customer,
        created_at: new Date(created_at).toLocaleDateString(),
        updated_at: new Date(updated_at).toLocaleDateString(),
      }));

      const dataStr = JSON.stringify(dataToSave, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `customers_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Customer data exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export customer data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Customer Database</h1>
            <p className="text-muted-foreground mt-1">
              Manage your customer information with full CRUD operations.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveData}>
              <Download className="h-4 w-4 mr-2" />
              Save Data
            </Button>
            <Button onClick={handleAddCustomer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search customers by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>
          )}
        </div>

        <CustomerTable
          customers={filteredCustomers}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          isLoading={isLoading}
        />

        <CustomerForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          onSubmit={handleFormSubmit}
          customer={editingCustomer}
          isLoading={
            createCustomerMutation.isPending || updateCustomerMutation.isPending
          }
        />
      </div>
    </div>
  );
};

export default Index;
