import { useState, useEffect } from 'react';
import { itemsAPI, customersAPI } from '../services/api';
import QuickAddCustomer from './QuickAddCustomer';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Alert,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingBag as ShoppingBagIcon,
  ReceiptLong as ReceiptIcon,
  CalendarMonth as CalendarIcon,
  LocalOffer as TagIcon,
  Notes as NotesIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const BookingForm = ({ booking, onSave, onCancel, onDelete, bookingDate }) => {
  const theme = useTheme();
  
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
    event_date: bookingDate || '',
    items: [],
  });

  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  
  // For Autocomplete state
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, customersRes] = await Promise.all([
          itemsAPI.getAll(),
          customersAPI.getAll(),
        ]);
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
        event_date: booking.event_date || booking.booking_date || bookingDate || '',
        items: booking.items?.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.pivot?.price_at_booking || item.price),
          quantity: parseInt(item.pivot?.quantity || 1)
        })) || [],
      });
      if (booking.customer) {
        setSelectedCustomer(booking.customer);
      }
    }
  }, [booking, bookingDate]);

  useEffect(() => {
    // Auto-calculate balance and payment status whenever total or deposit changes
    const total = parseFloat(formData.total_amount) || 0;
    const deposit = parseFloat(formData.deposit_amount) || 0;
    const balance = total - deposit;

    let status = 'pending';
    if (balance <= 0 && total > 0) status = 'paid';
    else if (deposit > 0) status = 'partial';

    setFormData(prev => {
        // Prevent infinite loop if nothing changed
        if (prev.remaining_balance === balance && prev.payment_status === status) return prev;
        return {
            ...prev,
            remaining_balance: balance,
            payment_status: status
        };
    });
  }, [formData.total_amount, formData.deposit_amount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === 'deposit_amount' || name === 'total_amount') ? parseFloat(value) || 0 : value,
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
        // Check if item already exists
        const existingItemIndex = formData.items.findIndex(i => i.id === newValue.id);
        
        if (existingItemIndex !== -1) {
            // Increase quantity if item already exists
            setFormData(prev => ({
                ...prev,
                items: prev.items.map((item, idx) => 
                    idx === existingItemIndex 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
                total_amount: (parseFloat(prev.total_amount) || 0) + parseFloat(newValue.price)
            }));
        } else {
            // Add new item with quantity 1
            setFormData(prev => ({
                ...prev,
                items: [...prev.items, { 
                    id: newValue.id, 
                    name: newValue.name, 
                    price: parseFloat(newValue.price),
                    quantity: 1
                }],
                total_amount: (parseFloat(prev.total_amount) || 0) + parseFloat(newValue.price)
            }));
        }
    }
  };

  const removeItemFromBooking = (id) => {
    const item = formData.items.find(i => i.id === id);
    if (!item) return;
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
      total_amount: Math.max(0, (parseFloat(prev.total_amount) || 0) - (item.price * item.quantity))
    }));
  };

  const updateItemQuantity = (id, change) => {
    setFormData(prev => {
      const item = prev.items.find(i => i.id === id);
      if (!item) return prev;
      
      const newQuantity = item.quantity + change;
      if (newQuantity < 1) return prev;
      
      const priceDiff = item.price * change;
      
      return {
        ...prev,
        items: prev.items.map(i => 
          i.id === id ? { ...i, quantity: newQuantity } : i
        ),
        total_amount: Math.max(0, (parseFloat(prev.total_amount) || 0) + priceDiff)
      };
    });
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

  return (
    <>
      <Dialog 
        open={true} 
        onClose={onCancel} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
            sx: { 
                borderRadius: 4, 
                bgcolor: 'background.default',
                height: '90vh',
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
            bgcolor: 'background.paper',
            background: 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(250,250,250,1))'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <Avatar variant="rounded" sx={{ bgcolor: booking ? 'warning.main' : 'primary.main', width: 40, height: 40 }}>
               {booking ? <NotesIcon /> : <ReceiptIcon />}
             </Avatar>
             <Box>
                 <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                   {booking ? 'Modify Booking' : 'New Reservation'}
                 </Typography>
                 <Typography variant="caption" color="text.secondary">
                    {booking ? `Editing record #${booking.id}` : 'Create a new client invoice'}
                 </Typography>
             </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}> 
            {booking && onDelete && (
                <Button 
                    onClick={onDelete} 
                    color="error"
                    size="small" 
                    startIcon={<DeleteIcon />}
                    sx={{ borderRadius: 2 }}
                >
                    Delete
                </Button>
            )}
            <IconButton onClick={onCancel} size="small" sx={{ bgcolor: 'action.hover' }}>
                <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden' }}>
           
           {/* LEFT PANEL: Form Inputs */}
           <Box sx={{ flex: 7, p: 4, overflowY: 'auto', bgcolor: 'background.paper' }}>
              <form id="booking-form" onSubmit={handleSubmit}>
                 <Stack spacing={4}>
                    
                    {/* Client Information */}
                    <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'visible', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <Box sx={{ 
                            p: 2.5, 
                            borderBottom: '1px solid', 
                            borderColor: 'divider', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            bgcolor: 'grey.50'
                        }}>
                            <PersonIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="700">Client Details</Typography>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                    <Box sx={{ flex: { xs: '1', sm: '0 0 33%' } }}>
                                        <TextField
                                            label="Invoice Number"
                                            name="invoice_number"
                                            value={formData.invoice_number}
                                            onChange={handleChange}
                                            fullWidth
                                            size="small"
                                            required
                                            placeholder="e.g., INV-001"
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">#</InputAdornment>,
                                                sx: { fontWeight: 'bold' }
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                                        <Autocomplete
                                            options={customers}
                                            getOptionLabel={(option) => option.name || ''}
                                            value={selectedCustomer}
                                            onChange={handleCustomerSelect}
                                            fullWidth
                                            size="small"
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Select Customer" 
                                                    placeholder="Search by name or phone..."
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
                                            sx={{ minWidth: '40px', px: 0, borderRadius: 2 }}
                                            onClick={() => setShowQuickAddModal(true)}
                                        >
                                            <AddIcon fontSize="small" />
                                        </Button>
                                    </Box>
                                </Box>
                                <TextField
                                    type="date"
                                    label="Event / Booking Date"
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleChange}
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment>
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Inventory Selection */}
                    <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'visible', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <Box sx={{ 
                            p: 2.5, 
                            borderBottom: '1px solid', 
                            borderColor: 'divider', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            bgcolor: 'grey.50'
                        }}>
                            <ShoppingBagIcon color="secondary" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="700">Attire & Items</Typography>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Autocomplete
                                options={inventory}
                                getOptionLabel={(option) => `${option.name} ($${option.price})` || ''}
                                onChange={handleItemSelect}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Search Inventory" 
                                        placeholder="Start typing to add items..."
                                        fullWidth
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <>
                                                    <InputAdornment position="start"><TagIcon color="action" /></InputAdornment>
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
                                            <Chip label={`$${option.price}`} size="small" color="primary" variant="outlined" />
                                        </Box>
                                    </li>
                                )}
                            />

                            <TableContainer component={Paper} variant="outlined" sx={{ mt: 3, borderRadius: 2, maxHeight: 300 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Item Name</TableCell>
                                            <TableCell align="center">Quantity</TableCell>
                                            <TableCell align="right">Price</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                            <TableCell align="right" width={50}></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                                    <Typography variant="body2">No items selected yet.</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            formData.items.map((item) => (
                                                <TableRow key={item.id} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => updateItemQuantity(item.id, -1)}
                                                                disabled={item.quantity <= 1}
                                                                sx={{ bgcolor: 'action.hover' }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                            <Typography variant="body2" fontWeight="700" sx={{ minWidth: '30px', textAlign: 'center' }}>
                                                                {item.quantity}
                                                            </Typography>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => updateItemQuantity(item.id, 1)}
                                                                sx={{ bgcolor: 'action.hover' }}
                                                            >
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton size="small" onClick={() => removeItemFromBooking(item.id)} color="error">
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                 <TextField
                                     label="Internal Notes"
                                     name="notes"
                                     value={formData.notes}
                                     onChange={handleChange}
                                     fullWidth
                                     multiline
                                     rows={2}
                                     size="small"
                                     placeholder="Any special requests or details..."
                                 />
                                 <TextField
                                     label="Accessories Included"
                                     name="accessories"
                                     value={formData.accessories}
                                     onChange={handleChange}
                                     fullWidth
                                     size="small"
                                     placeholder="Belts, pins, additional items..."
                                 />
                             </Box>
                        </CardContent>
                    </Card>

                 </Stack>
              </form>
           </Box>

           {/* RIGHT PANEL: Receipt Summary */}
           <Box sx={{ 
               flex: 3, 
               bgcolor: 'background.default', 
               borderLeft: { md: '1px solid' }, 
               borderColor: 'divider',
               display: 'flex',
               flexDirection: 'column'
           }}>
               <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
                  <Paper elevation={0} sx={{ 
                      p: 4, 
                      borderRadius: 3, 
                      border: '2px dashed',
                      borderColor: 'primary.light', 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      bgcolor: 'grey.50'
                  }}>
                      <Box>
                          <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={1}>
                              RECEIPT SUMMARY
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          
                          <Stack spacing={2} sx={{ mb: 4 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Total Items</Typography>
                                  <Typography variant="body2" fontWeight="600">{formData.items.length}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                                  <TextField 
                                      name="total_amount"
                                      value={formData.total_amount}
                                      onChange={handleChange}
                                      type="number"
                                      size="small"
                                      InputProps={{ 
                                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                          sx: { fontSize: '1rem', fontWeight: 'bold', width: '120px', py: 0.5, textAlign: 'right' } 
                                      }}
                                  />
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary">Deposit Paid</Typography>
                                  <TextField 
                                      name="deposit_amount"
                                      value={formData.deposit_amount}
                                      onChange={handleChange}
                                      type="number"
                                      size="small"
                                      InputProps={{ 
                                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                          sx: { fontSize: '0.875rem', fontWeight: 'bold', width: '120px', py: 0.5 } 
                                      }}
                                  />
                              </Box>
                          </Stack>
                      </Box>

                      <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 3, border: '2px solid', borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
                               <Typography variant="body2" fontWeight="bold" color="text.primary">BALANCE DUE</Typography>
                               <Typography variant="h4" fontWeight="900" color={formData.remaining_balance > 0 ? 'error.main' : 'success.main'}>
                                   ${formData.remaining_balance.toFixed(2)}
                               </Typography>
                           </Box>
                           
                           <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                               <Typography variant="caption" color="text.secondary">Status:</Typography>
                               <Chip 
                                    label={formData.payment_status?.toUpperCase() || 'PENDING'} 
                                    size="small" 
                                    color={formData.payment_status === 'paid' ? 'success' : formData.payment_status === 'partial' ? 'warning' : 'default'} 
                                    variant="soft" />
                           </Box>
                      </Box>
                  </Paper>
               </Box>

               {/* Action Footer */}
               <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'grid', gap: 2 }}>
                   <Button 
                       onClick={handleSubmit} 
                       variant="contained" 
                       size="large"
                       fullWidth
                       disabled={loading || formData.items.length === 0}
                       startIcon={loading ? <AccessTimeIcon /> : <SaveIcon />}
                       sx={{ borderRadius: 2, height: 48, fontWeight: 700 }}
                   >
                       {booking ? 'Update Booking' : 'Confirm Booking'}
                   </Button>
                   <Button onClick={onCancel} color="inherit" fullWidth sx={{ borderRadius: 2 }}>
                       Cancel
                   </Button>
               </Box>
           </Box>

        </DialogContent>
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
