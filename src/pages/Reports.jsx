import { useState } from 'react';
import { reportsAPI, categoriesAPI } from '../services/api';
import { formatDate } from '../utils/dateHelpers';

const Reports = () => {
  const [reportType, setReportType] = useState('bookings');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [categories, setCategories] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleGenerateReport = async () => {
    if (!dateFrom || !dateTo) {
      alert('Please select date range');
      return;
    }

    setLoading(true);
    try {
      let response;
      const params = { date_from: dateFrom, date_to: dateTo };

      if (reportType === 'bookings') {
        if (categoryId) params.category_id = categoryId;
        response = await reportsAPI.bookings(params);
      } else if (reportType === 'category-wise') {
        response = await reportsAPI.categoryWise(params);
      } else if (reportType === 'revenue') {
        params.group_by = groupBy;
        response = await reportsAPI.revenue(params);
      }

      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData) {
      alert('Please generate a report first');
      return;
    }

    // Simple CSV export
    let csvContent = '';
    
    if (reportType === 'bookings') {
      csvContent = 'Invoice Number,Attire Name,Category,Phone,Date,Status,Amount\n';
      reportData.bookings.forEach(booking => {
        csvContent += `${booking.invoice_number},${booking.attire_name},${booking.category?.name_en || 'N/A'},${booking.phone_number},${booking.booking_date},${booking.payment_status},${booking.payment_amount}\n`;
      });
    } else if (reportType === 'category-wise') {
      csvContent = 'Category,Total Bookings,Total Revenue,Paid Revenue,Pending Revenue,Partial Revenue\n';
      reportData.categories.forEach(cat => {
        csvContent += `${cat.category_name_en},${cat.total_bookings},${cat.total_revenue},${cat.paid_revenue},${cat.pending_revenue},${cat.partial_revenue}\n`;
      });
    } else if (reportType === 'revenue') {
      csvContent = 'Period,Total Bookings,Total Revenue,Paid Revenue\n';
      reportData.data.forEach(item => {
        const period = item.date_formatted || item.week_label || item.month_label || item.date || item.month;
        csvContent += `${period},${item.total_bookings},${item.total_revenue},${item.paid_revenue}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${reportType}_${dateFrom}_to_${dateTo}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>

        {/* Report Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setReportData(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="bookings">Bookings Report</option>
                <option value="category-wise">Category-wise Report</option>
                <option value="revenue">Revenue Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {reportType === 'bookings' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_en}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reportType === 'revenue' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            {reportData && (
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Report Results</h2>

            {reportType === 'bookings' && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold">{reportData.summary.total_bookings}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${reportData.summary.total_revenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-2xl font-bold">${reportData.summary.paid_revenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Partial</p>
                    <p className="text-2xl font-bold">${reportData.summary.partial_revenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">${reportData.summary.pending_revenue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attire</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.invoice_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.attire_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.category?.name_en || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(booking.booking_date)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                              booking.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">${parseFloat(booking.payment_amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === 'category-wise' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bookings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partial</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.categories.map((cat, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{cat.category_name_en}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{cat.total_bookings}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">${cat.total_revenue.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">${cat.paid_revenue.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">${cat.pending_revenue.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">${cat.partial_revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === 'revenue' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bookings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.data.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {item.date_formatted || item.week_label || item.month_label || item.date || item.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{item.total_bookings}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">${item.total_revenue.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">${item.paid_revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

