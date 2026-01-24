import { useState } from "react";
import { reportsAPI } from "../services/api";
import { formatDate } from "../utils/dateHelpers";
import { Category, Booking } from "../types";

interface ReportSummary {
  total_bookings: number;
  total_revenue: number;
  paid_revenue: number;
  partial_revenue: number;
  pending_revenue: number;
}

interface ReportData {
  bookings: (Booking & { items?: any[] })[];
  summary: ReportSummary;
  data: any[];
}

const Reports = () => {
  const [reportType, setReportType] = useState("bookings");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!dateFrom || !dateTo) {
      alert("Please select date range");
      return;
    }

    setLoading(true);
    try {
      let response;
      const params: any = { date_from: dateFrom, date_to: dateTo };

      if (reportType === "bookings") {
        response = await reportsAPI.bookings(params);
      } else if (reportType === "revenue") {
        params.group_by = "day"; // Default or handled by select
        response = await reportsAPI.revenue(params);
      }

      if (response) {
        setReportData(response.data);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData) {
      alert("Please generate a report first");
      return;
    }

    let csvContent = "";

    if (reportType === "bookings") {
      csvContent = "Invoice Number,Items,موعد استلام,Status,Amount\n";
      reportData.bookings.forEach((booking: any) => {
        const total = parseFloat(booking.total_amount) || 0;
        const deposit = parseFloat(booking.deposit_amount) || 0;
        const balance = total - deposit;
        let status = "pending";
        if (balance <= 0 && total > 0) status = "paid";
        else if (deposit > 0) status = "partial";

        const itemNames =
          booking.items?.length > 0
            ? booking.items.map((i: any) => i.name).join(" | ")
            : "No items";
        csvContent += `${booking.invoice_number},${itemNames},${booking.pickup_date},${status},${booking.total_amount}\n`;
      });
    } else if (reportType === "revenue") {
      csvContent = "Period,Total Bookings,Total Revenue,Paid Revenue\n";
      reportData.data.forEach((item) => {
        const period =
          item.date_formatted ||
          item.week_label ||
          item.month_label ||
          item.date ||
          item.month;
        csvContent += `${period},${item.total_bookings},${item.total_revenue},${item.paid_revenue}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setReportData(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="bookings">Bookings Report</option>
                <option value="revenue">Revenue Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Report"}
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

        {reportData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Report Results
            </h2>

            {reportType === "bookings" && reportData.summary && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold">
                      {reportData.summary.total_bookings}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      $
                      {Number(reportData.summary.total_revenue || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-2xl font-bold">
                      ${Number(reportData.summary.paid_revenue || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Partial</p>
                    <p className="text-2xl font-bold">
                      $
                      {Number(reportData.summary.partial_revenue || 0).toFixed(
                        2,
                      )}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">
                      $
                      {Number(reportData.summary.pending_revenue || 0).toFixed(
                        2,
                      )}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          موعد استلام
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.bookings.map((booking: any) => {
                        const total = parseFloat(booking.total_amount) || 0;
                        const deposit = parseFloat(booking.deposit_amount) || 0;
                        const balance = total - deposit;
                        let status = "pending";
                        let colorClass = "bg-red-100 text-red-800";
                        if (balance <= 0 && total > 0) {
                          status = "paid";
                          colorClass = "bg-green-100 text-green-800";
                        } else if (deposit > 0) {
                          status = "partial";
                          colorClass = "bg-yellow-100 text-yellow-800";
                        }

                        return (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {booking.invoice_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {booking.items?.length > 0
                                ? booking.items
                                    .map((i: any) => i.name)
                                    .join(", ")
                                : "No items"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatDate(booking.pickup_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${colorClass}`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                              ${total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === "revenue" && reportData.data && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Bookings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Paid Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.data.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {item.date_formatted ||
                              item.week_label ||
                              item.month_label ||
                              item.date ||
                              item.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.total_bookings}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                            ${Number(item.total_revenue || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            ${Number(item.paid_revenue || 0).toFixed(2)}
                          </td>
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
