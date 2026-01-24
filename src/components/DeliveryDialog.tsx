import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Truck, CheckCircle2, Wallet } from "lucide-react";
import { Booking } from "../types";
import dayjs from "dayjs";

interface DeliveryDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onConfirm: (
    id: number,
    data: { payment_received: number; payment_method: string },
  ) => Promise<void>;
}

const DeliveryDialog: React.FC<DeliveryDialogProps> = ({
  open,
  onClose,
  booking,
  onConfirm,
}) => {
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      // Default payment received to the remaining balance
      setPaymentReceived(Number(booking.remaining_balance) || 0);
      setPaymentMethod(booking.payment_method || "cash");
    }
  }, [booking, open]);

  const handleConfirm = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      await onConfirm(booking.id, {
        payment_received: paymentReceived,
        payment_method: paymentMethod,
      });
      onClose();
    } catch (error) {
      console.error("Error confirming delivery:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  const total = Number(booking.total_amount) || 0;
  const alreadyPaid = Number(booking.deposit_amount) || 0;
  const currentBalance = Number(booking.remaining_balance) || 0;
  const newBalance = Math.max(0, currentBalance - paymentReceived);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Truck color="#1976d2" size={24} />
        <Typography variant="h6" fontWeight="bold">
          Confirm Delivery
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="bold"
              gutterBottom
            >
              BOOKING SUMMARY
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}
            >
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Total Amount:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${total.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Already Paid:</Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    fontWeight="bold"
                  >
                    ${alreadyPaid.toFixed(2)}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" fontWeight="bold">
                    Current Balance:
                  </Typography>
                  <Typography
                    variant="body1"
                    color="error.main"
                    fontWeight="bold"
                  >
                    ${currentBalance.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight="700" gutterBottom>
              Record Payment (Optional)
            </Typography>
            <TextField
              label="Amount Received Now"
              type="number"
              fullWidth
              value={paymentReceived}
              onChange={(e) => setPaymentReceived(Number(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value as string)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {newBalance > 0 && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              A balance of <strong>${newBalance.toFixed(2)}</strong> will remain
              after this payment.
            </Alert>
          )}
          {newBalance === 0 && paymentReceived > 0 && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              This payment covers the full remaining balance!
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CheckCircle2 size={20} />
            )
          }
          sx={{ borderRadius: 2, px: 3 }}
        >
          Confirm & Mark Delivered
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryDialog;
