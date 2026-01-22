import { useState, useEffect } from 'react';
import { itemsAPI, categoriesAPI, timeSlotsAPI, customersAPI } from '../services/api';
import QuickAddCustomer from './QuickAddCustomer';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  InputAdornment,
  Divider,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
  Note as NoteIcon,
  ShoppingBag as ShoppingBagIcon
} from '@mui/icons-material';

const BookingForm = ({ booking, onSave, onCancel, onDelete, bookingDate, timeSlotId, categoryId }) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_id: '',
    phone_number: '',
    notes: '',
    accessories: '',
    payment_status: 'pending',
    deposit_amount: 0,
    total_amount: 0,
    remaining_balance: 0,
    category_id: categoryId || '',
    booking_date: bookingDate || '',
    return_date: '',
    time_slot_id: timeSlotId || '',
    items: [],
  });

  const [categories, setCategories] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  
  // For Autocomplete state
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, timeSlotsRes, itemsRes, customersRes] = await Promise.all([
          categoriesAPI.getAll(),
          timeSlotsAPI.getAll(),
          itemsAPI.getAll(),
          customersAPI.getAll(),
        ]);
        setCategories(categoriesRes.data);
        setTimeSlots(timeSlotsRes.data);
        setInventory(itemsRes.data);
        setCustomers(customersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (booking) {
      setFormData({
        invoice_number: booking.invoice_number || '',
        customer_id: booking.customer_id || '',
        phone_number: booking.customer?.phone_number || booking.phone_number || '',
        notes: booking.notes || '',
        accessories: booking.accessories || '',
        payment_status: booking.payment_status || 'pending',
        deposit_amount: parseFloat(booking.deposit_amount) || 0,
        total_amount: parseFloat(booking.total_amount) || 0,
        remaining_balance: parseFloat(booking.remaining_balance) || 0,
        category_id: booking.category_id || '',
        booking_date: booking.booking_date || bookingDate || '',
        return_date: booking.return_date || '',
        time_slot_id: booking.time_slot_id || timeSlotId || '',
        items: booking.items?.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.pivot?.price_at_booking || item.price)
        })) || [],
      });
      if (booking.customer) {
        setSelectedCustomer(booking.customer);
      }
    }
  }, [booking, bookingDate, timeSlotId, categoryId]);

  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + item.price, 0);
    const balance = total - formData.deposit_amount;
    setFormData(prev => ({
      ...prev,
      total_amount: total,
      remaining_balance: balance
    }));
  }, [formData.items, formData.deposit_amount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'deposit_amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCustomerSelect = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        customer_id: newValue.id,
        phone_number: newValue.phone_number
      }));
      setSelectedCustomer(newValue);
    } else {
        setFormData(prev => ({
            ...prev,
            customer_id: '',
            phone_number: ''
        }));
        setSelectedCustomer(null);
    }
  };

  const handleCustomerCreated = (newCustomer) => {
    setCustomers(prev => [...prev, newCustomer]);
    handleCustomerSelect(null, newCustomer);
    setShowQuickAddModal(false);
  };

  const handleItemSelect = (event, newValue) => {
    if (newValue) {
        if (formData.items.some(i => i.id === newValue.id)) return;
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { id: newValue.id, name: newValue.name, price: parseFloat(newValue.price) }]
        }));
    }
  };

  const removeItemFromBooking = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <Dialog 
        open={true} 
        onClose={onCancel} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
            sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <Avatar sx={{ bgcolor: booking ? 'warning.light' : 'primary.light', colro: booking ? 'warning.dark' : 'primary.dark' }}>
               {booking ? <NoteIcon /> : <AddIcon />}
             </Avatar>
             <Typography variant="h6" fontWeight="bold">
               {booking ? 'Modify Booking' : 'New Attire Booking'}
             </Typography>
          </Box>
          <IconButton onClick={onCancel} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <form id="booking-form" onSubmit={handleSubmit}>
             <Grid container spacing={4}>
                
                {/* SECTION 1: Client & Invoice */}
                <Grid item xs={12}>
                   <Typography variant="overline" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.2 }}>
                      Client & Identity
                   </Typography>
                   <Divider sx={{ mb: 2 }} />
                   <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                         <TextField
                            label="Invoice ID"
                            name="invoice_number"
                            value={formData.invoice_number}
                            onChange={handleChange}
                            required
                            fullWidth
                            placeholder="E.g. INV-2024-001"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">#</InputAdornment>
                            }}
                         />
                      </Grid>
                      <Grid item xs={12} sm={8}>
                         <Box sx={{ display: 'flex', gap: 1 }}>
                            <Autocomplete
                                options={customers}
                                getOptionLabel={(option) => option.name || ''}
                                value={selectedCustomer}
                                onChange={handleCustomerSelect}
                                fullWidth
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Customer Name" 
                                        required={!formData.customer_id}
                                        placeholder="Search registered clients..."
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        <Box>
                                            <Typography variant="body2" fontWeight="600">{option.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{option.phone_number}</Typography>
                                        </Box>
                                    </li>
                                )}
                            />
                            <Button 
                                variant="outlined" 
                                sx={{ minWidth: '48px', px: 0 }}
                                onClick={() => setShowQuickAddModal(true)}
                            >
                                <PersonIcon fontSize="small" /> <AddIcon fontSize="small" />
                            </Button>
                         </Box>
                      </Grid>
                   </Grid>
                </Grid>

                {/* SECTION 2: Logistics */}
                <Grid item xs={12}>
                   <Typography variant="overline" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.2 }}>
                      Schedule & Logistics
                   </Typography>
                   <Divider sx={{ mb: 2 }} />
                   <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                           <FormControl fullWidth required>
                              <InputLabel>Category</InputLabel>
                              <Select
                                 name="category_id"
                                 value={formData.category_id}
                                 onChange={handleChange}
                                 label="Category"
                              >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name_en}</MenuItem>
                                ))}
                              </Select>
                           </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                           <TextField
                                type="date"
                                label="Booking Date"
                                name="booking_date"
                                value={formData.booking_date}
                                onChange={handleChange}
                                required
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                           />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                           <FormControl fullWidth required>
                              <InputLabel>Pick-up Slot</InputLabel>
                              <Select
                                 name="time_slot_id"
                                 value={formData.time_slot_id}
                                 onChange={handleChange}
                                 label="Pick-up Slot"
                              >
                                {timeSlots.map((slot) => (
                                    <MenuItem key={slot.id} value={slot.id}>
                                       {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                    </MenuItem>
                                ))}
                              </Select>
                           </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                           <TextField
                                type="date"
                                label="Return Deadline"
                                name="return_date"
                                value={formData.return_date}
                                onChange={handleChange}
                                required
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { color: 'primary.main', fontWeight: 600 },
                                    '& .MuiInputLabel-root': { color: 'primary.main' }
                                }}
                           />
                      </Grid>
                   </Grid>
                </Grid>

                {/* SECTION 3: Items */}
                <Grid item xs={12} md={7}>
                    <Typography variant="overline" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.2 }}>
                      Attire Selection
                   </Typography>
                   <Divider sx={{ mb: 2 }} />
                   
                   <Autocomplete
                        options={inventory}
                        getOptionLabel={(option) => `${option.name} ($${option.price})` || ''}
                        onChange={handleItemSelect}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Search Inventory" 
                                placeholder="Search dresses, suits..."
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start"><ShoppingBagIcon color="action" /></InputAdornment>
                                            {params.InputProps.startAdornment}
                                        </>
                                    )
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <Typography variant="body2" fontWeight="600">{option.name}</Typography>
                                    <Typography variant="body2" color="primary.main" fontWeight="bold">${option.price}</Typography>
                                </Box>
                            </li>
                        )}
                   />

                   <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                     {formData.items.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <ShoppingBagIcon sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
                            <Typography variant="body2">No items selected yet</Typography>
                        </Box>
                     ) : (
                         <List>
                            {formData.items.map((item) => (
                                <ListItem 
                                    key={item.id}
                                    secondaryAction={
                                        <IconButton edge="end" onClick={() => removeItemFromBooking(item.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}>
                                            <CheckCircleIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={<Typography fontWeight="600">{item.name}</Typography>}
                                        secondary={<Typography variant="body2" color="primary.main" fontWeight="bold">${item.price.toFixed(2)}</Typography>}
                                    />
                                </ListItem>
                            ))}
                         </List>
                     )}
                   </Box>
                   
                   <Box sx={{ mt: 3 }}>
                      <Grid container spacing={2}>
                          <Grid item xs={12}>
                              <TextField
                                 label="Booking Notes"
                                 name="notes"
                                 value={formData.notes}
                                 onChange={handleChange}
                                 fullWidth
                                 multiline
                                 rows={2}
                              />
                          </Grid>
                          <Grid item xs={12}>
                              <TextField
                                 label="Accessories Included"
                                 name="accessories"
                                 value={formData.accessories}
                                 onChange={handleChange}
                                 fullWidth
                                 multiline
                                 rows={1}
                                 placeholder="Belts, ties, etc..."
                              />
                          </Grid>
                      </Grid>
                   </Box>
                </Grid>

                {/* SECTION 4: Financials */}
                <Grid item xs={12} md={5}>
                    <Typography variant="overline" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.2 }}>
                      Financial Summary
                   </Typography>
                   <Divider sx={{ mb: 2 }} />
                   
                   <Card sx={{ bgcolor: 'grey.900', color: 'white', borderRadius: 4, overflow: 'visible' }}>
                      <CardContent sx={{ p: 3 }}>
                         
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                             <Box>
                                 <Typography variant="caption" color="grey.500" fontWeight="bold" letterSpacing={1}>TOTAL</Typography>
                                 <Typography variant="h4" fontWeight="900" sx={{ lineHeight: 1 }}>${formData.total_amount.toFixed(2)}</Typography>
                             </Box>
                             <FormControl size="small" sx={{ minWidth: 100 }}>
                                 <Select
                                    name="payment_status"
                                    value={formData.payment_status}
                                    onChange={handleChange}
                                    sx={{ 
                                        color: 'white', 
                                        '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                        '.MuiSvgIcon-root': { color: 'white' },
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase'
                                    }}
                                 >
                                     <MenuItem value="pending">Pending</MenuItem>
                                     <MenuItem value="partial">Partial</MenuItem>
                                     <MenuItem value="paid">Paid</MenuItem>
                                 </Select>
                             </FormControl>
                         </Box>
                         
                         <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                         
                         <Box sx={{ mb: 3 }}>
                            <Typography variant="caption" color="grey.400" fontWeight="bold" letterSpacing={1}>DEPOSIT AMOUNT</Typography>
                            <TextField
                                name="deposit_amount"
                                value={formData.deposit_amount}
                                onChange={handleChange}
                                type="number"
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Typography color="grey.500">$</Typography></InputAdornment>,
                                    sx: { color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }
                                }}
                                sx={{ 
                                    mt: 1,
                                    '& .MuiOutlinedInput-root': { 
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        '& fieldset': { border: 'none' } 
                                    }
                                }}
                            />
                         </Box>
                         
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                             <Typography variant="caption" color="grey.500" fontWeight="bold" letterSpacing={1}>BALANCE DUE</Typography>
                             <Typography 
                                variant="h3" 
                                fontWeight="900" 
                                color={formData.remaining_balance > 0 ? 'error.light' : 'success.light'}
                             >
                                ${formData.remaining_balance.toFixed(2)}
                             </Typography>
                         </Box>
                      </CardContent>
                   </Card>
                </Grid>
                
             </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            {booking && onDelete && (
                <Button 
                    onClick={onDelete} 
                    color="error" 
                    variant="outlined" 
                    startIcon={<DeleteIcon />}
                    sx={{ mr: 'auto', borderRadius: 2 }}
                >
                    Terminate Booking
                </Button>
            )}
            <Button onClick={onCancel} color="inherit" sx={{ mr: 1, borderRadius: 2 }}>
                Cancel
            </Button>
            <Button 
                onClick={handleSubmit} 
                variant="contained" 
                size="large"
                disabled={loading || formData.items.length === 0}
                startIcon={loading ? <AccessTimeIcon /> : <SaveIcon />}
                sx={{ borderRadius: 2, px: 4 }}
            >
                {booking ? 'Update Recording' : 'Create Booking'}
            </Button>
        </DialogActions>
      </Dialog>
      
      <QuickAddCustomer 
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </>
  );
};

export default BookingForm;
