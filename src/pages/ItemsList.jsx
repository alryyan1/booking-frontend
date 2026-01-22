import { useState, useEffect } from 'react';
import { itemsAPI } from '../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Avatar,
  Chip,
  Stack,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const itemsRes = await itemsAPI.getAll();
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price,
        description: item.description || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        price: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await itemsAPI.update(editingItem.id, formData);
      } else {
        await itemsAPI.create(formData);
      }
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemsAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">Loading inventory...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="800" color="text.primary">
              Inventory Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage your items and pricing
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ 
              borderRadius: 3, 
              px: 4,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textTransform: 'none'
            }}
          >
            Add New Item
          </Button>
        </Box>

        {/* Table Card */}
        <Card 
          variant="outlined" 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                    Item Name
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                    Price
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                    Description
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <InventoryIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        No items in inventory yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow 
                      key={item.id} 
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`$${parseFloat(item.price).toFixed(2)}`} 
                          size="small" 
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenModal(item)}
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': { bgcolor: 'primary.lighter' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item.id)}
                            sx={{ 
                              color: 'error.main',
                              '&:hover': { bgcolor: 'error.lighter' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.16)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '2px solid', 
          borderColor: 'divider',
          px: 4,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(250,250,250,1))'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar variant="rounded" sx={{ bgcolor: editingItem ? 'warning.main' : 'primary.main', width: 40, height: 40 }}>
              {editingItem ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editingItem ? 'Update item details' : 'Create a new inventory item'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setShowModal(false)} size="small" sx={{ bgcolor: 'action.hover' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <TextField
                label="Item Name"
                required
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="E.g., Evening Gown"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><InventoryIcon fontSize="small" /></InputAdornment>
                }}
              />

              <TextField
                label="Price"
                type="number"
                step="0.01"
                required
                fullWidth
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><MoneyIcon fontSize="small" /></InputAdornment>
                }}
              />

              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional item description..."
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', gap: 2 }}>
            <Button
              onClick={() => setShowModal(false)}
              color="inherit"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
            >
              {editingItem ? 'Update Item' : 'Create Item'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default ItemsList;
