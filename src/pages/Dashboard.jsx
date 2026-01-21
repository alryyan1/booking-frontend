import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Package,
  Activity,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_bookings: 0,
    total_revenue: 0,
    pending_deliveries: 0,
    active_rentals: 0,
    weekly_revenue: [],
    recent_bookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.total_revenue.toLocaleString()}`,
      description: 'Overall earnings archive',
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-green-600'
    },
    {
      title: 'Active Bookings',
      value: stats.total_bookings,
      description: 'Confirmed reservations',
      icon: Calendar,
      trend: '+4.3%',
      trendUp: true,
      color: 'text-indigo-600'
    },
    {
      title: 'Pending Deployments',
      value: stats.pending_deliveries,
      description: 'Items requiring delivery',
      icon: Package,
      trend: '-2.1%',
      trendUp: false,
      color: 'text-amber-600'
    },
    {
      title: 'Active Rentals',
      value: stats.active_rentals,
      description: 'Currently with customers',
      icon: Activity,
      trend: '+8.1%',
      trendUp: true,
      color: 'text-emerald-600'
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time snapshots of system performance and logistics.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" /> Last 30 Days
           </Button>
           <Button size="sm" onClick={fetchStats}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stat.trendUp ? 'text-green-600' : 'text-red-600'}>
                  {stat.trend}
                </span>{' '}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
            <CardDescription>Visual trend of incoming financial vectors over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weekly_revenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <ChartTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#4f46e5" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system-wide booking interactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recent_bookings.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">No recent data available</div>
              ) : (
                stats.recent_bookings.map((booking, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      booking.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    )}>
                       {booking.payment_status === 'paid' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">#{booking.invoice_number} — {booking.customer?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{new Date(booking.event_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-slate-900">${booking.total_amount}</p>
                       <Badge variant="outline" className="text-[9px] uppercase tracking-tighter h-5 px-1.5">{booking.payment_status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-sm" onClick={() => window.location.href='/bookings'}>
               View All Records <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Logistics Monitor */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
           <div>
              <CardTitle>Operational Timeline</CardTitle>
              <CardDescription>Upcoming deployments requiring immediate attention.</CardDescription>
           </div>
           <Button variant="outline" size="sm">Download Log</Button>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                 <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Principal Customer</TableHead>
                    <TableHead>Event Alignment</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="text-right">Deployment Status</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {stats.recent_bookings.slice(0, 5).map((booking, i) => (
                    <TableRow key={i}>
                       <TableCell className="font-bold">#{booking.invoice_number}</TableCell>
                       <TableCell>{booking.customer?.name}</TableCell>
                       <TableCell>{new Date(booking.event_date).toLocaleDateString()}</TableCell>
                       <TableCell>
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500" />
                             <span className="text-xs">Inventory Verified</span>
                          </div>
                       </TableCell>
                       <TableCell className="text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          {booking.delivered ? 'Completed' : 'Queued'}
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
