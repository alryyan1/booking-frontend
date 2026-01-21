import { useState, useEffect } from 'react';
import { settingsAPI, categoriesAPI } from '../services/api';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Save, 
  Clock, 
  Layers, 
  Tag,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Settings = () => {
  const [prepDays, setPrepDays] = useState(3);
  const [categories, setCategories] = useState([]);
  const [newCatEn, setNewCatEn] = useState('');
  const [newCatAr, setNewCatAr] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, categoriesRes] = await Promise.all([
        settingsAPI.getAll(),
        categoriesAPI.getAll()
      ]);
      
      const prepDaysSetting = settingsRes.data.find(s => s.key === 'preparation_days');
      if (prepDaysSetting) setPrepDays(prepDaysSetting.value);
      
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSavePrepDays = async () => {
    setLoading(true);
    try {
      await settingsAPI.update('preparation_days', { value: prepDays });
      setMessage({ type: 'success', text: 'Preparation days updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preparation days.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatEn || !newCatAr) return;
    try {
      await categoriesAPI.create({ name_en: newCatEn, name_ar: newCatAr });
      setNewCatEn('');
      setNewCatAr('');
      fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this category? This may affect items assigned to it.')) {
      try {
        await categoriesAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Configure global parameters and inventory classifications.</p>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="capitalize">{message.type}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General Configuration</TabsTrigger>
          <TabsTrigger value="categories">Inventory Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Core System Settings</CardTitle>
              <CardDescription>Adjust basic operational parameters for the booking engine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prepDays">Preparation Buffer (Days)</Label>
                  <p className="text-sm text-muted-foreground">The number of days an item is marked unavailable before and after a booking for cleaning/prep.</p>
                  <div className="flex gap-4 max-w-xs">
                    <Input
                      id="prepDays"
                      type="number"
                      min="0"
                      value={prepDays}
                      onChange={(e) => setPrepDays(parseInt(e.target.value))}
                    />
                    <Button onClick={handleSavePrepDays} disabled={loading} className="gap-2 shrink-0">
                      <Save className="w-4 h-4" /> Save
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Classification Management</CardTitle>
                <CardDescription>Control the high-level categories used throughout the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-muted/40 rounded-lg border border-dashed">
                  <div className="space-y-2">
                    <Label htmlFor="catEn">Name (English)</Label>
                    <Input id="catEn" required value={newCatEn} onChange={(e) => setNewCatEn(e.target.value)} placeholder="e.g. Bridal" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="catAr">Name (Arabic)</Label>
                    <Input id="catAr" required value={newCatAr} onChange={(e) => setNewCatAr(e.target.value)} placeholder="عرائسي" dir="rtl" />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full gap-2">
                      <Plus className="w-4 h-4" /> Add Classification
                    </Button>
                  </div>
                </form>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>English Tag</TableHead>
                      <TableHead>Arabic Tag</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No categories defined.</TableCell>
                      </TableRow>
                    ) : (
                      categories.map((cat) => (
                        <TableRow key={cat.id}>
                          <TableCell className="font-medium">{cat.name_en}</TableCell>
                          <TableCell dir="rtl" className="font-medium">{cat.name_ar}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)} className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
