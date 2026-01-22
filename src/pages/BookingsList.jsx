import { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';
import BookingForm from '../components/BookingForm';
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
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon, // Added missing icon
  Event as EventIcon
} from '@mui/icons-material';

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
      alert('Error saving booking. Check console for details.');
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
                  <TableCell sx={{ fontWeight: 600 }}>Invoice / Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Return Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Deposit</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Balance</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
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
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                          {booking.items?.length > 0 ? (
                            booking.items.map((item) => (
                              <Chip 
                                key={item.id} 
                                label={item.name} 
                                size="small" 
                                variant="outlined" 
                                sx={{ borderRadius: 1, fontWeight: 500, fontSize: '0.7rem' }} 
                              />
                            ))
                          ) : (
                            <Typography variant="caption" fontStyle="italic" color="text.secondary">No items</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {booking.return_date ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 500 }}>
                                <EventIcon fontSize="small" />
                                <Typography variant="body2">{new Date(booking.return_date).toLocaleDateString()}</Typography>
                            </Box>
                        ) : (
                            <Typography variant="caption" color="text.secondary">Not set</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        ${Number(booking.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'text.secondary' }}>
                        ${Number(booking.deposit_amount).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold" color={Number(booking.remaining_balance) > 0 ? 'error.main' : 'success.main'}>
                            ${Number(booking.remaining_balance).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.payment_status}
                          size="small"
                          color={
                            booking.payment_status === 'paid' ? 'success' :
                            booking.payment_status === 'partial' ? 'warning' : 'error'
                          }
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
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
    </Box>
  );
};

export default BookingsList;
