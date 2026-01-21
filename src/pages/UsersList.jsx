import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit2, 
  Shield, 
  User as UserIcon, 
  Mail, 
  FilterX, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'staff',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = selectedRole !== 'all' ? { role: selectedRole } : {};
      const response = await usersAPI.getAll(params);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email || '',
        role: user.role,
        password: '' // Don't pre-fill password
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        email: '',
        role: 'staff',
        password: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, formData);
      } else {
        await usersAPI.create(formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id) => {
    if (id === 1) return alert('Super Admin cannot be deleted.');
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await usersAPI.delete(id);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Personnel</h1>
          <p className="text-muted-foreground mt-1">Manage administrative access and agent deployment.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <UserPlus className="w-4 h-4" /> Deploy New Agent
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Clearance Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Every Clearance</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="staff">Standard Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ref</TableHead>
              <TableHead>Personnel</TableHead>
              <TableHead>Authorization</TableHead>
              <TableHead>Session Data</TableHead>
              <TableHead className="text-right">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Identifying records...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No agents found in this sector.</TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs">#{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-xs text-muted-foreground italic">@{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email || 'No email assigned'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(user)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={user.id === 1}
                      onClick={() => handleDelete(user.id)} 
                      className="text-red-500 hover:text-red-600"
                    >
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
            <DialogTitle>{editingUser ? 'Reconfigure Agent' : 'Deploy New Agent'}</DialogTitle>
            <DialogDescription>
              Initialize system credentials and clearance levels.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Clearance Level</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="staff">Standard Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
             </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="agent@system.com" />
             </div>
             <div className="space-y-2">
                <Label htmlFor="password">{editingUser ? 'Update Passkey' : 'Initial Passkey'}</Label>
                <Input id="password" type="password" required={!editingUser} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                {editingUser && <p className="text-[10px] text-muted-foreground italic">Leave blank to keep existing clearance codes.</p>}
             </div>
             <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Verify & Save</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersList;
