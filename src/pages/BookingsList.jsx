import { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';
import { Plus, Search, Filter, Truck, CornerUpLeft, Edit2, Trash2, CalendarIcon } from 'lucide-react';
import BookingForm from '../components/BookingForm';
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Label } from "@/components/ui/label";

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({ booking: null, payment_received: 0 });

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.payment_status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      const response = await bookingsAPI.getAll(params);
      setBookings(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDeliver = async () => {
    try {
      await bookingsAPI.deliver(deliveryData.booking.id, { payment_received: deliveryData.payment_received });
      setShowDeliveryModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Error delivering booking:', error);
    }
  };

  const handleReturn = async (id) => {
    if (window.confirm('Mark this item as returned?')) {
      try {
        await bookingsAPI.return(id);
        fetchBookings();
      } catch (error) {
        console.error('Error returning booking:', error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await bookingsAPI.delete(id);
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const openDelivery = (booking) => {
    setDeliveryData({ booking, payment_received: 0 });
    setShowDeliveryModal(true);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage and track all customer bookings.</p>
        </div>
        <Button onClick={() => { setSelectedBooking(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Booking
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Event Date</TableHead>
              <TableHead>Financials</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading bookings...
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">#{booking.invoice_number}</TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.customer?.name}</div>
                    <div className="text-xs text-muted-foreground">{booking.phone_number}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      {new Date(booking.event_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>Paid: <span className="font-medium text-green-600">${booking.deposit_amount}</span></div>
                      <div>Bal: <span className="font-medium text-red-600">${booking.remaining_balance}</span></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      booking.payment_status === 'paid' ? 'success' : 
                      booking.payment_status === 'partial' ? 'warning' : 'outline'
                    } className="capitalize">
                      {booking.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!booking.delivered && (
                      <Button variant="outline" size="icon" onClick={() => openDelivery(booking)} title="Deliver">
                        <Truck className="w-4 h-4" />
                      </Button>
                    )}
                    {booking.delivered && !booking.returned && (
                      <Button variant="outline" size="icon" onClick={() => handleReturn(booking.id)} title="Return">
                        <CornerUpLeft className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedBooking(booking); setShowForm(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(booking.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <BookingForm
            booking={selectedBooking}
            onSave={() => { setShowForm(false); fetchBookings(); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
            <DialogDescription>
              Marking invoice #{deliveryData.booking?.invoice_number} as delivered.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted rounded-md italic">
                <div className="text-[10px] uppercase text-muted-foreground">Total</div>
                <div className="font-bold">${deliveryData.booking?.total_amount}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-md">
                <div className="text-[10px] uppercase text-green-600">Paid</div>
                <div className="font-bold text-green-700">${deliveryData.booking?.deposit_amount}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-md">
                <div className="text-[10px] uppercase text-red-600">Balance</div>
                <div className="font-bold text-red-700">${deliveryData.booking?.remaining_balance}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment">Received Payment Now?</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="payment"
                  type="number"
                  className="pl-7"
                  placeholder="0.00"
                  value={deliveryData.payment_received}
                  onChange={(e) => setDeliveryData({ ...deliveryData, payment_received: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeliveryModal(false)}>Cancel</Button>
            <Button onClick={handleDeliver}>Confirm & Deliver</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsList;
