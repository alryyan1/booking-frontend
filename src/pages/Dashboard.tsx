import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI, bookingsAPI } from "../services/api";
import { formatDate, formatRelativeTime } from "../utils/dateHelpers";
import { Booking, DashboardStats } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Wallet,
  CalendarDays,
  Clock,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Calendar,
  Pencil,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { cn } from "../lib/utils";
import Marquee from "../components/magicui/marquee";
import { Dock, DockIcon } from "../components/magicui/dock";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { toast } from "sonner";
import PaymentDialog from "../components/PaymentDialog";

// Stats Card Component
const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  className?: string;
}) => (
  <Card
    className={cn(
      "overflow-hidden transition-all hover:shadow-md border-border/60 bg-card/50 backdrop-blur-sm",
      className,
    )}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </CardTitle>
      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold tracking-tight text-foreground">
        {value}
      </div>
      {subtitle && (
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600">
            <TrendingUp className="h-2.5 w-2.5" />
          </span>
          <p className="text-xs font-medium text-muted-foreground">
            {subtitle}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Action states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<number | string | null>(
    null,
  );

  const fetchRecentBookings = async () => {
    try {
      const recentRes = await dashboardAPI.getRecentBookings(6);
      setRecentBookings(recentRes.data);
    } catch (error) {
      console.error("Error refreshing bookings:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecentBookings(6),
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

  const handlePickedUp = async (booking: Booking) => {
    if (window.confirm("Mark this booking as picked up?")) {
      setActionLoading(booking.id);
      try {
        await bookingsAPI.pickedUp(booking.id, {});
        toast.success("Booking marked as picked up!");
        fetchRecentBookings();
      } catch (error) {
        console.error("Error picking up booking:", error);
        toast.error("Failed to mark as picked up.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleReturnAction = async (id: number) => {
    if (window.confirm("Mark this booking as returned?")) {
      setActionLoading(id);
      try {
        await bookingsAPI.return(id);
        toast.success("Booking marked as returned!");
        fetchRecentBookings();
      } catch (error) {
        console.error("Error returning booking:", error);
        toast.error("Failed to mark as returned.");
      } finally {
        setActionLoading(null);
      }
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
      await bookingsAPI.pay(id, data);
      toast.success("Payment recorded successfully!");
      fetchRecentBookings();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePayment = async (bookingId: number, paymentId: number) => {
    try {
      await bookingsAPI.deletePayment(bookingId, paymentId);
      toast.success("Payment deleted successfully!");
      fetchRecentBookings();
      // Refresh stats as well since revenue changed
      const statsRes = await dashboardAPI.getStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment.");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive font-medium">
          Error loading dashboard data
        </p>
      </div>
    );
  }

  const formatCurrency = (value: string | number | undefined) =>
    `OMR ${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    })}`;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 pt-6 max-w-7xl mx-auto">
      <TooltipProvider>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground/90">
              Dashboard
            </h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigate("/bookings/new")}
              className="shadow-sm"
            >
              <Calendar className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </div>
        </div>

        {recentBookings.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-semibold tracking-tight text-foreground/80">
                Live Activity
              </h3>
            </div>
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm md:shadow-lg">
              <Marquee pauseOnHover className="[--duration:25s]">
                {recentBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="mx-3 w-[320px] shrink-0 p-5 hover:border-primary/50 transition-colors duration-300"
                  >
                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold shrink-0 text-base shadow-inner">
                            {booking.customer?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate leading-tight">
                              {booking.customer?.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono mt-1 bg-muted px-1.5 py-0.5 rounded-md inline-block">
                              {booking.invoice_number}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary tracking-tight">
                            {formatCurrency(booking.total_amount)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border border-border/50">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>{" "}
                            Event
                          </span>
                          <div className="font-medium text-foreground">
                            {formatDate(booking.event_date)}
                            <span className="text-muted-foreground block text-[10px] font-normal leading-tight mt-0.5">
                              {formatRelativeTime(booking.event_date)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>{" "}
                            Pickup
                          </span>
                          <div className="font-medium text-foreground">
                            {formatDate(booking.pickup_date)}
                            <span className="text-muted-foreground block text-[10px] font-normal leading-tight mt-0.5">
                              {formatRelativeTime(booking.pickup_date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-dashed">
                        <div className="flex gap-4">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-muted-foreground font-medium block">
                              Paid
                            </span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {formatCurrency(booking.deposit_amount)}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-muted-foreground font-medium block">
                              Due
                            </span>
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              {formatCurrency(booking.remaining_balance)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {booking.items && booking.items.length > 0 && (
                        <div className="flex ">
                          {booking.items.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className=" to-blue-400 from-blue-600  font-bold text-secondary-foreground"
                              title={item.name}
                            >
                              {item.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Dock Actions */}
                    <div className="mt-2 -mb-2">
                      <Dock
                        magnification={45}
                        distance={60}
                        className="h-10 px-3 bg-white/50 border-border/20 shadow-sm w-full justify-center"
                      >
                        {/* Pick Up */}
                        <DockIcon
                          className="bg-white hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600 border border-transparent hover:border-emerald-200"
                          onClick={() =>
                            !booking.is_picked_up && handlePickedUp(booking)
                          }
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-1.5 cursor-pointer">
                                <CheckCircle2
                                  className={cn(
                                    "w-full h-full",
                                    booking.is_picked_up
                                      ? "text-emerald-600"
                                      : "",
                                  )}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Pick Up</TooltipContent>
                          </Tooltip>
                        </DockIcon>

                        {/* Return */}
                        <DockIcon
                          className="bg-white hover:bg-rose-50 text-muted-foreground hover:text-rose-600 border border-transparent hover:border-rose-200"
                          onClick={() =>
                            booking.is_picked_up &&
                            !booking.returned &&
                            handleReturnAction(booking.id)
                          }
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-1.5 cursor-pointer">
                                <RotateCcw
                                  className={cn(
                                    "w-full h-full",
                                    booking.returned ? "text-rose-600" : "",
                                  )}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Return</TooltipContent>
                          </Tooltip>
                        </DockIcon>

                        {/* Payment */}
                        {Number(booking.remaining_balance) > 0 && (
                          <DockIcon
                            className="bg-white hover:bg-amber-50 text-muted-foreground hover:text-amber-600 border border-transparent hover:border-amber-200"
                            onClick={() => handlePay(booking)}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="p-1.5 cursor-pointer">
                                  <Wallet className="w-full h-full" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Record Payment</TooltipContent>
                            </Tooltip>
                          </DockIcon>
                        )}

                        {/* Edit */}
                        <DockIcon
                          className="bg-white hover:bg-blue-50 text-muted-foreground hover:text-blue-600 border border-transparent hover:border-blue-200"
                          onClick={() => navigate("/bookings")}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-1.5 cursor-pointer">
                                <Pencil className="w-full h-full" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>View/Edit</TooltipContent>
                          </Tooltip>
                        </DockIcon>
                      </Dock>
                    </div>
                  </Card>
                ))}
              </Marquee>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent z-10"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent z-10"></div>
            </div>
          </section>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue?.total)}
            subtitle="+12% from last month"
            icon={Wallet}
          />
          <StatsCard
            title="Bookings Month"
            value={stats.bookings?.month || 0}
            subtitle={`${stats.bookings?.week || 0} this week`}
            icon={CalendarDays}
          />
          <StatsCard
            title="Pending Revenue"
            value={formatCurrency(stats.revenue?.pending)}
            subtitle={`${stats.bookings_by_status?.pending || 0} pending invoices`}
            icon={Clock}
          />
          <StatsCard
            title="Paid Revenue"
            value={formatCurrency(stats.revenue?.paid)}
            subtitle="Fully collected"
            icon={CreditCard}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-7 border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-5">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold text-foreground/90">
                  Recent Bookings
                </CardTitle>
                <CardDescription className="text-sm">
                  Latest transactions and order status updates.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex h-9 border-dashed"
                onClick={() => navigate("/bookings")}
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px] font-semibold text-xs uppercase tracking-wide px-6 py-3">
                      Invoice
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide">
                      Customer
                    </TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-xs uppercase tracking-wide">
                      Items
                    </TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-xs uppercase tracking-wide">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide">
                      Status
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wide px-6">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="h-8 w-8 text-muted-foreground/30" />
                          <p>No recent bookings found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentBookings.map((booking) => {
                      const total =
                        parseFloat(booking.total_amount as any) || 0;
                      const deposit =
                        parseFloat(booking.deposit_amount as any) || 0;
                      const balance = total - deposit;

                      let status:
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning" = "destructive";
                      let statusLabel = "Pending";
                      let statusClass =
                        "bg-destructive/10 text-destructive hover:bg-destructive/20"; // default

                      if (balance <= 0 && total > 0) {
                        status = "success";
                        statusLabel = "Paid";
                        statusClass =
                          "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-transparent";
                      } else if (deposit > 0) {
                        status = "warning";
                        statusLabel = "Partial";
                        statusClass =
                          "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-transparent";
                      } else {
                        statusClass =
                          "bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border-transparent";
                      }

                      return (
                        <TableRow
                          key={booking.id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="font-mono font-medium text-xs px-6">
                            <span className="bg-muted px-2 py-1 rounded text-muted-foreground group-hover:bg-background group-hover:text-foreground transition-colors">
                              {booking.invoice_number}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm text-foreground/90">
                                {booking.customer?.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {booking.customer?.phone_number || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px] truncate text-sm text-muted-foreground">
                            {booking.items && booking.items.length > 0 ? (
                              booking.items.map((i: any) => i.name).join(", ")
                            ) : (
                              <span className="text-muted-foreground/50 italic">
                                No items
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {formatDate(booking.event_date)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatRelativeTime(booking.event_date)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium shadow-none px-2.5 py-0.5 pointer-events-none rounded-full",
                                statusClass,
                              )}
                            >
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-sm px-6">
                            {formatCurrency(booking.total_amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        {showPaymentDialog && (
          <PaymentDialog
            open={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
            booking={paymentBooking}
            onConfirm={handleRecordPayment}
            onDeletePayment={handleDeletePayment}
          />
        )}
      </TooltipProvider>
    </div>
  );
};

export default Dashboard;
