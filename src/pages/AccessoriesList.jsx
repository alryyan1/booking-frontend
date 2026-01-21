import { useState, useEffect } from 'react';
import { accessoriesAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, Package, Info, Tag, Layers, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AccessoriesList = () => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'available'
  });

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    setLoading(true);
    try {
      const response = await accessoriesAPI.getAll();
      setAccessories(response.data);
    } catch (error) {
      console.error('Error fetching accessories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (accessory = null) => {
    if (accessory) {
      setEditingAccessory(accessory);
      setFormData({
        name: accessory.name,
        description: accessory.description || '',
        status: accessory.status
      });
    } else {
      setEditingAccessory(null);
      setFormData({
        name: '',
        description: '',
        status: 'available'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccessory) {
        await accessoriesAPI.update(editingAccessory.id, formData);
      } else {
        await accessoriesAPI.create(formData);
      }
      setShowModal(false);
      fetchAccessories();
    } catch (error) {
      console.error('Error saving accessory:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      try {
        await accessoriesAPI.delete(id);
        fetchAccessories();
      } catch (error) {
        console.error('Error deleting accessory:', error);
      }
    }
  };

  const filteredAccessories = accessories.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accessories</h1>
          <p className="text-muted-foreground mt-1">Manage supplementary rental assets.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Accessory
        </Button>
      </div>

      <div className="max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search accessories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading accessories...</TableCell>
              </TableRow>
            ) : filteredAccessories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No accessories found.</TableCell>
              </TableRow>
            ) : (
              filteredAccessories.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-medium text-muted-foreground">#{acc.id}</TableCell>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {acc.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={acc.status === 'available' ? 'success' : 'outline'}>
                      {acc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(acc)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(acc.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAccessory ? 'Edit Accessory' : 'Add Accessory'}</DialogTitle>
            <DialogDescription>
              Provide details for the rental accessory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Details about the accessory..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Save Accessory</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccessoriesList;
