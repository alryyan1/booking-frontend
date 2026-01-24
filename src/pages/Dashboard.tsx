import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../services/api";
import { formatDate } from "../utils/dateHelpers";
import { Booking, DashboardStats } from "../types";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Today,
  EventNote,
  AttachMoney,
  PendingActions,
  ArrowForward,
} from "@mui/icons-material";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecentBookings(5),
        ]);
        setStats(statsRes.data);
        setRecentBookings(recentRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Typography color="error">Error loading dashboard data</Typography>
      </Box>
    );
  }

  // Helper for safe number formatting
  const formatCurrency = (value: string | number | undefined) =>
    `$${Number(value || 0).toFixed(2)}`;

  interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  }

  const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              color="text.secondary"
              variant="subtitle2"
              fontWeight="600"
              gutterBottom
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: "text.primary" }}
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: `${color}.50`,
              color: `${color}.main`,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: `${color}.main`,
            fontWeight: 500,
            bgcolor: `${color}.50`,
            display: "inline-block",
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of your booking performance
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate("/bookings/new")}>
          New Booking
        </Button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bookings Today"
            value={stats.bookings?.today || 0}
            subtitle={`${stats.bookings?.week || 0} this week`}
            icon={<Today />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={stats.bookings?.total || 0}
            subtitle={`${stats.bookings?.month || 0} this month`}
            icon={<EventNote />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue?.total)}
            subtitle={`${formatCurrency(stats.revenue?.paid)} paid`}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Revenue"
            value={formatCurrency(stats.revenue?.pending)}
            subtitle={`${formatCurrency(stats.revenue?.partial)} partial`}
            icon={<PendingActions />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Bookings Table */}
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Bookings by Status
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "error.50",
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography fontWeight="600" color="error.dark">
                      Pending
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {stats.bookings_by_status?.pending || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "warning.50",
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography fontWeight="600" color="warning.dark">
                      Partial
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {stats.bookings_by_status?.partial || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "success.50",
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography fontWeight="600" color="success.dark">
                      Paid
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {stats.bookings_by_status?.paid || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bookings Table */}
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Recent Bookings
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/bookings")}
                  sx={{ textTransform: "none" }}
                >
                  View All
                </Button>
              </Box>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        موعد استلام
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentBookings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{ py: 3, color: "text.secondary" }}
                        >
                          No recent bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentBookings.map((booking) => (
                        <TableRow key={booking.id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {booking.invoice_number}
                          </TableCell>
                          <TableCell>
                            {booking.items && booking.items.length > 0
                              ? booking.items.map((i: any) => i.name).join(", ")
                              : "No items"}
                          </TableCell>
                          <TableCell>
                            {formatDate(booking.pickup_date)}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const total =
                                parseFloat(booking.total_amount as any) || 0;
                              const deposit =
                                parseFloat(booking.deposit_amount as any) || 0;
                              const balance = total - deposit;

                              let status = "pending";
                              let color: "error" | "success" | "warning" =
                                "error";

                              if (balance <= 0 && total > 0) {
                                status = "paid";
                                color = "success";
                              } else if (deposit > 0) {
                                status = "partial";
                                color = "warning";
                              }
                              return (
                                <Chip
                                  label={status}
                                  size="small"
                                  color={color}
                                  sx={{
                                    textTransform: "capitalize",
                                    fontWeight: 600,
                                  }}
                                />
                              );
                            })()}
                          </TableCell>
                          <TableCell
                            sx={{ fontFamily: "monospace", fontWeight: 600 }}
                          >
                            $
                            {Number(
                              booking.total_amount || booking.payment_amount,
                            ).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
