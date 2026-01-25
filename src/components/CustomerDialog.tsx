import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { customersAPI } from "../services/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Avatar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Customer } from "@/types";

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
  customer?: Customer | null;
}

interface FormValues {
  name: string;
  phone_number: string;
  email: string;
  address: string;
}

const CustomerDialog: React.FC<CustomerDialogProps> = ({
  open,
  onClose,
  onSuccess,
  customer = null,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      phone_number: "",
      email: "",
      address: "",
    },
  });

  // Reset form when customer prop changes or dialog opens
  useEffect(() => {
    if (open) {
      if (customer) {
        reset({
          name: customer.name || "",
          phone_number: customer.phone_number || "",
          email: customer.email || "",
          address: customer.address || "",
        });
      } else {
        reset({
          name: "",
          phone_number: "",
          email: "",
          address: "",
        });
      }
      setServerError(null);
    }
  }, [customer, open, reset]);

  // Optimized Submit Handler
  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      let response;
      if (customer?.id) {
        response = await customersAPI.update(customer.id, data);
        toast.success(`Customer "${data.name}" updated successfully!`);
      } else {
        response = await customersAPI.create(data);
        toast.success(`Customer "${data.name}" added successfully!`);
      }

      onSuccess(response.data.data || response.data);
      handleClose();
    } catch (err: any) {
      console.log(err, "err");
      const errorMsg = err.response?.data?.message || "Failed to save customer";
      setServerError(errorMsg);
      // toast.error(errorMsg); // Handled by global interceptor
    }
  };

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 2.5,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: customer ? "info.light" : "primary.light",
                color: customer ? "info.main" : "primary.main",
                width: 44,
                height: 44,
              }}
            >
              {customer ? <EditIcon /> : <PersonAddIcon />}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                fontWeight="800"
                sx={{ lineHeight: 1.2 }}
              >
                {customer ? "Edit Profile" : "Quick Add Customer"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="500"
              >
                {customer
                  ? "Update customer information"
                  : "Fill in the details below"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={customer?.id || "new"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3.5,
                  mt: 1,
                }}
              >
                {serverError && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {serverError}
                  </Alert>
                )}

                <TextField
                  label="Full Name"
                  fullWidth
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon
                          color={errors.name ? "error" : "action"}
                          fontSize="small"
                        />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2.5 },
                  }}
                />

                <TextField
                  label="Phone Number"
                  fullWidth
                  {...register("phone_number", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[\d+\-\s()]{8,20}$/,
                      message: "Enter a valid phone number",
                    },
                  })}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon
                          color={errors.phone_number ? "error" : "action"}
                          fontSize="small"
                        />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2.5 },
                  }}
                />

                <TextField
                  label="Email (Optional)"
                  fullWidth
                  {...register("email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon
                          color={errors.email ? "error" : "action"}
                          fontSize="small"
                        />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2.5 },
                  }}
                />

                <TextField
                  label="Address (Optional)"
                  fullWidth
                  multiline
                  rows={3}
                  {...register("address", {
                    maxLength: { value: 200, message: "Address is too long" },
                  })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 1.5 }}
                      >
                        <HomeIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2.5 },
                  }}
                />
              </Box>
            </motion.div>
          </AnimatePresence>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleClose}
            color="inherit"
            sx={{ borderRadius: 2.5, px: 3, fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? null : <SaveIcon />}
            sx={{
              borderRadius: 2.5,
              px: 5,
              py: 1.2,
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              "&:hover": { boxShadow: "0 6px 16px rgba(0,0,0,0.15)" },
            }}
          >
            {isSubmitting
              ? "Saving..."
              : customer
                ? "Update Profile"
                : "Save Customer"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerDialog;
