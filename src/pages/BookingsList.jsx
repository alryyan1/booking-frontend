import { useState, useEffect } from 'react';
import { bookingsAPI, categoriesAPI, timeSlotsAPI } from '../services/api';
import { Plus, Calendar, FileText, Search, Filter, ArrowUpDown } from 'lucide-react';
import BookingForm from '../components/BookingForm';

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
      // Backend returns paginated data
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
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking Explorer</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage rentals, deposits, and returns in real-time</p>
        </div>
        <button
          onClick={() => {
            setSelectedBooking(null);
            setShowForm(true);
          }}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> New Booking
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 relative group">
          <Search className="w-5 h-5 absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search invoice, phone, or dress name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
          />
        </div>
        <div className="w-full md:w-64 relative group">
          <Filter className="w-5 h-5 absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold transition-all shadow-sm appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Invoice / Date</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Customer</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Items (Inventory)</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Return Date</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Total</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Deposit</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Balance</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="9" className="px-8 py-20 text-center text-slate-400 italic font-medium">Finding bookings...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="9" className="px-8 py-20 text-center text-slate-400 italic font-medium">No bookings found matching your criteria</td></tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900 leading-none">{booking.invoice_number}</div>
                      <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 uppercase">{booking.customer?.name || 'Walk-in'}</div>
                      <div className="text-xs text-slate-400 font-medium">{booking.customer?.phone_number || booking.phone_number}</div>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {booking.items?.map(item => (
                          <span key={item.id} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm">
                            {item.name}
                          </span>
                        ))}
                        {!booking.items?.length && <span className="text-slate-300 italic text-sm">No items</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {booking.return_date ? (
                        <div className="flex items-center gap-2 text-indigo-600 font-bold whitespace-nowrap">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.return_date).toLocaleDateString()}
                        </div>
                      ) : <span className="text-slate-300 font-medium">Not set</span>}
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-700 whitespace-nowrap">
                      ${parseFloat(booking.total_amount).toFixed(2)}
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-500 whitespace-nowrap">
                      ${parseFloat(booking.deposit_amount).toFixed(2)}
                    </td>
                    <td className="px-8 py-6 text-center whitespace-nowrap">
                      <span className="text-lg font-black text-emerald-600">
                        ${parseFloat(booking.remaining_balance).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        booking.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        booking.payment_status === 'partial' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.payment_status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowForm(true);
                        }}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow group-hover:bg-white"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
};

export default BookingsList;
