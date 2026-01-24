import { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';
import BookingForm from '../components/BookingForm';
import { toast } from 'sonner';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  LocalShipping as DeliveryIcon,
  CheckCircle as SuccessIcon,
  AssignmentReturn as ReturnIcon,
  Notes as NotesIcon,
  Inventory2 as ItemsIcon
} from '@mui/icons-material';
import DeliveryDialog from '../components/DeliveryDialog';

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [deliveryBooking, setDeliveryBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') {
        params.payment_status = filterStatus;
      }
      const response = await bookingsAPI.getAll(params);
      setBookings(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedBooking) {
        await bookingsAPI.update(selectedBooking.id, formData);
      } else {
        await bookingsAPI.create(formData);
      }
      setShowForm(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error('Error saving booking:', error);
      toast.error('Error saving booking. Check console for details.');
    }
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await bookingsAPI.delete(selectedBooking.id);
        setShowForm(false);
        setSelectedBooking(null);
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const handleDeliver = (booking) => {
    setDeliveryBooking(booking);
    setShowDeliveryDialog(true);
  };

  const handleConfirmDelivery = async (id, data) => {
    try {
      await bookingsAPI.deliver(id, data);
      toast.success('Booking marked as delivered!');
      fetchBookings();
    } catch (error) {
      console.error('Error delivering booking:', error);
      toast.error('Failed to mark as delivered.');
    }
  };

  const handleReturnAction = async (id) => {
    if (window.confirm('Mark this booking as returned?')) {
      try {
        await bookingsAPI.return(id);
        toast.success('Booking marked as returned!');
        fetchBookings();
      } catch (error) {
        console.error('Error returning booking:', error);
        toast.error('Failed to mark as returned.');
      }
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const search = searchTerm.toLowerCase();
    const invoiceMatch = b.invoice_number?.toLowerCase().includes(search);
    const phoneMatch = b.phone_number?.includes(search) || b.customer?.phone_number?.includes(search);
    const customerMatch = b.customer?.name?.toLowerCase().includes(search);
    const itemMatch = b.items?.some(item => item.name.toLowerCase().includes(search));
    return invoiceMatch || phoneMatch || customerMatch || itemMatch;
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Booking Explorer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your bookings, deposits, and returns
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedBooking(null);
            setShowForm(true);
          }}
          sx={{ fontWeight: 'bold', padding: '10px 24px', borderRadius: 3 }}
        >
          New Booking
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4 }}>
        <TextField
          placeholder="Search invoice, phone, or items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: 'white', borderRadius: 1 }}
        />
        
        <FormControl sx={{ minWidth: 200, bgcolor: 'white', borderRadius: 1 }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            displayEmpty
            inputProps={{ 'aria-label': 'Filter Status' }}
            startAdornment={
               <InputAdornment position="start">
                 <FilterListIcon color="action" />
               </InputAdornment>
            }
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Inv / Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Items & Acc</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Finances</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Delivery</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                     <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                       <CircularProgress />
                     </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No bookings found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{booking.invoice_number}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600" textTransform="capitalize">
                            {booking.customer?.name || 'Walk-in'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {booking.customer?.phone_number || booking.phone_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {booking.items?.map((item) => (
                              <Chip key={item.id} label={item.name} size="small" icon={<ItemsIcon sx={{ fontSize: '0.8rem !important' }} />} sx={{ borderRadius: 1.5, fontSize: '0.7rem' }} />
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {booking.rented_accessories?.map((acc) => (
                              <Chip key={acc.id} label={acc.name} size="small" variant="outlined" color="primary" sx={{ borderRadius: 1.5, fontSize: '0.7rem' }} />
                            ))}
                          </Box>
                          {booking.notes && (
                            <Tooltip title={booking.notes}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <NotesIcon sx={{ fontSize: '0.9rem' }} />
                                <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>{booking.notes}</Typography>
                              </Box>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">Total: <strong>${Number(booking.total_amount).toFixed(2)}</strong></Typography>
                          <Typography variant="body2" color="success.main">Paid: <strong>${Number(booking.deposit_amount).toFixed(2)}</strong></Typography>
                          <Typography variant="body2" color="error.main">Due: <strong>${Number(booking.remaining_balance).toFixed(2)}</strong></Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack spacing={1} alignItems="center">
                          {(() => {
                            const total = parseFloat(booking.total_amount) || 0;
                            const deposit = parseFloat(booking.deposit_amount) || 0;
                            const balance = total - deposit;
                            let status = 'pending';
                            let color = 'error';
                            if (balance <= 0 && total > 0) { status = 'paid'; color = 'success'; }
                            else if (deposit > 0) { status = 'partial'; color = 'warning'; }
                            return <Chip label={status} size="small" color={color} sx={{ textTransform: 'capitalize', fontWeight: 600, width: 70 }} />;
                          })()}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title={booking.delivered ? `Delivered on ${new Date(booking.delivered_at).toLocaleDateString()}` : "Mark as Delivered"}>
                            <IconButton 
                              size="small" 
                              color={booking.delivered ? "success" : "default"}
                              onClick={() => !booking.delivered && handleDeliver(booking)}
                            >
                              <SuccessIcon sx={{ color: booking.delivered ? 'success.main' : 'grey.300' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={booking.returned ? `Returned on ${new Date(booking.returned_at).toLocaleDateString()}` : "Mark as Returned"}>
                            <IconButton 
                              size="small" 
                              color={booking.returned ? "error" : "default"}
                              onClick={() => booking.delivered && !booking.returned && handleReturnAction(booking.id)}
                              disabled={!booking.delivered}
                            >
                              <ReturnIcon sx={{ color: booking.returned ? 'error.main' : 'grey.300' }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Booking">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowForm(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Booking Form Modal/Overlay handled by component */}
      {showForm && (
        <BookingForm
          booking={selectedBooking}
          onSave={handleSave}
          onDelete={selectedBooking ? handleDelete : null}
          onCancel={() => {
            setShowForm(false);
            setSelectedBooking(null);
          }}
        />
      )}
      {showDeliveryDialog && (
        <DeliveryDialog
          open={showDeliveryDialog}
          booking={deliveryBooking}
          onClose={() => setShowDeliveryDialog(false)}
          onConfirm={handleConfirmDelivery}
        />
      )}
    </Box>
  );
};

export default BookingsList;
