import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Plus, X, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { customersAPI, itemsAPI, accessoriesAPI, categoriesAPI, bookingsAPI } from '../services/api';

const BookingForm = ({ booking, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchItem, setSearchItem] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  const [formData, setFormData] = useState({
    invoice_number: booking?.invoice_number || '',
    customer_id: booking?.customer_id || null,
    customer_name: booking?.customer?.name || '',
    phone_number: booking?.phone_number || '',
    event_date: booking?.event_date ? new Date(booking.event_date) : undefined,
    category_id: booking?.category_id || '',
    items: booking?.items?.map(i => ({ id: i.id, name: i.name, price: i.pivot?.price_at_booking || i.price })) || [],
    accessory_ids: booking?.rentedAccessories?.map(a => a.id) || [],
    payment_status: booking?.payment_status || 'pending',
    deposit_amount: booking?.deposit_amount || 0,
    notes: booking?.notes || '',
    accessories_notes: booking?.accessories || '',
  });

  const [customerData, setCustomerData] = useState({ name: '', phone: '', email: '', address: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (searchCustomer.length > 1) {
      handleCustomerSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchCustomer]);

  const fetchInitialData = async () => {
    try {
      const [catsRes, itemsRes, accRes] = await Promise.all([
        categoriesAPI.getAll(),
        itemsAPI.getAll(),
        accessoriesAPI.getAll()
      ]);
      setCategories(catsRes.data);
      setItems(itemsRes.data);
      setAccessories(accRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleCustomerSearch = async () => {
    try {
      const res = await customersAPI.getAll({ search: searchCustomer });
      setSearchResults(res.data);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  const selectCustomer = (customer) => {
    setFormData({ 
      ...formData, 
      customer_id: customer.id, 
      customer_name: customer.name,
      phone_number: customer.phone 
    });
    setSearchCustomer('');
    setSearchResults([]);
  };

  const handleQuickAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await customersAPI.create(customerData);
      selectCustomer(res.data);
      setShowCustomerModal(false);
      setCustomerData({ name: '', phone: '', email: '', address: '' });
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const addItem = (item) => {
    if (formData.items.some(i => i.id === item.id)) return;
    setFormData({
      ...formData,
      items: [...formData.items, { id: item.id, name: item.name, price: parseFloat(item.price) }]
    });
    setSearchItem('');
  };

  const removeItem = (id) => {
    setFormData({ ...formData, items: formData.items.filter(i => i.id !== id) });
  };

  const toggleAccessory = (id) => {
    const newAcc = formData.accessory_ids.includes(id)
      ? formData.accessory_ids.filter(accId => accId !== id)
      : [...formData.accessory_ids, id];
    setFormData({ ...formData, accessory_ids: newAcc });
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async () => {
    try {
      const submissionData = {
        ...formData,
        event_date: formData.event_date ? format(formData.event_date, 'yyyy-MM-dd') : null
      };
      if (booking) {
        await bookingsAPI.update(booking.id, submissionData);
      } else {
        await bookingsAPI.create(submissionData);
      }
      onSave();
    } catch (error) {
      if (error.response?.data?.errors) {
        alert(Object.values(error.response.data.errors).flat().join('\n'));
      } else {
        alert('An error occurred while saving the booking.');
      }
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = formData.category_id ? item.category_id === parseInt(formData.category_id) : true;
    const matchesSearch = item.name.toLowerCase().includes(searchItem.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-none overflow-hidden h-[90vh] flex flex-col bg-background">
      {/* Header */}
      <CardHeader className="bg-slate-900 text-white p-8 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">
              {booking ? 'Edit Reservation' : 'New Reservation'}
            </CardTitle>
            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
              Step {step} of 3
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex gap-2 mt-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= i ? "bg-indigo-500" : "bg-slate-800")} />
          ))}
        </div>
      </CardHeader>

      {/* Step Content */}
      <CardContent className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
        {step === 1 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Event Date */}
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">1. When is the Event?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-black text-xl py-8 px-6 rounded-2xl border-none bg-slate-50 hover:bg-slate-100 transition-all",
                      !formData.event_date && "text-muted-foreground font-medium text-base"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-6 w-6 text-indigo-500" />
                    {formData.event_date ? format(formData.event_date, "PPP") : <span>Pick an event date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.event_date}
                    onSelect={(date) => setFormData({ ...formData, event_date: date })}
                    initialFocus
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Customer Search */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">2. Who is the Customer?</Label>
                <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">
                      + Quick Add Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
                    <DialogHeader className="p-8 pb-0">
                      <DialogTitle className="text-xl font-black uppercase tracking-tight">New Customer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleQuickAddCustomer} className="p-8 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
                        <Input
                          required
                          className="rounded-2xl py-6 px-5 border-none bg-slate-50 focus-visible:ring-indigo-500/20 font-bold"
                          value={customerData.name}
                          onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</Label>
                        <Input
                          required
                          className="rounded-2xl py-6 px-5 border-none bg-slate-50 focus-visible:ring-indigo-500/20 font-bold"
                          value={customerData.phone}
                          onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        />
                      </div>
                      <Button type="submit" className="w-full py-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all">
                        Add & Select
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {formData.customer_id ? (
                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center group transition-all hover:bg-indigo-100/50">
                  <div>
                    <h4 className="font-black text-indigo-900 uppercase tracking-tight">{formData.customer_name}</h4>
                    <p className="text-xs text-indigo-500 font-bold mt-1">{formData.phone_number}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setFormData({ ...formData, customer_id: null, customer_name: '', phone_number: '' })}
                    className="text-indigo-300 hover:text-rose-600 hover:bg-transparent"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Search by name or phone..."
                    className="rounded-2xl py-8 px-6 border-none bg-slate-50 focus-visible:ring-indigo-500/20 font-medium italic text-base"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <Card className="absolute z-50 w-full mt-2 rounded-2xl shadow-2xl border-none overflow-hidden max-h-60 overflow-y-auto">
                      {searchResults.map(cust => (
                        <Button
                          key={cust.id}
                          variant="ghost"
                          onClick={() => selectCustomer(cust)}
                          className="w-full h-auto py-4 px-6 justify-between rounded-none hover:bg-slate-50 border-b border-slate-50 last:border-0"
                        >
                          <span className="font-bold text-slate-700">{cust.name}</span>
                          <span className="text-xs text-slate-400 font-medium">{cust.phone}</span>
                        </Button>
                      ))}
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 shrink-0 no-scrollbar">
              <Button
                variant={!formData.category_id ? "default" : "secondary"}
                onClick={() => setFormData({ ...formData, category_id: '' })}
                className={cn(
                  "rounded-full px-6 text-[10px] font-black uppercase tracking-widest whitespace-nowrap h-10",
                  !formData.category_id ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                )}
              >
                All Styles
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={parseInt(formData.category_id) === cat.id ? "default" : "secondary"}
                  onClick={() => setFormData({ ...formData, category_id: cat.id })}
                  className={cn(
                    "rounded-full px-6 text-[10px] font-black uppercase tracking-widest whitespace-nowrap h-10",
                    parseInt(formData.category_id) === cat.id ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  )}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1 min-h-0">
              {/* Items */}
              <div className="flex flex-col space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">3. Select Dress</Label>
                <Input
                  placeholder="Filter by name..."
                  className="rounded-xl py-5 px-4 bg-slate-50 border-none italic text-sm"
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                />
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {filteredItems.map(item => (
                    <Button
                      key={item.id}
                      variant="outline"
                      onClick={() => addItem(item)}
                      className={cn(
                        "w-full h-auto p-5 justify-between rounded-2xl border-2 transition-all group",
                        formData.items.some(i => i.id === item.id)
                          ? "bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 text-white"
                          : "bg-white border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/50"
                      )}
                    >
                      <div className="text-left">
                        <p className="font-black text-sm uppercase tracking-tight">{item.name}</p>
                        <p className={cn("text-[10px] font-bold mt-1", formData.items.some(i => i.id === item.id) ? "text-indigo-200" : "text-slate-400")}>${item.price}</p>
                      </div>
                      {formData.items.some(i => i.id === item.id) && <Check className="w-5 h-5" />}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div className="flex flex-col space-y-4 border-l border-slate-50 pl-6">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">4. Opt. Accessories</Label>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {accessories.map(acc => (
                    <Button
                      key={acc.id}
                      variant="outline"
                      onClick={() => toggleAccessory(acc.id)}
                      className={cn(
                        "w-full h-auto p-4 justify-start gap-4 rounded-xl border-2 transition-all",
                        formData.accessory_ids.includes(acc.id)
                          ? "bg-amber-50 border-amber-400/50 text-amber-900"
                          : "bg-white border-slate-50 hover:bg-slate-50/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                        formData.accessory_ids.includes(acc.id) ? "bg-amber-500 border-amber-500 text-white" : "border-slate-200"
                      )}>
                        {formData.accessory_ids.includes(acc.id) && <Check className="w-3 h-3 stroke-[4]" />}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs leading-none">{acc.name}</p>
                        {acc.description && <p className="text-[9px] font-medium text-slate-400 mt-1 truncate max-w-[140px]">{acc.description}</p>}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Manual Invoice #</Label>
                <Input
                  placeholder="e.g. 10254"
                  className="rounded-2xl py-7 px-6 bg-slate-50 border-none font-black text-xl text-amber-600 focus-visible:ring-amber-500/20"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                />
              </div>

              <Card className="rounded-[2rem] bg-slate-900 text-white border-none shadow-2xl p-8 space-y-8">
                <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span>Subtotal</span>
                  <span className="text-xl text-white font-black">${totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deposit Received (Erboun)</Label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-700">$</span>
                    <Input
                      type="number"
                      className="rounded-2xl py-8 pl-14 pr-6 bg-white/5 border-none font-black text-3xl text-white focus-visible:ring-white/10"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end pt-6">
                  <div>
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Due</Label>
                    <p className="text-4xl font-black tracking-tighter mt-1 text-indigo-400">
                      ${(totalAmount - formData.deposit_amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Payment Status</Label>
                    <Select 
                      value={formData.payment_status}
                      onValueChange={(val) => setFormData({ ...formData, payment_status: val })}
                    >
                      <SelectTrigger className="w-32 bg-slate-800 border-none rounded-xl font-black uppercase text-[10px] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl bg-slate-800 text-white">
                        <SelectItem value="pending" className="font-black uppercase text-[10px] focus:bg-slate-700 focus:text-white">Pending</SelectItem>
                        <SelectItem value="partial" className="font-black uppercase text-[10px] focus:bg-slate-700 focus:text-white">Partial</SelectItem>
                        <SelectItem value="paid" className="font-black uppercase text-[10px] focus:bg-slate-700 focus:text-white">Fully Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Accessories Notes</Label>
                <Textarea
                  placeholder="Include any modifications or specific accessory pieces..."
                  className="rounded-2xl p-6 bg-slate-50 border-none min-h-[140px] focus-visible:ring-indigo-500/10 font-medium"
                  value={formData.accessories_notes}
                  onChange={(e) => setFormData({ ...formData, accessories_notes: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">General Remarks</Label>
                <Textarea
                  placeholder="Special instructions or customer requests..."
                  className="rounded-2xl p-6 bg-slate-50 border-none min-h-[140px] focus-visible:ring-indigo-500/10 font-medium"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            className="rounded-2xl py-7 px-8 font-black uppercase tracking-widest text-xs border-slate-200 hover:bg-white transition-all active:scale-95"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        ) : <div />}

        <div className="flex gap-4">
          <Button variant="ghost" onClick={onCancel} className="rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-rose-500 px-6">
            Discard
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => {
                if (step === 1 && (!formData.event_date || !formData.customer_id)) {
                  alert('Please select date and customer');
                  return;
                }
                if (step === 2 && formData.items.length === 0) {
                  alert('Please select at least one dress');
                  return;
                }
                setStep(s => s + 1);
              }}
              className="rounded-2xl py-7 px-10 font-black uppercase tracking-widest text-xs bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="rounded-2xl py-7 px-12 font-black uppercase tracking-widest text-xs bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95"
            >
              <Save className="mr-2 h-4 w-4" /> Confirm & Post
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BookingForm;
