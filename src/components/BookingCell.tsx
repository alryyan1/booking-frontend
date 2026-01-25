import { Booking } from "@/types";
import { Divider, Tooltip, IconButton, CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import {
  User,
  Phone,
  Package,
  Hash,
  CheckCircle2,
  RotateCcw,
  Wallet,
  Pencil,
} from "lucide-react";

interface BookingCellProps {
  booking: Booking;
  onClick: (e: React.MouseEvent) => void;
  onPickedUp?: (booking: Booking) => void;
  onReturn?: (id: number) => void;
  onPay?: (booking: Booking) => void;
  onEdit?: (booking: Booking) => void;
  actionLoading?: number | null;
}

const BookingCell = ({
  booking,
  onClick,
  onPickedUp,
  onReturn,
  onPay,
  onEdit,
  actionLoading,
}: BookingCellProps) => {
  if (!booking) return null;

  const total = Number(booking.total_amount) || 0;
  const deposit = Number(booking.deposit_amount) || 0;
  const balance = Number(booking.remaining_balance) || 0;
  const isLoading = actionLoading === booking.id;

  const getStatus = () => {
    if (total > 0 && balance <= 0) return "paid";
    return deposit > 0 ? "partial" : "pending";
  };

  const statusConfig = {
    paid: {
      bg: "bg-emerald-50/50",
      border: "border-l-emerald-500",
      text: "text-emerald-700",
      label: "Fully Paid",
    },
    partial: {
      bg: "bg-amber-50/50",
      border: "border-l-amber-500",
      text: "text-amber-700",
      label: "Partial Payment",
    },
    pending: {
      bg: "bg-rose-50/50",
      border: "border-l-rose-500",
      text: "text-rose-700",
      label: "Pending Payment",
    },
  };

  const currentStatus = getStatus();
  const config = statusConfig[currentStatus];

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      className={`group relative p-3 mb-3 rounded-xl border border-slate-200 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${config.bg} border-l-[6px] ${config.border}`}
      onClick={onClick}
    >
      {/* Header: Invoice & Balance */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Hash size={14} className="opacity-70" />
          <span className="text-xs font-bold tracking-tight text-slate-700">
            {booking.invoice_number}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <div
            className={`text-[11px] font-black uppercase tracking-wider ${config.text}`}
          >
            {balance > 0 ? `OMR ${balance.toFixed(2)}` : "COMPLETED"}
          </div>
          {balance > 0 && (
            <div className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">
              Balance Remaining
            </div>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-white shadow-sm border border-slate-100">
            <User size={12} className="text-slate-500" />
          </div>
          <span className="text-sm font-bold text-slate-800 leading-none truncate capitalize">
            {booking.customer?.name || "Walk-in Customer"}
          </span>
        </div>

        {booking.customer?.phone_number && (
          <div className="flex items-center gap-2 ml-1">
            <Phone size={10} className="text-slate-400" />
            <span className="text-[11px] font-medium text-slate-500">
              {booking.customer.phone_number}
            </span>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex items-start gap-2 mb-3">
        <Package size={12} className="text-slate-400 mt-0.5 shrink-0" />
        <div className="text-[11px] text-slate-600 font-medium leading-relaxed italic line-clamp-2">
          {booking.items && booking.items.length > 0
            ? booking.items.map((i: any) => i.name).join(", ")
            : "No items selected"}
        </div>
      </div>

      <Divider className="opacity-40" />

      {/* Actions Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1">
          {/* Picked Up Action */}
          <Tooltip
            title={booking.is_picked_up ? "Picked Up" : "Mark as Picked Up"}
          >
            <span>
              <IconButton
                size="small"
                onClick={(e) =>
                  onPickedUp && handleAction(e, () => onPickedUp(booking))
                }
                disabled={booking.is_picked_up || isLoading}
                sx={{ color: booking.is_picked_up ? "#10b981" : "#94a3b8" }}
              >
                {isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckCircle2 size={18} />
                )}
              </IconButton>
            </span>
          </Tooltip>

          {/* Return Action */}
          <Tooltip title={booking.returned ? "Returned" : "Mark Returned"}>
            <span>
              <IconButton
                size="small"
                onClick={(e) =>
                  onReturn && handleAction(e, () => onReturn(booking.id))
                }
                disabled={
                  !booking.is_picked_up || booking.returned || isLoading
                }
                sx={{ color: booking.returned ? "#f43f5e" : "#94a3b8" }}
              >
                <RotateCcw size={18} />
              </IconButton>
            </span>
          </Tooltip>

          {/* Pay Action */}
          {balance > 0 && onPay && (
            <Tooltip title="Record Payment">
              <IconButton
                size="small"
                onClick={(e) => handleAction(e, () => onPay(booking))}
                disabled={isLoading}
                sx={{ color: "#10b981" }}
              >
                <Wallet size={18} />
              </IconButton>
            </Tooltip>
          )}
        </div>

        {/* Edit Action */}
        {onEdit && (
          <Tooltip title="Edit Booking">
            <IconButton
              size="small"
              onClick={(e) => handleAction(e, () => onEdit(booking))}
              disabled={isLoading}
              className="text-indigo-500"
            >
              <Pencil size={18} />
            </IconButton>
          </Tooltip>
        )}
      </div>

      {/* Subtle Status Badge on hover */}
      <div className="absolute -top-2 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-sm ${config.border.replace("border-l-", "bg-")}`}
        >
          {config.label}
        </div>
      </div>
    </div>
  );
};

export default BookingCell;
