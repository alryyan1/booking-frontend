import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, bookingsAPI, dashboardAPI } from '../services/api';
import { getMonthName, getWeekDays } from '../utils/dateHelpers';
import { 
  ArrowLeft, 
  ChevronRight, 
  Plus, 
  Info, 
  Search, 
  Filter, 
  Package, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import BookingForm from '../components/BookingForm';

const DailyBookingTable = () => {
    const { monthId, categoryId, weekId } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const year = new Date().getFullYear();
    const weekDays = getWeekDays(year, parseInt(monthId), parseInt(weekId));

    useEffect(() => {
        fetchData();
    }, [categoryId, weekId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsRes, bookingsData] = await Promise.all([
                itemsAPI.getAll({ category_id: categoryId }),
                dashboardAPI.getWeekBookings({
                    category_id: categoryId,
                    start_date: weekDays[0].toISOString().split('T')[0],
                    end_date: weekDays[6].toISOString().split('T')[0]
                })
            ]);
            setItems(itemsRes.data);
            setBookings(bookingsData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBookingForDay = (itemId, date) => {
        const dateString = date.toISOString().split('T')[0];
        return bookings.find(b => 
            b.event_date === dateString && 
            b.items.some(item => item.id === itemId)
        );
    };

    const handleCellClick = (itemId, date, existingBooking = null) => {
        if (existingBooking) {
            setSelectedBooking(existingBooking);
        } else {
            setSelectedBooking(null);
            setSelectedDate(date);
        }
        setShowForm(true);
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-8">
                <div>
                   <Button variant="ghost" onClick={() => navigate(`/month/${monthId}/category/${categoryId}`)} className="mb-4 -ml-2 text-muted-foreground">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back to Weeks
                   </Button>
                   <h1 className="text-3xl font-bold tracking-tight">Deployment Matrix</h1>
                   <p className="text-muted-foreground mt-1">Inventory status for Week {weekId} of {getMonthName(monthId)}.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center px-4 py-2 bg-muted rounded-md text-xs font-medium gap-2">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {weekDays[0].toLocaleDateString()} — {weekDays[6].toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter assets by name or index..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                    />
                </div>
                <Button variant="outline" className="gap-2 shrink-0">
                    <Filter className="h-4 w-4" /> Filters
                </Button>
            </div>

            <Card className="rounded-xl shadow-none border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-[200px] border-r">Asset Identity</TableHead>
                                {weekDays.map((day, idx) => (
                                    <TableHead key={idx} className="text-center min-w-[120px]">
                                        <div className="font-bold text-slate-900">{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase">{day.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic">
                                        Synchronizing logistical data...
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                        No assets found matching the current verification parameters.
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50">
                                    <TableCell className="border-r py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-xs text-slate-900 truncate">{item.name}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">#{item.reference || item.id}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {weekDays.map((day, idx) => {
                                        const booking = getBookingForDay(item.id, day);
                                        return (
                                            <TableCell 
                                                key={idx} 
                                                className={cn(
                                                    "p-1 border-r last:border-r-0 cursor-pointer transition-colors h-20",
                                                    booking ? "bg-slate-50/50" : "hover:bg-indigo-50/30"
                                                )}
                                                onClick={() => handleCellClick(item.id, day, booking)}
                                            >
                                                {booking ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className={cn(
                                                                    "h-full w-full rounded-md p-2 flex flex-col justify-between border-l-4",
                                                                    booking.payment_status === 'paid' ? 'bg-green-50/50 border-green-500' : 
                                                                    booking.payment_status === 'partial' ? 'bg-amber-50/50 border-amber-500' : 
                                                                    'bg-red-50/50 border-red-500'
                                                                )}>
                                                                    <div className="font-bold text-[9px] truncate text-slate-900">
                                                                        {booking.customer?.name}
                                                                    </div>
                                                                    <div className="flex justify-between items-end">
                                                                        <Badge className={cn(
                                                                            "text-[8px] h-4 px-1 leading-none border-none shadow-none uppercase font-black",
                                                                            booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                                                                            booking.payment_status === 'partial' ? 'bg-amber-100 text-amber-700' : 
                                                                            'bg-red-100 text-red-700'
                                                                        )}>
                                                                            {booking.payment_status}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="p-3 max-w-[200px] rounded-xl border-none shadow-2xl">
                                                                <div className="space-y-1">
                                                                    <p className="font-bold text-xs">Inv: #{booking.invoice_number}</p>
                                                                    <p className="text-[10px] text-slate-500">{booking.phone_number}</p>
                                                                    <div className="pt-2 flex gap-2">
                                                                        <Badge variant="outline" className="text-[8px]">Total: ${booking.total_amount}</Badge>
                                                                        {booking.delivered && <Badge className="bg-green-500 text-white text-[8px] border-none">Delivered</Badge>}
                                                                    </div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <Plus className="h-4 w-4 text-indigo-400" />
                                                    </div>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <div className="flex justify-center gap-12 py-6">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Paid</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Partial</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-200" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available</span>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
                    <BookingForm
                        booking={selectedBooking}
                        selectedDate={selectedDate}
                        categoryId={categoryId}
                        onSave={() => { setShowForm(false); fetchData(); }}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default DailyBookingTable;
