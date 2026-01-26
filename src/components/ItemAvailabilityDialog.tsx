import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Stack,
  Divider,
  Paper,
  TextField,
} from "@mui/material";
import { Calendar, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import dayjs from "dayjs";
import { bookingsAPI } from "../services/api";

interface ItemStatus {
  id: number;
  name: string;
  category: string;
  status: "available" | "reserved" | "preparation";
}

interface ItemAvailabilityDialogProps {
  open: boolean;
  onClose: () => void;
  date: Date | null;
}

const ItemAvailabilityDialog: React.FC<ItemAvailabilityDialogProps> = ({
  open,
  onClose,
  date,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(date);
  const [items, setItems] = useState<ItemStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  useEffect(() => {
    if (open && selectedDate) {
      fetchAvailability();
    }
  }, [open, selectedDate]);

  const fetchAvailability = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
      const response = await bookingsAPI.checkAvailability(formattedDate);
      setItems(response.data.items);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group items by category
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ItemStatus[]>,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "reserved":
        return "error";
      case "preparation":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 size={14} />;
      case "reserved":
        return <XCircle size={14} />;
      case "preparation":
        return <AlertTriangle size={14} />;
      default:
        return undefined;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Calendar size={24} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Item Availability
              </Typography>
              <Typography variant="body2" color="text.secondary">
                for {dayjs(selectedDate).format("dddd, D MMMM YYYY")}
              </Typography>
            </Box>
          </Stack>
          <TextField
            type="date"
            size="small"
            value={selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : ""}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(new Date(e.target.value));
              }
            }}
            sx={{ width: 150 }}
          />
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={4}>
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <Box key={category}>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    textTransform: "uppercase",
                    fontSize: "0.8rem",
                    letterSpacing: "0.5px",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 0.5,
                    mb: 2,
                  }}
                >
                  {category}
                </Typography>
                <Grid container spacing={2}>
                  {categoryItems.map((item) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderColor:
                            item.status === "available"
                              ? "transparent"
                              : "divider",
                          bgcolor:
                            item.status === "reserved"
                              ? "error.lighter"
                              : item.status === "preparation"
                                ? "warning.lighter"
                                : "grey.50",
                        }}
                      >
                        <Typography variant="body2" fontWeight="500">
                          {item.name}
                        </Typography>
                        <Chip
                          label={item.status}
                          size="small"
                          color={getStatusColor(item.status) as any}
                          icon={getStatusIcon(item.status)}
                          variant={
                            item.status === "available" ? "outlined" : "filled"
                          }
                          sx={{
                            height: 24,
                            "& .MuiChip-label": { px: 1, fontSize: "0.7rem" },
                            textTransform: "capitalize",
                          }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemAvailabilityDialog;
