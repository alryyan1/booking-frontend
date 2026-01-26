import { useState, useEffect } from "react";
import {
  bookingsAPI,
  customersAPI,
  itemsAPI,
  accessoriesAPI,
  categoriesAPI,
} from "../services/api";
import BookingForm from "../components/BookingForm";
import { toast } from "sonner";
import { Booking, Customer, Item, Accessory, Category } from "../types";
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
  Autocomplete,
  Avatar,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
} from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
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
  CreditCard,
  History,
} from "lucide-react";
import dressIcon from "../assets/dress.png";

import PaymentDialog from "../components/PaymentDialog";
import { Wallet } from "lucide-react";

const filterOptions = createFilterOptions<Customer>({
  stringify: (option) => option.name + (option.phone_number || ""),
});

const BookingsList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [paymentHistoryBooking, setPaymentHistoryBooking] =
    useState<Booking | null>(null);

  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [itemOptions, setItemOptions] = useState<Item[]>([]);
  const [accessoryOptions, setAccessoryOptions] = useState<Accessory[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const fetchOptions = async () => {
    try {
      const [customersRes, itemsRes, accRes, catsRes] = await Promise.all([
        customersAPI.getAll(),
        itemsAPI.getAll(),
        accessoriesAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setCustomerOptions(customersRes.data.data || customersRes.data || []);
      setItemOptions(itemsRes.data.data || itemsRes.data || []);
      setAccessoryOptions(accRes.data.data || accRes.data || []);
      setCategoryOptions(catsRes.data.data || catsRes.data || []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: any = {
        customer_id: selectedCustomer?.id,
        item_id: selectedItem?.id,
        accessory_id: selectedAccessory?.id,
        category_id: selectedCategory?.id,
        search: searchTerm || undefined, // Keep generic search if needed
        page: page + 1, // Laravel uses 1-based pagination
        per_page: rowsPerPage,
      };
      const response = await bookingsAPI.getAll(params);

      const responseData = response.data;
      // Handle both paginated and non-paginated responses (just in case)
      if (responseData.data && Array.isArray(responseData.data)) {
        setBookings(responseData.data);
        setTotal(responseData.total || responseData.data.length);
      } else if (Array.isArray(responseData)) {
        setBookings(responseData);
        setTotal(responseData.length);
      } else {
        setBookings([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchOptions();
  }, [
    selectedCustomer,
    selectedItem,
    selectedAccessory,
    selectedCategory,
    page,
    rowsPerPage,
  ]);

  // Keyboard shortcut: + for new booking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input, textarea, or select
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement?.getAttribute("contenteditable") === "true" ||
        activeElement?.closest(".MuiAutocomplete-root"); // Also ignore MUI Autocomplete

      if (e.key === "+" && !isInput) {
        e.preventDefault();
        setSelectedBooking(null);
        setShowForm(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSave = async (formData) => {
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
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await bookingsAPI.delete(id);
        toast.success("Booking deleted successfully!");
        setBookings((prev) => prev.filter((b) => b.id !== id));
        setShowForm(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error("Error deleting booking:", error);
        toast.error("Failed to delete booking.");
      }
    }
  };

  const handlePickedUp = (booking: Booking) => {
    if (window.confirm("Mark this booking as picked up?")) {
      handleConfirmPickedUp(booking.id, {});
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
        prev.map((b) => (b.id === id ? updatedBooking : b)),
      );
      toast.success("Payment recorded successfully!");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePayment = async (bookingId: number, paymentId: number) => {
    if (!window.confirm("Are you sure you want to delete this payment?"))
      return;

    try {
      const response = await bookingsAPI.deletePayment(bookingId, paymentId);
      const updatedBooking = response.data.data || response.data;

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b)),
      );

      // Also update the payment history dialog if it's open for this booking
      if (paymentHistoryBooking?.id === bookingId) {
        setPaymentHistoryBooking(updatedBooking);
      }

      toast.success("Payment deleted successfully!");
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment.");
    }
  };

  const handleConfirmPickedUp = async (id, data) => {
    setActionLoading(id);
    try {
      const response = await bookingsAPI.pickedUp(id, data);
      const updatedBooking = response.data.data || response.data;
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? updatedBooking : b)),
      );
      toast.success("Booking marked as picked up!");
    } catch (error) {
      console.error("Error picking up booking:", error);
      toast.error("Failed to mark as picked up.");
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
    const customerMatch = b.customer?.name?.toLowerCase().includes(search);
    const itemMatch = b.items?.some((item) =>
      item.name.toLowerCase().includes(search),
    );
    return invoiceMatch || customerMatch || itemMatch;
  });

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}

      <Stack
        direction={"row"}
        spacing={2}
        gap={1}
        alignItems={"center"}
        justifyContent={"space-between"}
        mb={2}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems={"center"}
          sx={{ flexGrow: 1 }}
        >
          <Autocomplete
            options={customerOptions}
            getOptionLabel={(option) => option.name}
            filterOptions={filterOptions}
            value={selectedCustomer}
            onChange={(_, newValue) => setSelectedCustomer(newValue)}
            sx={{ width: 250 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filter by Customer"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="gray" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
                  {option.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.phone_number}
                  </Typography>
                </Box>
              </Box>
            )}
          />

          <Autocomplete
            options={itemOptions}
            getOptionLabel={(option) => option.name}
            value={selectedItem}
            onChange={(_, newValue) => setSelectedItem(newValue)}
            sx={{ width: 200 }}
            renderInput={(params) => (
              <TextField {...params} label="Filter by Item" size="small" />
            )}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Stack direction="row" spacing={1} a alignItems={"center"}>
              <Chip
                label="All"
                size="medium"
                onClick={() => setSelectedCategory(null)}
                color={selectedCategory === null ? "primary" : "default"}
                variant={selectedCategory === null ? "filled" : "outlined"}
                sx={{ borderRadius: 1.5, fontWeight: "600", fontSize: "29px" }}
              />
              {categoryOptions.map((cat) => (
                <Chip
                  key={cat.id}
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {cat.name_en}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "1.1rem",
                          opacity: 0.8,
                          lineHeight: 1,
                          mt: 0.2,
                        }}
                      >
                        {cat.name_ar}
                      </Typography>
                    </Box>
                  }
                  size="small"
                  onClick={() => setSelectedCategory(cat)}
                  color={
                    selectedCategory?.id === cat.id ? "primary" : "default"
                  }
                  variant={
                    selectedCategory?.id === cat.id ? "filled" : "outlined"
                  }
                  sx={{
                    borderRadius: 1.5,
                    height: "auto",
                    "& .MuiChip-label": { px: 2, py: 0.5 },
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* <Autocomplete
            options={accessoryOptions}
            getOptionLabel={(option) => option.name}
            value={selectedAccessory}
            onChange={(_, newValue) => setSelectedAccessory(newValue)}
            sx={{ width: 180 }}
            renderInput={(params) => (
              <TextField {...params} label="Filter by Accessory" size="small" />
            )}
          /> */}
        </Stack>

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
          New
        </Button>
      </Stack>

      {/* Table */}

      <Table>
        <TableHead sx={{ bgcolor: "grey.50" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Id</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Inv / Event Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Items & Acc</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Financial Summary
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Status
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Pickup Date
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Picked Up Date
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : filteredBookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
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
                  <Stack direction={"column"} alignItems={"center"}>
                    <Chip
                      label={dayjs(booking.event_date).format("DD/MM/YYYY")}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Invoice No {booking.invoice_number}
                    </Typography>
                  </Stack>
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
                    {booking.customer?.phone_number || "No Phone"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {booking.items?.map((item) => (
                        <Tooltip
                          key={item.id}
                          title={
                            item.category
                              ? `${item.category.name_en} (${item.category.name_ar})`
                              : "No Category"
                          }
                          arrow
                        >
                          <Chip
                            label={item.name}
                            size="small"
                            icon={
                              <Box
                                component="img"
                                src={dressIcon}
                                sx={{ width: 14, height: 14 }}
                              />
                            }
                            sx={{
                              borderRadius: 1.5,
                              fontSize: "0.7rem",
                              cursor: "help",
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
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
                      const progress = total > 0 ? (deposit / total) * 100 : 0;

                      let color: "error" | "success" | "warning" | "primary" =
                        "error";
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
                            <Typography variant="caption" fontWeight="bold">
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
                              {balance > 0 ? `OMR ${balance} Left` : "Paid"}
                            </Typography>
                          </Box>
                          <Tooltip title="Click to view payment history">
                            <Box
                              onClick={() => setPaymentHistoryBooking(booking)}
                              sx={{
                                cursor: "pointer",
                                "&:hover": { opacity: 0.8 },
                              }}
                            >
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(progress, 100)}
                                color={color}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: "#f1f5f9",
                                  "& .MuiLinearProgress-bar": {
                                    borderRadius: 4,
                                  },
                                }}
                              />
                            </Box>
                          </Tooltip>
                        </Box>
                      );
                    })()}
                  </Stack>
                </TableCell>

                <TableCell align="center">
                  {(() => {
                    const total = Number(booking.total_amount) || 0;
                    const deposit = Number(booking.deposit_amount) || 0;
                    const balance = total - deposit;

                    if (booking.returned) {
                      return (
                        <Chip
                          label="Returned"
                          color="success"
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      );
                    }
                    if (booking.is_picked_up) {
                      return (
                        <Chip
                          label="Out"
                          color="info"
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      );
                    }
                    if (balance <= 0 && total > 0) {
                      return (
                        <Chip
                          label="Ready"
                          color="secondary"
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      );
                    }
                    if (deposit > 0) {
                      return (
                        <Chip
                          label="Partial"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      );
                    }
                    return (
                      <Chip
                        label="Reserved"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    );
                  })()}
                </TableCell>
                <TableCell align="center">
                  {dayjs(booking.pickup_date).format("DD/MM/YYYY")}
                </TableCell>

                <TableCell align="center">
                  {booking.is_picked_up && (
                    <Tooltip
                      title={`Picked Up by: ${booking.picked_up_by_user?.name || booking.user?.name || "Unknown"}`}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {dayjs(booking.pickedup_at).format("DD/MM/YYYY")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(booking.pickedup_at).format("HH:mm")}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip
                      title={
                        booking.is_picked_up
                          ? `Picked up on ${dayjs(booking.pickedup_at).format("DD/MM/YYYY")}`
                          : "Mark as Picked Up"
                      }
                    >
                      <IconButton
                        size="small"
                        color={booking.is_picked_up ? "success" : "default"}
                        onClick={() =>
                          !booking.is_picked_up && handlePickedUp(booking)
                        }
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <CheckCircle2
                            size={20}
                            color={booking.is_picked_up ? "#2e7d32" : "#bdbdbd"}
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
                          booking.is_picked_up &&
                          !booking.returned &&
                          handleReturnAction(booking.id)
                        }
                        disabled={
                          !booking.is_picked_up || actionLoading === booking.id
                        }
                      >
                        {actionLoading === booking.id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <RotateCcw
                            size={20}
                            color={booking.returned ? "#d32f2f" : "#bdbdbd"}
                          />
                        )}
                      </IconButton>
                    </Tooltip>

                    {Number(booking.remaining_balance) > 0 && (
                      <Tooltip title="Record Payment">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handlePay(booking)}
                          disabled={actionLoading === booking.id}
                        >
                          {actionLoading === booking.id ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <Wallet size={20} color="#2e7d32" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
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

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 15, 25, 50]}
      />

      {/* Booking Form Modal/Overlay handled by component */}
      {showForm && (
        <BookingForm
          booking={selectedBooking || undefined}
          onSave={handleSave}
          onDelete={selectedBooking ? handleDelete : undefined}
          onCancel={() => {
            setShowForm(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {showPaymentDialog && (
        <PaymentDialog
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          booking={paymentBooking || undefined}
          onConfirm={handleRecordPayment}
          onDeletePayment={handleDeletePayment}
        />
      )}
      {/* Payment History Dialog */}
      <Dialog
        open={!!paymentHistoryBooking}
        onClose={() => setPaymentHistoryBooking(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <History size={20} />
              <Typography variant="h6">Payment History</Typography>
            </Stack>
            <Chip
              label={`Invoice #${paymentHistoryBooking?.invoice_number}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {paymentHistoryBooking?.payments &&
          paymentHistoryBooking.payments.length > 0 ? (
            <Stack spacing={2} sx={{ py: 1 }}>
              {paymentHistoryBooking.payments.map((payment, index) => (
                <Card
                  key={payment.id}
                  variant="outlined"
                  sx={{
                    bgcolor:
                      index === 0 ? "rgba(16, 185, 129, 0.05)" : "inherit",
                    borderColor: index === 0 ? "success.light" : "divider",
                  }}
                >
                  <CardContent sx={{ py: "12px !important" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" fontWeight="700">
                          OMR {payment.amount}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={payment.payment_method}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 18,
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(payment.created_at).format(
                              "DD MMM YYYY, hh:mm A",
                            )}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Stack alignItems="flex-end">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Recorded by
                            </Typography>
                            <Typography variant="caption" fontWeight="600">
                              {payment.user?.name || "System"}
                            </Typography>
                          </Stack>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeletePayment(
                                paymentHistoryBooking.id,
                                payment.id,
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Stack>
                    {payment.notes && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                          borderLeft: "2px solid",
                          borderColor: "grey.300",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {payment.notes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
              <Divider />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: 1 }}
              >
                <Typography variant="body2" fontWeight="600">
                  Total Paid:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="700"
                  color="success.main"
                >
                  OMR{" "}
                  {paymentHistoryBooking?.payments.reduce(
                    (sum, p) => sum + parseFloat(p.amount as string),
                    0,
                  )}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                No payment history found
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentHistoryBooking(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsList;
