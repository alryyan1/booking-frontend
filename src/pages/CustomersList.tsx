import { useState, useEffect } from "react";
import { customersAPI } from "../services/api";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  Search,
  Plus,
} from "lucide-react";
import CustomerDialog from "../components/CustomerDialog";
import { Customer } from "../types";

const CustomersList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customersAPI.getAll({ search: searchQuery });
      setCustomers(res.data.data || res.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (customer = null) => {
    setSelectedCustomer(customer);
    setShowDialog(true);
  };

  const handleSaveSuccess = () => {
    fetchCustomers();
  };

  const handleDelete = async (id: number | string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await customersAPI.delete(id);
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Customers
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your customer database and profiles
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>Add New Customer</span>
        </button>
      </div>

      <div className="mb-6 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-indigo-500" />
        <input
          type="text"
          placeholder="Search by name or phone number..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-50 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-50 rounded w-full"></div>
                  <div className="h-3 bg-slate-50 rounded w-full"></div>
                </div>
              </div>
            ))
        ) : customers.length > 0 ? (
          customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center mt-0.5">
                      <Phone className="w-3 h-3 mr-1" />
                      {customer.phone_number}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenDialog(customer)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {customer.email && (
                  <div className="text-sm text-slate-600 flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" />
                    {customer.email}
                  </div>
                )}
                {customer.address && (
                  <div className="text-sm text-slate-600 flex items-start">
                    <MapPin className="w-4 h-4 mr-3 text-slate-400 mt-0.5 shrink-0" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>

              {customer.notes && (
                <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400 italic">
                  {customer.notes}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No customers found
            </h3>
            <p className="text-slate-500">
              Try adjusting your search or add a new customer.
            </p>
          </div>
        )}
      </div>

      <CustomerDialog
        open={showDialog}
        customer={selectedCustomer}
        onClose={() => setShowDialog(false)}
        onSave={handleSaveSuccess}
      />
    </div>
  );
};

export default CustomersList;
