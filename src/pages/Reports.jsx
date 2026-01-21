import { useState } from 'react';
import { reportsAPI } from '../services/api';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Search, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Filter,
  ArrowRightLeft,
  DollarSign,
  PieChart,
  LayoutGrid
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const Reports = () => {
  const [reportType, setReportType] = useState('bookings');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  // Advanced Filters
  const [filters, setFilters] = useState({
    category_id: 'all',
    status: 'all',
    groupBy: 'day'
  });

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const params = {
        type: reportType,
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        ...filters
      };
      const response = await reportsAPI.generate(params);
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!reportData) return;
    setLoading(true);
    try {
       // Implementation for CSV export
       console.log("Exporting to CSV...");
    } catch (err) {
       console.error(err);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intelligence & Reports</h1>
          <p className="text-muted-foreground mt-1">Sytem-wide data analysis and operational auditing.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExport} 
          disabled={!reportData || loading}
          className="gap-2"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Configuration Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Report Parameters</CardTitle>
            <CardDescription>Define the data extraction scope.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Report Vector</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bookings">Reservations Analysis</SelectItem>
                  <SelectItem value="revenue">Financial Performance</SelectItem>
                  <SelectItem value="items">Asset Utilization</SelectItem>
                  <SelectItem value="categories">Sector Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
               <Label>Temporal Span</Label>
               <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-10 px-3">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP") : "Start"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateRange.from} onSelect={(d) => setDateRange({...dateRange, from: d})} />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-10 px-3">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP") : "End"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateRange.to} onSelect={(d) => setDateRange({...dateRange, to: d})} />
                    </PopoverContent>
                  </Popover>
               </div>
            </div>

            <div className="space-y-2">
              <Label>Status Filtering</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Every Clearance</SelectItem>
                  <SelectItem value="paid">Paid Only</SelectItem>
                  <SelectItem value="pending">Pending Strategy</SelectItem>
                  <SelectItem value="cancelled">Redacted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full h-12 mt-4" onClick={handleGenerateReport} disabled={loading}>
              {loading ? "Processing..." : "Synthesize Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-8">
          {!reportData && !loading && (
             <Card className="flex flex-col items-center justify-center p-20 border-dashed bg-muted/20 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
                   <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Archive Standby</h3>
                <p className="text-muted-foreground max-w-xs mt-2">Adjust parameters and execute synthesis to view operational intelligence.</p>
             </Card>
          )}

          {loading && (
             <div className="space-y-6 animate-pulse">
                {[1,2,3].map(i => (
                   <div key={i} className="h-32 bg-muted rounded-2xl w-full" />
                ))}
             </div>
          )}

          {reportData && (
             <>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatMini 
                    label="Total Volume" 
                    value={reportData.summary.total_count} 
                    icon={FileText} 
                    sub="Items processed"
                  />
                  <StatMini 
                    label="Aggregated Valuation" 
                    value={`$${reportData.summary.total_revenue?.toLocaleString() || 0}`} 
                    icon={DollarSign} 
                    sub="Global financial sum"
                    primary
                  />
                  <StatMini 
                    label="Mean Projection" 
                    value={`$${(reportData.summary.total_revenue / (reportData.summary.total_count || 1)).toFixed(0)}`}
                    icon={PieChart} 
                    sub="Average unit value"
                  />
               </div>

               <Card>
                 <CardHeader>
                    <CardTitle>Synthesized Ledger</CardTitle>
                    <CardDescription>Filtered records from {format(dateRange.from, 'MMM d')} to {format(dateRange.to, 'MMM d, yyyy')}</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Archive Ref</TableHead>
                          <TableHead>Alignment Date</TableHead>
                          <TableHead>Principal Entrant</TableHead>
                          <TableHead>Valuation</TableHead>
                          <TableHead className="text-right">Clearance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.data.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-bold">#{item.invoice_number || item.id}</TableCell>
                            <TableCell>{item.event_date || item.created_at}</TableCell>
                            <TableCell>{item.customer_name || 'Generic Entry'}</TableCell>
                            <TableCell className="font-bold">${item.total_amount || item.amount}</TableCell>
                            <TableCell className="text-right">
                               <Badge variant="outline" className="capitalize">{item.payment_status || item.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 </CardContent>
               </Card>
             </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatMini = ({ label, value, icon: Icon, sub, primary }) => (
  <Card className={cn(
    "relative overflow-hidden",
    primary && "border-indigo-100 bg-indigo-50/20"
  )}>
    <CardContent className="p-6">
       <div className="flex justify-between items-start">
          <div className="space-y-1">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
             <h4 className="text-2xl font-black text-slate-900">{value}</h4>
             <p className="text-[10px] text-muted-foreground italic">{sub}</p>
          </div>
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center",
            primary ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-muted text-muted-foreground"
          )}>
             <Icon className="h-5 w-5" />
          </div>
       </div>
    </CardContent>
  </Card>
);

export default Reports;
