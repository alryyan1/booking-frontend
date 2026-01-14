import { useState, useEffect } from 'react';
import { itemsAPI, categoriesAPI, timeSlotsAPI, customersAPI } from '../services/api';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Phone, 
  Tag, 
  Clock, 
  FileText, 
  Info, 
  User, 
  Search, 
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Package
} from 'lucide-react';

const BookingForm = ({ booking, onSave, onCancel, onDelete, bookingDate, timeSlotId, categoryId }) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_id: '',
    phone_number: '',
    notes: '',
    accessories: '',
    payment_status: 'pending',
    deposit_amount: 0,
    total_amount: 0,
    remaining_balance: 0,
    category_id: categoryId || '',
    booking_date: bookingDate || '',
    return_date: '',
    time_slot_id: timeSlotId || '',
    items: [],
  });

  const [categories, setCategories] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchItem, setSearchItem] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, timeSlotsRes, itemsRes, customersRes] = await Promise.all([
          categoriesAPI.getAll(),
          timeSlotsAPI.getAll(),
          itemsAPI.getAll(),
          customersAPI.getAll(),
        ]);
        setCategories(categoriesRes.data);
        setTimeSlots(timeSlotsRes.data);
        setInventory(itemsRes.data);
        setCustomers(customersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (booking) {
      setFormData({
        invoice_number: booking.invoice_number || '',
        customer_id: booking.customer_id || '',
        phone_number: booking.customer?.phone_number || booking.phone_number || '',
        notes: booking.notes || '',
        accessories: booking.accessories || '',
        payment_status: booking.payment_status || 'pending',
        deposit_amount: parseFloat(booking.deposit_amount) || 0,
        total_amount: parseFloat(booking.total_amount) || 0,
        remaining_balance: parseFloat(booking.remaining_balance) || 0,
        category_id: booking.category_id || '',
        booking_date: booking.booking_date || bookingDate || '',
        return_date: booking.return_date || '',
        time_slot_id: booking.time_slot_id || timeSlotId || '',
        items: booking.items?.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.pivot?.price_at_booking || item.price)
        })) || [],
      });
      if (booking.customer) {
        setSearchCustomer(booking.customer.name);
      }
    }
  }, [booking, bookingDate, timeSlotId, categoryId]);

  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + item.price, 0);
    const balance = total - formData.deposit_amount;
    setFormData(prev => ({
      ...prev,
      total_amount: total,
      remaining_balance: balance
    }));
  }, [formData.items, formData.deposit_amount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'deposit_amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const selectCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customer.id,
      phone_number: customer.phone_number
    }));
    setSearchCustomer(customer.name);
    setShowCustomerDropdown(false);
  };

  const addItemToBooking = (item) => {
    if (formData.items.some(i => i.id === item.id)) return;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: item.id, name: item.name, price: parseFloat(item.price) }]
    }));
    setSearchItem('');
  };

  const removeItemFromBooking = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchItem.toLowerCase()) &&
    !formData.items.some(i => i.id === item.id)
  );

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.phone_number.includes(searchCustomer)
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${booking ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {booking ? <FileText className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {booking ? 'Modify Booking' : 'New Attire Booking'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Live Selection Mode
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={onCancel} 
            className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="booking-form" onSubmit={handleSubmit} className="p-10 space-y-12">
            
            {/* Section 1: Core Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-indigo-500 pl-4 py-1">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Client & Identity</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Tag className="w-3 h-3 text-indigo-400" /> Invoice ID
                  </label>
                  <input
                    type="text"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={handleChange}
                    required
                    placeholder="E.g. INV-2024-001"
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2 relative group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User className="w-3 h-3 text-indigo-400" /> Customer Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchCustomer}
                      onChange={(e) => {
                        setSearchCustomer(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      required
                      placeholder="Search registered clients..."
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    />
                    <Search className="w-5 h-5 absolute right-4 top-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    
                    {showCustomerDropdown && searchCustomer && (
                      <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl z-40 max-h-64 overflow-y-auto p-2 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map(customer => (
                            <div
                              key={customer.id}
                              onClick={() => selectCustomer(customer)}
                              className="px-4 py-3.5 hover:bg-indigo-50/50 rounded-xl cursor-pointer flex justify-between items-center transition-all group/item"
                            >
                              <div>
                                <div className="font-bold text-slate-900 group-hover/item:text-indigo-600 uppercase text-xs">{customer.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium tracking-wider">{customer.phone_number}</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-200 group-hover/item:text-indigo-300" />
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <AlertCircle className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                            <p className="text-slate-400 text-xs italic">No matching clients found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Phone className="w-3 h-3 text-indigo-400" /> Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    placeholder="Verify phone..."
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Logistics & Category */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-4 py-1">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Schedule & Logistics</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info className="w-3 h-3 text-emerald-400" /> Category
                  </label>
                  <div className="relative">
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                      ))}
                    </select>
                    <ChevronRight className="w-5 h-5 absolute right-4 top-4 text-slate-300 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-emerald-400" /> Booking Date
                  </label>
                  <input
                    type="date"
                    name="booking_date"
                    value={formData.booking_date}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock className="w-3 h-3 text-emerald-400" /> Pick-up Slot
                  </label>
                  <div className="relative">
                    <select
                      name="time_slot_id"
                      value={formData.time_slot_id}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="">Select Time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="w-5 h-5 absolute right-4 top-4 text-slate-300 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Return Deadline
                  </label>
                  <input
                    type="date"
                    name="return_date"
                    value={formData.return_date}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-indigo-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Item Selection */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-fuchsia-500 pl-4 py-1">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Attire Items</h3>
                <span className="px-3 py-1 bg-fuchsia-100 text-fuchsia-600 rounded-full text-[10px] font-black tracking-tighter">
                  {formData.items.length} SELECTED
                </span>
              </div>
              
              <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-8">
                <div className="max-w-xl space-y-2 relative group">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search inventory for dresses, suits, or accessories..."
                      value={searchItem}
                      onChange={(e) => setSearchItem(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-fuchsia-500/10 focus:border-fuchsia-500 transition-all font-medium shadow-sm"
                    />
                    <Search className="w-5 h-5 absolute left-4 top-4 text-slate-300 group-focus-within:text-fuchsia-500 transition-colors" />
                    
                    {searchItem && (
                      <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl z-40 max-h-64 overflow-y-auto p-2 border border-slate-100">
                        {filteredInventory.length > 0 ? (
                          filteredInventory.map(item => (
                            <div
                              key={item.id}
                              onClick={() => addItemToBooking(item)}
                              className="px-4 py-3.5 hover:bg-fuchsia-50/50 rounded-xl cursor-pointer flex justify-between items-center transition-all group/item"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg group-hover/item:bg-white transition-colors">
                                  <Package className="w-4 h-4 text-slate-400" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 uppercase text-xs">{item.name}</div>
                                  <div className="text-[10px] text-slate-400 font-medium tracking-wider">SKU: {item.sku || 'N/A'}</div>
                                </div>
                              </div>
                              <div className="text-fuchsia-600 font-black text-sm">${item.price}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-slate-400 italic text-xs">No items found matching your search</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.items.length > 0 ? formData.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-fuchsia-200 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-fuchsia-50 rounded-xl">
                          <CheckCircle2 className="w-5 h-5 text-fuchsia-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm uppercase">{item.name}</h4>
                          <p className="text-emerald-600 font-black text-xs mt-0.5">${item.price}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItemFromBooking(item.id)}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
                      <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No items added to selection</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Finance & Review */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-l-4 border-slate-400 pl-4 py-1">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Additional Notes</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                        <FileText className="w-3 h-3" /> Booking Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Internal notes, fittings, or special requests..."
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/10 focus:border-slate-400 transition-all font-medium text-sm text-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                        <Package className="w-3 h-3" /> Accessories
                      </label>
                      <textarea
                        name="accessories"
                        value={formData.accessories}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Included belts, ties, hangers, bags..."
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/10 focus:border-slate-400 transition-all font-medium text-sm text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Dashboard */}
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-10 relative overflow-hidden shadow-2xl shadow-slate-900/40">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
                
                <div className="flex justify-between items-end relative z-10">
                  <div>
                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Total Selection</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">${formData.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Payment Status</span>
                    <div className="relative inline-block group">
                      <select
                        name="payment_status"
                        value={formData.payment_status}
                        onChange={handleChange}
                        className={`pl-4 pr-10 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer transition-all ${
                          formData.payment_status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                          formData.payment_status === 'partial' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' :
                          'bg-red-500/10 border-red-500/50 text-red-400'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                      </select>
                      <ChevronRight className="w-4 h-4 absolute right-3 top-3 rotate-90 text-slate-500 group-hover:text-white pointer-events-none transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-white/5 relative z-10">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Deposit Received
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      name="deposit_amount"
                      value={formData.deposit_amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-6 py-6 bg-white/5 border border-white/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-5xl font-black text-white placeholder:text-white/10"
                    />
                    <div className="absolute right-6 top-7 text-indigo-400 font-bold uppercase tracking-widest text-[10px]">USD Cash</div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-between items-center relative z-10">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2">Final Balance</span>
                    <div className="flex items-baseline gap-2">
                      <h3 className={`text-5xl font-black ${formData.remaining_balance > 0 ? 'text-emerald-400' : 'text-emerald-600 opacity-50'}`}>
                        ${formData.remaining_balance.toFixed(2)}
                      </h3>
                      {formData.remaining_balance <= 0 && formData.total_amount > 0 && (
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-12 border-t border-slate-100">
              {booking && onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-8 py-4 bg-red-50 text-red-600 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-red-100 transition-all flex items-center gap-3 border border-transparent hover:border-red-200"
                >
                  <Trash2 className="w-5 h-5" /> Terminate Booking
                </button>
              ) : <div />}
              
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 py-4 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.items.length === 0}
                  className="px-12 py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center gap-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {booking ? 'Synchronize Record' : 'Initialize Booking'}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
