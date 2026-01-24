import { Booking } from "../types";
import React from "react";

interface BookingCellProps {
  booking: Booking;
  onClick: (e: React.MouseEvent) => void;
}

const BookingCell = ({ booking, onClick }: BookingCellProps) => {
  if (!booking) {
    return null;
  }

  const getPaymentStatus = (booking: Booking) => {
    const total = parseFloat(booking.total_amount as string) || 0;
    const deposit = parseFloat(booking.deposit_amount as string) || 0;
    const balance = parseFloat(booking.remaining_balance as string) || 0;

    if (balance <= 0 && total > 0) return "paid";
    if (deposit > 0) return "partial";
    return "pending";
  };

  const getPaymentStatusColor = (booking: Booking) => {
    const status = getPaymentStatus(booking);
    switch (status) {
      case "paid":
        return "bg-green-100 border-l-4 border-l-green-500 border-y border-r border-gray-200";
      case "partial":
        return "bg-yellow-100 border-l-4 border-l-yellow-500 border-y border-r border-gray-200";
      default:
        return "bg-red-100 border-l-4 border-l-red-500 border-y border-r border-gray-200";
    }
  };

  return (
    <div
      className={`p-2 mb-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow ${getPaymentStatusColor(booking)}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="text-xs font-semibold">{booking.invoice_number}</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
          ${parseFloat(booking.remaining_balance as string).toFixed(0)} Left
        </div>
      </div>

      <div className="text-[10px] text-indigo-700 font-bold leading-tight mt-1 truncate uppercase tracking-tighter">
        {booking.items && booking.items.length > 0
          ? booking.items.map((i: any) => i.name).join(", ")
          : "No Items"}
      </div>
      <div className="text-xs text-slate-800 font-bold mt-1 truncate uppercase">
        {booking.customer?.name || booking.phone_number}
      </div>
      {(booking.pickup_date || booking.event_date) && (
        <div className="text-[10px] text-gray-500 mt-1">
          {booking.pickup_date
            ? `Pickup: ${booking.pickup_date.split("T")[0]}`
            : `Event: ${booking.event_date.split("T")[0]}`}
        </div>
      )}
    </div>
  );
};

export default BookingCell;
