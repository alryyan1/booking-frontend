import { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { itemsAPI, customersAPI, accessoriesAPI, bookingsAPI } from '../services/api';
import { toast } from 'sonner';
import CustomerDialog from './CustomerDialog';
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
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Grid,
  useMediaQuery,
  CircularProgress
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
  AccessTime as AccessTimeIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  CreditCard as PaymentIcon
} from '@mui/icons-material';

const STEPS = ['Event Date & Customer', 'Select Items', 'Accessories', 'Review & Pay'];

const BookingForm = ({ booking, onSave, onCancel, onDelete, bookingDate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);
  
  const { control, handleSubmit, watch, setValue, getValues, reset, register, formState: { errors } } = useForm({
    defaultValues: {
      invoice_number: '',
      customer_id: '',
      phone_number: '',
      notes: '',
      accessories: [],
      deposit_amount: 0,
      total_amount: 0,
      remaining_balance: 0,
      payment_method: 'cash',
      event_date: bookingDate || '',
      items: [],
    }
  });

  const { fields: itemsFields, append: appendItem, remove: removeItem, update: updateItem } = useFieldArray({
    control,
    name: "items"
  });

  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [prepDays, setPrepDays] = useState(3); // Default to 3 days
  
  // For Autocomplete display object
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [reservedItemIds, setReservedItemIds] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const watchedItems = watch("items");
  const watchedAccessories = watch("accessories");
  const watchedTotal = watch("total_amount");
  const watchedDeposit = watch("deposit_amount");
  const watchedEventDate = watch("event_date");
  const watchedInvoice = watch("invoice_number");
  const watchedCustomerId = watch("customer_id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, customersRes, accessoriesRes] = await Promise.all([
          itemsAPI.getAll(),
          customersAPI.getAll(),
          accessoriesAPI.getAll(),
        ]);
        setInventory(itemsRes.data);
        setCustomers(customersRes.data);
        setAccessories(accessoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (booking) {
      const formattedBooking = {
        invoice_number: booking.invoice_number || '',
        customer_id: booking.customer_id || '',
        phone_number: booking.customer?.phone_number || booking.phone_number || '',
        notes: booking.notes || '',
        accessories: booking.accessories || [],
        deposit_amount: parseFloat(booking.deposit_amount) || 0,
        total_amount: parseFloat(booking.total_amount) || 0,
        remaining_balance: parseFloat(booking.remaining_balance) || 0,
        event_date: booking.event_date || booking.booking_date || bookingDate || '',
        items: booking.items?.map(item => ({
          db_id: item.pivot?.id || null, // pivot id if needed
          item_id: item.id, // actual inventory item id
          name: item.name,
          price: parseFloat(item.pivot?.price_at_booking || item.price),
          quantity: parseInt(item.pivot?.quantity || 1)
        })) || [],
      };
      reset(formattedBooking);
      if (booking.customer) {
        setSelectedCustomer(booking.customer);
      }
    }
  }, [booking, bookingDate, reset]);

  // Recalculate total amount whenever items change (but allow manual overwrite)
  useEffect(() => {
    const items = watchedItems || [];
    const newTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currentTotal = getValues('total_amount');
    // Only auto-update if total is 0 or if we just added/removed an item and it matched the old calculated total
    if (currentTotal === 0 || items.length > 0) {
      setValue('total_amount', newTotal);
    }
  }, [watchedItems, setValue]);

  // Fetch availability when date changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (watchedEventDate) {
        setIsCheckingAvailability(true);
        try {
          const res = await bookingsAPI.checkAvailability(watchedEventDate);
          setReservedItemIds(res.data.reserved_item_ids || []);
          setPrepDays(res.data.prep_days || 3);
        } catch (error) {
          console.error('Error checking availability:', error);
        } finally {
          setIsCheckingAvailability(false);
        }
      }
    };
    checkAvailability();
  }, [watchedEventDate]);

  // Recalculate remaining balance whenever total or deposit changes
  useEffect(() => {
    const total = parseFloat(watchedTotal) || 0;
    const deposit = parseFloat(watchedDeposit) || 0;
    const balance = total - deposit;

    setValue('remaining_balance', balance);
  }, [watchedTotal, watchedDeposit, setValue]);

  const handleCustomerSelect = (newValue) => {
    if (newValue) {
      setValue('customer_id', newValue.id);
      setValue('phone_number', newValue.phone_number);
      setSelectedCustomer(newValue);
    } else {
      setValue('customer_id', '');
      setValue('phone_number', '');
      setSelectedCustomer(null);
    }
  };

  const handleCustomerCreated = (newCustomer) => {
    setCustomers(prev => [...prev, newCustomer]);
    handleCustomerSelect(newCustomer);
    setShowCustomerModal(false);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleItemSelect = (newValue) => {
    if (newValue) {
      const items = getValues("items");
      const existingItemIndex = items.findIndex(i => i.item_id === newValue.id);
      
      if (existingItemIndex !== -1) {
        const item = items[existingItemIndex];
        updateItem(existingItemIndex, { ...item, quantity: item.quantity + 1 });
      } else {
        appendItem({ 
          item_id: newValue.id, 
          name: newValue.name, 
          price: parseFloat(newValue.price),
          quantity: 1
        });
      }
    }
  };

  const removeItemFromBooking = (index) => {
    removeItem(index);
  };

  const updateItemQty = (index, change) => {
    const items = getValues("items");
    const item = items[index];
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;
    
    updateItem(index, { ...item, quantity: newQuantity });
  };

  const handleAccessorySelect = (newValue) => {
    if (newValue) {
      const currentAccessories = getValues("accessories");
      const exists = currentAccessories.some(acc => acc.id === newValue.id);
      
      if (!exists) {
        setValue("accessories", [...currentAccessories, { id: newValue.id, name: newValue.name }]);
      }
    }
  };

  const removeAccessory = (id) => {
    const currentAccessories = getValues("accessories");
    setValue("accessories", currentAccessories.filter(acc => acc.id !== id));
  };

  const onFormSubmit = async (data) => {
    setLoading(true);
    try {
      const formattedData = {
        ...data,
        booking_date: data.event_date,
        items: data.items.map(item => ({
          id: item.item_id,
          pivot_id: item.db_id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      await onSave(formattedData);
      toast.success(booking ? 'Booking updated successfully!' : 'Reservation created successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.items) {
          toast.error(errors.items[0]);
        } else {
          toast.error('Failed to save booking. Please check the form.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Event Date & Customer
        return (
          <Stack spacing={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                1. Select Event Date & Invoice
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    type="date"
                    label="Event Date (Date of Occasion)"
                    {...register("event_date", { required: "Date is required" })}
                    error={!!errors.event_date}
                    helperText={errors.event_date?.message}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CalendarIcon /></InputAdornment>,
                      sx: { borderRadius: 3 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Invoice Number (Manual)"
                    {...register("invoice_number", { required: "Invoice number is required" })}
                    error={!!errors.invoice_number}
                    helperText={errors.invoice_number?.message}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                      sx: { borderRadius: 3 }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                2. Select or Add Customer
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Controller
                  name="customer_id"
                  control={control}
                  rules={{ required: "Customer is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      options={customers}
                      getOptionLabel={(option) => option.name || ''}
                      value={selectedCustomer}
                      onChange={(_, newValue) => handleCustomerSelect(newValue)}
                      fullWidth
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Customer Name / Phone" 
                          error={!!error}
                          helperText={error?.message}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          <Box>
                            <Typography variant="body1" fontWeight="600">{option.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{option.phone_number}</Typography>
                          </Box>
                        </li>
                      )}
                    />
                  )}
                />
                <Button 
                  variant="contained" 
                  color="secondary"
                  sx={{ borderRadius: 3, px: 3, height: 56 }}
                  startIcon={<AddIcon />}
                  onClick={() => setShowCustomerModal(true)}
                >
                  New
                </Button>
              </Box>
              {selectedCustomer && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  Selected: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.phone_number})
                </Alert>
              )}
            </Box>
          </Stack>
        );

      case 1: // Item Selection
        return (
          <Stack sx={{ mt: 2 }} spacing={4}>
            <Box>
              <Autocomplete
                options={inventory}
                getOptionLabel={(option) => `${option.name} ($${option.price})`}
                loading={isCheckingAvailability}
                onChange={(_, newValue) => {
                  if (newValue && !reservedItemIds.includes(newValue.id)) {
                    handleItemSelect(newValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Search Inventory" 
                    placeholder={watchedEventDate ? "Search by name..." : "Please select event date first"}
                    fullWidth
                    disabled={!watchedEventDate}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isCheckingAvailability ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                )}
                renderOption={(props, option) => {
                  const isReserved = reservedItemIds.includes(option.id);
                  return (
                    <li {...props} key={option.id} style={{ opacity: isReserved ? 0.5 : 1, pointerEvents: isReserved ? 'none' : 'auto' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1" fontWeight="600">{option.name}</Typography>
                          <Typography variant="caption" color={isReserved ? "error.main" : "success.main"}>
                            {isReserved ? "Reserved / In Prep" : "Available"}
                          </Typography>
                        </Box>
                        <Chip label={`$${option.price}`} size="small" variant="outlined" />
                      </Box>
                    </li>
                  );
                }}
              />
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemsFields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No items added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    itemsFields.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell fontWeight="600">{item.name}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <IconButton size="small" onClick={() => updateItemQty(index, -1)} disabled={item.quantity <= 1}>
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                            <Typography variant="body2">{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => updateItemQty(index, 1)}>
                              <AddIcon fontSize="inherit" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right">${item.price}</TableCell>
                        <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => removeItem(index)}>
                            <CloseIcon fontSize="inherit" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        );

      case 2: // Accessories & Notes
        return (
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                4. Add Accessories (Optional)
              </Typography>
              <Autocomplete
                options={accessories}
                getOptionLabel={(option) => option.name || ''}
                onChange={(_, newValue) => handleAccessorySelect(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Accessories" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                )}
              />
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {watchedAccessories?.map((acc) => (
                  <Chip key={acc.id} label={acc.name} onDelete={() => removeAccessory(acc.id)} color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                5. Additional Notes
              </Typography>
              <TextField
                {...register("notes")}
                multiline
                rows={4}
                fullWidth
                placeholder="Enter any special instructions or notes here..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Box>
          </Stack>
        );

      case 3: // Review & Pay
        return (
          <Stack spacing={4}>
            <Box sx={{ p: 4, bgcolor: 'primary.50', borderRadius: 4, textAlign: 'center' }}>
              <Typography variant="overline" color="primary.main" fontWeight="bold">
                Balance Due
              </Typography>
              <Typography variant="h2" fontWeight="900" color="primary.dark">
                ${watch('remaining_balance')?.toFixed(2)}
              </Typography>
            </Box>

            <Stack direction={'row'} gap={2} spacing={2}>
                <TextField
                  label="Total Amount"
                  {...register("total_amount", { valueAsNumber: true })}
                  type="number"
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, sx: { borderRadius: 3 } }}
                />
                <TextField
                  label="Deposit Paid"
                  {...register("deposit_amount", { valueAsNumber: true })}
                  type="number"
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, sx: { borderRadius: 3 } }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Payment Method</InputLabel>
                  <Controller
                    name="payment_method"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Payment Method" sx={{ borderRadius: 3 }}>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="card">Card</MenuItem>
                        <MenuItem value="transfer">Bank Transfer</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
            </Stack>
            {/* Summary Review */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Summary</Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Customer</Typography>
                  <Typography fontWeight="bold">{selectedCustomer?.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Event Date</Typography>
                  <Typography fontWeight="bold">{watchedEventDate}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Items</Typography>
                  <Typography fontWeight="bold">{watchedItems?.length || 0} items</Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog 
        open={true} 
        onClose={onCancel} 
        fullScreen={isMobile}
        maxWidth="md" 
        fullWidth
        PaperProps={{
            sx: { borderRadius: isMobile ? 0 : 4, height: isMobile ? '100%' : '85vh' }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <ReceiptIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {booking ? 'Edit Booking' : 'New Reservation'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onCancel} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
          
          <Stepper activeStep={activeStep} sx={{ mt: 3, display: { xs: 'none', sm: 'flex' } }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {renderStepContent(activeStep)}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onCancel} color="inherit" sx={{ mr: 'auto' }}>
            Cancel
          </Button>
          
          {activeStep > 0 && (
            <Button onClick={handleBack} startIcon={<BackIcon />} sx={{ borderRadius: 2 }}>
              Back
            </Button>
          )}
          
          {activeStep < STEPS.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleNext} 
              endIcon={<ForwardIcon />}
              disabled={(activeStep === 0 && (!watchedEventDate || !watchedCustomerId)) || (activeStep === 1 && watchedItems.length === 0)}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Next
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleSubmit(onFormSubmit)} 
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={loading}
              sx={{ borderRadius: 2, px: 4, minWidth: 140 }}
            >
              {loading ? 'Saving...' : 'Complete Booking'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      <CustomerDialog 
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={handleCustomerCreated}
      />
    </>
  );
};

export default BookingForm;
