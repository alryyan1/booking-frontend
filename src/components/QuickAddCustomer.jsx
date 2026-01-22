import { useState } from 'react';
import { customersAPI } from '../services/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Avatar,
  InputAdornment
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const QuickAddCustomer = ({ isOpen, onClose, onCustomerCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    address: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await customersAPI.create(formData);
      onCustomerCreated(response.data);
      onClose();
      // Reset form
      setFormData({
        name: '',
        phone_number: '',
        email: '',
        address: '',
        notes: ''
      });
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
        <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Box>
           <Typography variant="h6" fontWeight="bold">Quick Add Customer</Typography>
           <Typography variant="caption" color="text.secondary">Add a new client to the database</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <form id="quick-add-form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              fullWidth
              placeholder="+249..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Email (Optional)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Address (Optional)"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <HomeIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={onClose} 
          color="inherit" 
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={<SaveIcon />}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {loading ? 'Saving...' : 'Save Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddCustomer;
