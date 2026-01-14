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
      <div className="text-xs">{booking.attire_name}</div>
      <div className="text-xs text-gray-600">{booking.phone_number}</div>
      <div className="text-xs font-medium mt-1">
        {booking.payment_status === 'paid' ? '✓ Paid' : 
         booking.payment_status === 'partial' ? '~ Partial' : 
         '○ Pending'}
      </div>
    </td>
  );
};

export default BookingCell;

