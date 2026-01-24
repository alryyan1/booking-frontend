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
import PaymentDialog from "../components/PaymentDialog";
import { Wallet } from "lucide-react";

const BookingsList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [deliveryBooking, setDeliveryBooking] = useState<Booking | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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

  const handleDeliver = (booking: Booking) => {
    setDeliveryBooking(booking);
    setShowDeliveryDialog(true);
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
        <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
          <Autocomplete
            options={customerOptions}
            getOptionLabel={(option) => option.name}
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

          <Autocomplete
            options={categoryOptions}
            getOptionLabel={(option) => option.name_en}
            value={selectedCategory}
            onChange={(_, newValue) => setSelectedCategory(newValue)}
            sx={{ width: 180 }}
            renderInput={(params) => (
              <TextField {...params} label="Filter by Category" size="small" />
            )}
          />

          <Autocomplete
            options={accessoryOptions}
            getOptionLabel={(option) => option.name}
            value={selectedAccessory}
            onChange={(_, newValue) => setSelectedAccessory(newValue)}
            sx={{ width: 180 }}
            renderInput={(params) => (
              <TextField {...params} label="Filter by Accessory" size="small" />
            )}
          />
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
            <TableCell sx={{ fontWeight: 600 }}>Inv / Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Items & Acc</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Financial Summary
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Status
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Delivery Date
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
                  <Typography variant="body2" fontWeight="bold">
                    {booking.invoice_number}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(booking.pickup_date).format("DD/MM/YYYY")}
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
                    if (booking.delivered) {
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
                  {booking.delivered && (
                    <Tooltip
                      title={`Delivered by: ${booking.delivered_by_user?.name || booking.user?.name || "Unknown"}`}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {dayjs(booking.delivered_at).format("DD/MM/YYYY")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(booking.delivered_at).format("HH:mm")}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
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
                            color={booking.delivered ? "#2e7d32" : "#bdbdbd"}
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
                          !booking.delivered || actionLoading === booking.id
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
          booking={selectedBooking}
          onSave={handleSave}
          onDelete={selectedBooking ? handleDelete : undefined}
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
      {showPaymentDialog && (
        <PaymentDialog
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          booking={paymentBooking}
          onConfirm={handleRecordPayment}
        />
      )}
    </Box>
  );
};

export default BookingsList;
