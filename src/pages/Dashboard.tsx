import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../services/api";
import { formatDate } from "../utils/dateHelpers";
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
} from "lucide-react";
import { cn } from "../lib/utils";

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
    className={cn("overflow-hidden backdrop-blur-sm bg-white/90", className)}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <TrendingUp className="h-3 w-3" />
          {subtitle}
        </p>
      )}
    </CardContent>
  </Card>
);

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
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate("/bookings/new")}>
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Latest transactions from your customers
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={() => navigate("/bookings")}
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No recent bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  recentBookings.map((booking) => {
                    const total = parseFloat(booking.total_amount as any) || 0;
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

                    if (balance <= 0 && total > 0) {
                      status = "success";
                      statusLabel = "Paid";
                    } else if (deposit > 0) {
                      status = "warning";
                      statusLabel = "Partial";
                    }

                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium font-mono">
                          {booking.invoice_number}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {booking.customer?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                          {booking.items && booking.items.length > 0
                            ? booking.items.map((i: any) => i.name).join(", ")
                            : "No items"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(booking.event_date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status}>{statusLabel}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
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
    </div>
  );
};

export default Dashboard;
