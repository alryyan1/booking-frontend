import { useState, useEffect } from 'react';
import { customersAPI } from '../services/api';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit2, 
  Trash2, 
  Search, 
  Plus, 
  X, 
  FileText,
  UserPlus,
  Contact2,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, formData);
      } else {
        await customersAPI.create(formData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersAPI.delete(id);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Directory</h1>
          <p className="text-muted-foreground mt-1">Manage customer profiles and historical interaction data.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <UserPlus className="w-4 h-4" /> Add New Client
        </Button>
      </div>

      <div className="max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or contact number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
           {[1,2,3].map(i => (
             <div key={i} className="h-48 bg-muted rounded-xl" />
           ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-20 text-center border-dashed bg-muted/20">
           <Contact2 className="h-12 w-12 text-muted-foreground mb-4" />
           <h3 className="text-lg font-bold">No Clients Found</h3>
           <p className="text-sm text-muted-foreground mt-1 max-w-xs">Your search parameter returned no records from the database.</p>
           <Button variant="outline" className="mt-6" onClick={() => handleOpenModal()}>Add First Client</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="group hover:shadow-md transition-shadow">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {customer.name.charAt(0)}
                     </div>
                     <div>
                        <CardTitle className="text-base font-bold text-slate-900">{customer.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">ID: #{customer.id}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="ghost" size="icon" onClick={() => handleOpenModal(customer)}>
                        <Edit2 className="h-4 w-4" />
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {customer.phone}
                     </div>
                     <div className="flex items-center gap-2 text-xs font-medium text-slate-600 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {customer.email || 'No email'}
                     </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground pt-3 border-t">
                     <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                     <span className="line-clamp-1">{customer.address || 'No address registered'}</span>
                  </div>
                  <Button variant="secondary" className="w-full text-xs font-bold gap-2" onClick={() => window.location.href=`/bookings?search=${customer.phone}`}>
                     View Booking History <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
               </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Update Client' : 'New Client Registration'}</DialogTitle>
            <DialogDescription>
              Enter the client's contact information and logistical details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label htmlFor="phone">Phone Number</Label>
                   <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="email">Email</Label>
                   <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Optional" />
                </div>
             </div>
             <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="notes">Logistical Notes</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Special requirements, measurements, etc." />
             </div>
             <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Complete Registration</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersList;
