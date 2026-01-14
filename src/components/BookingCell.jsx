const BookingCell = ({ booking, onClick }) => {
  if (!booking) {
    return (
      <td className="border border-gray-300 p-2 h-20 bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={onClick}>
        <div className="text-xs text-gray-400">Click to add</div>
      </td>
    );
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 border-green-300';
      case 'partial':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-red-100 border-red-300';
    }
  };

  return (
    <td
      className={`border border-gray-300 p-2 h-20 cursor-pointer hover:opacity-80 ${getPaymentStatusColor(booking.payment_status)}`}
      onClick={onClick}
    >
      <div className="text-xs font-semibold">{booking.invoice_number}</div>
      <div className="text-[10px] text-indigo-700 font-bold leading-tight mt-0.5 truncate uppercase tracking-tighter">
        {booking.items?.length > 0 
          ? booking.items.map(i => i.name).join(', ') 
          : 'No Items'}
      </div>
      <div className="text-xs text-slate-800 font-bold mt-1 truncate uppercase">
        {booking.customer?.name || booking.phone_number}
      </div>
      <div className="text-[10px] font-black mt-1 uppercase tracking-widest text-emerald-600">
        ${parseFloat(booking.remaining_balance).toFixed(0)} Left
      </div>
    </td>
  );
};

export default BookingCell;

