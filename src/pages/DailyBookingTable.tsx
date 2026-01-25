import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookingsAPI, calendarAPI, categoriesAPI } from "../services/api";
import { getDaysInWeek, formatDate } from "../utils/dateHelpers";
import { Booking, Category } from "../types";
import { toast } from "sonner";
import PaymentDialog from "../components/PaymentDialog";
import BookingCell from "../components/BookingCell";
import BookingForm from "../components/BookingForm";

// Define local interfaces for component state
interface WeekData {
  week_number: number;
  start_date: string;
  end_date: string;
  start_date_formatted: string;
  end_date_formatted: string;
}

const DailyBookingTable = () => {
  const { monthId, categoryId, weekNumber } = useParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [days, setDays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeksRes, categoriesRes] = await Promise.all([
          calendarAPI.getWeeks(monthId!, currentYear),
          categoriesAPI.getAll(),
        ]);

        const week = (weeksRes.data as any).weeks.find(
          (w: any) => w.week_number === parseInt(weekNumber!),
        );

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

          // Normalize booking dates
          const bookingsData = (bookingsRes.data as any).data || [];
          const normalizedBookings = bookingsData.map((booking: any) => ({
            ...booking,
            // Use event_date as the primary booking date since time slots are gone
            booking_date: booking.event_date
              ? booking.event_date.split("T")[0]
              : booking.pickup_date?.split("T")[0],
          }));

          setBookings(normalizedBookings);
        }

        const foundCategory = (categoriesRes.data as any).data.find(
          (c: any) => c.id === parseInt(categoryId!),
        );
        setCategory(foundCategory);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthId, categoryId, weekNumber, currentYear]);

  const handleDayClick = (date: Date) => {
    const dateStr = formatDate(date);
    setSelectedBooking(null);
    setSelectedDate(dateStr);
    setShowForm(true);
  };

  const handleBookingClick = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering day click
    setSelectedBooking(booking);
    // Use booking date or event date as the selected date
    const dateStr = booking.event_date
      ? booking.event_date.split("T")[0]
      : booking.booking_date || booking.pickup_date?.split("T")[0];
    setSelectedDate(dateStr);
    setShowForm(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedBooking) {
        await bookingsAPI.update(selectedBooking.id, formData);
        toast.success("Booking updated!");
      } else {
        await bookingsAPI.create(formData);
        toast.success("Booking created!");
      }
      refreshBookings();
      setShowForm(false);
      setSelectedBooking(null);
      setSelectedDate(null);
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error("Failed to save booking.");
    }
  };

  const refreshBookings = async () => {
    if (weekData) {
      const bookingsRes = await bookingsAPI.getAll({
        week_start: weekData.start_date,
        week_end: weekData.end_date,
        category_id: categoryId,
      });

      const bookingsData = (bookingsRes.data as any).data || [];
      const normalizedBookings = bookingsData.map((booking: any) => ({
        ...booking,
        booking_date: booking.event_date
          ? booking.event_date.split("T")[0]
          : booking.pickup_date?.split("T")[0],
      }));
      setBookings(normalizedBookings);
    }
  };

  const handlePickedUp = async (booking: Booking) => {
    if (window.confirm("Mark this booking as picked up?")) {
      setActionLoading(booking.id);
      try {
        const response = await bookingsAPI.pickedUp(booking.id, {});
        const updatedBooking = response.data.data || response.data;
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? updatedBooking : b)),
        );
        toast.success("Booking marked as picked up!");
      } catch (error) {
        console.error("Error picking up booking:", error);
        toast.error("Failed to mark as picked up.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handlePay = (booking: Booking) => {
    setPaymentBooking(booking);
    setShowPaymentDialog(true);
  };

  const handleRecordPayment = async (
    id: number,
    data: { payment_amount: number; payment_method: string },
  ) => {
    setActionLoading(id);
    try {
      const response = await bookingsAPI.pay(id, data);
      const updatedBooking = response.data.data || response.data;
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...updatedBooking, booking_date: b.booking_date } : b,
        ),
      );
      toast.success("Payment recorded successfully!");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturnAction = async (id: number) => {
    if (window.confirm("Mark this booking as returned?")) {
      setActionLoading(id);
      try {
        const response = await bookingsAPI.return(id);
        const updatedBooking = response.data.data || response.data;
        setBookings((prev) =>
          prev.map((b) =>
            b.id === id
              ? { ...updatedBooking, booking_date: b.booking_date }
              : b,
          ),
        );
        toast.success("Booking marked as returned!");
      } catch (error) {
        console.error("Error returning booking:", error);
        toast.error("Failed to mark as returned.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;

    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await bookingsAPI.delete(selectedBooking.id);

        await refreshBookings();
        setShowForm(false);
        setSelectedBooking(null);
        toast.success("Booking deleted.");
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  const filteredBookings = searchTerm
    ? bookings.filter(
        (b) =>
          b.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.phone_number.includes(searchTerm) ||
          b.items?.some((item: any) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    : bookings;

  // Group bookings by date
  const getBookingsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return filteredBookings.filter((b) => b.booking_date === dateStr);
  };

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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Week {weekNumber}
              </h1>
              <p className="text-gray-500">
                {weekData?.start_date_formatted} -{" "}
                {weekData?.end_date_formatted}
              </p>
              {category && (
                <p className="text-xl text-indigo-600 mt-1 font-semibold">
                  {category.name_en}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setSelectedDate(null);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm"
              >
                + New Booking
              </button>
            </div>
          </div>
        </div>

        <div className="mb-1">
          <input
            type="text"
            placeholder="Search by invoice, phone, or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Weekly Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {days.map((day) => {
            const dayBookings = getBookingsForDate(day);
            const isToday = formatDate(day) === formatDate(new Date());

            return (
              <div
                key={day.toString()}
                className={`flex flex-col h-full min-h-[500px] bg-white rounded-lg border ${isToday ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-200"} shadow-sm`}
              >
                {/* Column Header */}
                <div
                  className={`p-3 text-center border-b ${isToday ? "bg-indigo-50 text-indigo-700" : "bg-gray-50 text-gray-700"} rounded-t-lg`}
                >
                  <div className="text-sm font-semibold uppercase">
                    {formatDate(day).split("-").join("/")}
                  </div>
                  {/* Ideally use a proper formatter for day name, but formatDate gives YYYY-MM-DD. 
                                Let's assume we want Day Name. We can use date helpers or native Intl 
                             */}
                  <div className="text-xs opacity-75">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                </div>

                {/* Drop/Click Area */}
                <div
                  className="flex-1 p-2 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleDayClick(day)}
                >
                  {dayBookings.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                      No bookings
                    </div>
                  ) : (
                    dayBookings.map((booking) => (
                      <BookingCell
                        key={booking.id}
                        booking={booking}
                        onClick={(e: any) => handleBookingClick(booking, e)}
                        onPickedUp={handlePickedUp}
                        onPay={handlePay}
                        onReturn={handleReturnAction}
                        onEdit={(b: Booking) =>
                          handleBookingClick(b, {} as any)
                        }
                        actionLoading={actionLoading}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showPaymentDialog && (
          <PaymentDialog
            open={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
            booking={paymentBooking}
            onConfirm={handleRecordPayment}
          />
        )}
        {showForm && (
          <BookingForm
            booking={selectedBooking || undefined}
            onSave={handleSave}
            onDelete={selectedBooking ? handleDelete : undefined}
            onCancel={() => {
              setShowForm(false);
              setSelectedBooking(null);
              setSelectedDate(null);
            }}
            bookingDate={selectedDate || undefined}
          />
        )}
      </div>
    </div>
  );
};

export default DailyBookingTable;
