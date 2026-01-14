import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI, timeSlotsAPI, calendarAPI, categoriesAPI } from '../services/api';
import { getDaysInWeek, formatDate, formatTime } from '../utils/dateHelpers';
import BookingCell from '../components/BookingCell';
import BookingForm from '../components/BookingForm';

const DailyBookingTable = () => {
  const { monthId, categoryId, weekNumber } = useParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [weekData, setWeekData] = useState(null);
  const [category, setCategory] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeksRes, timeSlotsRes, categoriesRes] = await Promise.all([
          calendarAPI.getWeeks(monthId, currentYear),
          timeSlotsAPI.getAll(),
          categoriesAPI.getAll(),
        ]);

        const week = weeksRes.data.weeks.find((w) => w.week_number === parseInt(weekNumber));
        if (week) {
          setWeekData(week);
          const weekDays = getDaysInWeek(week.start_date, week.end_date);
          setDays(weekDays);

          // Fetch bookings for this week and category
          const bookingsRes = await bookingsAPI.getAll({
            week_start: week.start_date,
            week_end: week.end_date,
            category_id: categoryId,
          });
          
          // Normalize booking dates and time_slot_id for consistent comparison
          const normalizedBookings = bookingsRes.data.map(booking => ({
            ...booking,
            booking_date: booking.booking_date ? booking.booking_date.split('T')[0] : booking.booking_date,
            time_slot_id: parseInt(booking.time_slot_id, 10),
          }));
          
          setBookings(normalizedBookings);
        }

        setTimeSlots(timeSlotsRes.data);
        const foundCategory = categoriesRes.data.find((c) => c.id === parseInt(categoryId));
        setCategory(foundCategory);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthId, categoryId, weekNumber, currentYear]);

  const getBookingForCell = (date, timeSlotId) => {
    const dateStr = formatDate(date);
    // Normalize date string (remove time component if present)
    const normalizeDate = (dateValue) => {
      if (!dateValue) return '';
      // If it's already in YYYY-MM-DD format, return as is
      if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateValue;
      }
      // Otherwise, format it
      return formatDate(dateValue);
    };
    
    return bookings.find((b) => {
      const bookingDate = normalizeDate(b.booking_date);
      const bookingTimeSlotId = parseInt(b.time_slot_id, 10);
      const cellTimeSlotId = parseInt(timeSlotId, 10);
      
      return bookingDate === dateStr && bookingTimeSlotId === cellTimeSlotId;
    });
  };

  const handleCellClick = (date, timeSlotId) => {
    const dateStr = formatDate(date);
    const existingBooking = getBookingForCell(date, timeSlotId);
    
    if (existingBooking) {
      setSelectedBooking(existingBooking);
    } else {
      setSelectedBooking(null);
    }
    
    setSelectedDate(dateStr);
    setSelectedTimeSlot(timeSlotId);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedBooking) {
        await bookingsAPI.update(selectedBooking.id, formData);
      } else {
        await bookingsAPI.create(formData);
      }
      
      // Small delay to ensure backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refresh bookings
      const bookingsRes = await bookingsAPI.getAll({
        week_start: weekData.start_date,
        week_end: weekData.end_date,
        category_id: categoryId,
      });
      
      // Ensure dates are properly formatted
      const normalizedBookings = bookingsRes.data.map(booking => ({
        ...booking,
        booking_date: booking.booking_date ? booking.booking_date.split('T')[0] : booking.booking_date,
        time_slot_id: parseInt(booking.time_slot_id, 10),
      }));
      
      setBookings(normalizedBookings);
      
      setShowForm(false);
      setSelectedBooking(null);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Error saving booking. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;
    
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await bookingsAPI.delete(selectedBooking.id);
        
        // Refresh bookings
        const bookingsRes = await bookingsAPI.getAll({
          week_start: weekData.start_date,
          week_end: weekData.end_date,
          category_id: categoryId,
        });
        setBookings(bookingsRes.data);
        
        setShowForm(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. Please try again.');
      }
    }
  };

  const filteredBookings = searchTerm
    ? bookings.filter(
        (b) =>
          b.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.phone_number.includes(searchTerm)
      )
    : bookings;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading booking table...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Week {weekNumber} - {weekData?.start_date_formatted} to {weekData?.end_date_formatted}
              </h1>
              {category && (
                <p className="text-xl text-gray-600 mt-2">
                  {category.name_en} ({category.name_ar})
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedBooking(null);
                setSelectedDate(null);
                setSelectedTimeSlot(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + New Booking
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by invoice number or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-2 text-left font-semibold sticky left-0 z-10 bg-gray-100">
                  Time Slot
                </th>
                {days.map((day, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 bg-gray-100 p-2 text-center font-semibold min-w-[150px]"
                  >
                    <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-sm text-gray-600">
                      {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot.id}>
                  <td className="border border-gray-300 bg-gray-50 p-2 font-medium sticky left-0 z-10 bg-gray-50">
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </td>
                  {days.map((day, dayIndex) => (
                    <BookingCell
                      key={dayIndex}
                      booking={getBookingForCell(day, slot.id)}
                      onClick={() => handleCellClick(day, slot.id)}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <BookingForm
            booking={selectedBooking}
            onSave={handleSave}
            onDelete={selectedBooking ? handleDelete : null}
            onCancel={() => {
              setShowForm(false);
              setSelectedBooking(null);
              setSelectedDate(null);
              setSelectedTimeSlot(null);
            }}
            bookingDate={selectedDate}
            timeSlotId={selectedTimeSlot}
            categoryId={categoryId}
          />
        )}
      </div>
    </div>
  );
};

export default DailyBookingTable;

