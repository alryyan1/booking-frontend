import { useState, useEffect } from "react";
import { bookingsAPI } from "../services/api";
import BookingForm from "../components/BookingForm";
import { toast } from "sonner";
import { Booking } from "../types";
import dayjs from "dayjs";

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
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Calendar,
  Truck,
  CheckCircle2,
  RotateCcw,
  FileText,
} from "lucide-react";
import dressIcon from "../assets/dress.png";
import DeliveryDialog from "../components/DeliveryDialog";

const BookingsList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [deliveryBooking, setDeliveryBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== "all") {
        params.payment_status = filterStatus;
      }
      const response = await bookingsAPI.getAll(params);
      setBookings(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedBooking) {
        const response = await bookingsAPI.update(selectedBooking.id, formData);
        const updatedBooking = response.data.data || response.data;
        setBookings((prev) =>
          prev.map((b) => (b.id === selectedBooking.id ? updatedBooking : b)),
        );
      } else {
        await bookingsAPI.create(formData);
        fetchBookings(); // Full refresh for new bookings
      }
      setShowForm(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error("Error saving booking. Check console for details.");
    }
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await bookingsAPI.delete(selectedBooking.id);
        setShowForm(false);
        setSelectedBooking(null);
        fetchBookings();
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  const handleDeliver = (booking) => {
    setDeliveryBooking(booking);
    setShowDeliveryDialog(true);
  };

  const handleConfirmDelivery = async (id, data) => {
    setActionLoading(id);
    try {
      const response = await bookingsAPI.deliver(id, data);
      const updatedBooking = response.data.data || response.data;
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? updatedBooking : b)),
      );
      toast.success("Booking marked as delivered!");
    } catch (error) {
      console.error("Error delivering booking:", error);
      toast.error("Failed to mark as delivered.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturnAction = async (id) => {
    if (window.confirm("Mark this booking as returned?")) {
      setActionLoading(id);
      try {
        const response = await bookingsAPI.return(id);
        const updatedBooking = response.data.data || response.data;
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? updatedBooking : b)),
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

  const filteredBookings = bookings.filter((b) => {
    const search = searchTerm.toLowerCase();
    const invoiceMatch = b.invoice_number?.toLowerCase().includes(search);
    const phoneMatch =
      b.phone_number?.includes(search) ||
      b.customer?.phone_number?.includes(search);
    const customerMatch = b.customer?.name?.toLowerCase().includes(search);
    const itemMatch = b.items?.some((item) =>
      item.name.toLowerCase().includes(search),
    );
    return invoiceMatch || phoneMatch || customerMatch || itemMatch;
  });

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
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
          startIcon={<Plus size={18} />}
          onClick={() => {
            setSelectedBooking(null);
            setShowForm(true);
          }}
          sx={{ fontWeight: "bold", padding: "10px 24px", borderRadius: 3 }}
        >
          New Booking
        </Button>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <TextField
          placeholder="Search invoice, phone, or items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="gray" />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: "white", borderRadius: 1 }}
        />

        <FormControl sx={{ minWidth: 200, bgcolor: "white", borderRadius: 1 }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            displayEmpty
            inputProps={{ "aria-label": "Filter Status" }}
            startAdornment={
              <InputAdornment position="start">
                <Filter size={20} color="gray" />
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
      <Card
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Id</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Inv / Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Items & Acc</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Financial Summary
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Delivery</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Action
                  </TableCell>
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
                      <Typography color="text.secondary">
                        No bookings found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>{booking.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {booking.invoice_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(booking.booking_date).format("DD/MM/YYYY")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          textTransform="capitalize"
                        >
                          {booking.customer?.name || "Walk-in"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.customer?.phone_number ||
                            booking.phone_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {booking.items?.map((item) => (
                              <Chip
                                key={item.id}
                                label={item.name}
                                size="small"
                                icon={
                                  <Box
                                    component="img"
                                    src={dressIcon}
                                    sx={{ width: 14, height: 14 }}
                                  />
                                }
                                sx={{ borderRadius: 1.5, fontSize: "0.7rem" }}
                              />
                            ))}
                          </Box>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {booking.rented_accessories?.map((acc) => (
                              <Chip
                                key={acc.id}
                                label={acc.name}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ borderRadius: 1.5, fontSize: "0.7rem" }}
                              />
                            ))}
                          </Box>
                          {booking.notes && (
                            <Tooltip title={booking.notes}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  color: "text.secondary",
                                }}
                              >
                                <FileText size={14} />
                                <Typography
                                  variant="caption"
                                  noWrap
                                  sx={{ maxWidth: 120 }}
                                >
                                  {booking.notes}
                                </Typography>
                              </Box>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack spacing={1} sx={{ minWidth: 150 }}>
                          {(() => {
                            const total =
                              typeof booking.total_amount === "string"
                                ? parseFloat(booking.total_amount)
                                : booking.total_amount || 0;
                            const deposit =
                              typeof booking.deposit_amount === "string"
                                ? parseFloat(booking.deposit_amount)
                                : booking.deposit_amount || 0;
                            const balance = total - deposit;
                            const progress =
                              total > 0 ? (deposit / total) * 100 : 0;

                            let color:
                              | "error"
                              | "success"
                              | "warning"
                              | "primary" = "error";
                            if (balance <= 0 && total > 0) {
                              color = "success";
                            } else if (deposit > 0) {
                              color = "warning";
                            }

                            return (
                              <Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    fontWeight="bold"
                                  >
                                    OMR {deposit} / {total}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color={
                                      color === "error"
                                        ? "error.main"
                                        : "text.secondary"
                                    }
                                    fontWeight="bold"
                                  >
                                    {balance > 0
                                      ? `OMR ${balance} Left`
                                      : "Paid"}
                                  </Typography>
                                </Box>
                                <Tooltip title={`${progress.toFixed(0)}% Paid`}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(progress, 100)}
                                    color={color}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: "grey.100",
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                            );
                          })()}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip
                            title={
                              booking.delivered
                                ? `Delivered on ${dayjs(booking.delivered_at).format("DD/MM/YYYY")}`
                                : "Mark as Delivered"
                            }
                          >
                            <IconButton
                              size="small"
                              color={booking.delivered ? "success" : "default"}
                              onClick={() =>
                                !booking.delivered && handleDeliver(booking)
                              }
                              disabled={actionLoading === booking.id}
                            >
                              {actionLoading === booking.id ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                <CheckCircle2
                                  size={20}
                                  color={
                                    booking.delivered ? "#2e7d32" : "#bdbdbd"
                                  }
                                />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={
                              booking.returned
                                ? `Returned on ${dayjs(booking.returned_at).format("DD/MM/YYYY")}`
                                : "Mark as Returned"
                            }
                          >
                            <IconButton
                              size="small"
                              color={booking.returned ? "error" : "default"}
                              onClick={() =>
                                booking.delivered &&
                                !booking.returned &&
                                handleReturnAction(booking.id)
                              }
                              disabled={
                                !booking.delivered ||
                                actionLoading === booking.id
                              }
                            >
                              {actionLoading === booking.id ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                <RotateCcw
                                  size={20}
                                  color={
                                    booking.returned ? "#d32f2f" : "#bdbdbd"
                                  }
                                />
                              )}
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
                            <Pencil size={20} />
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
