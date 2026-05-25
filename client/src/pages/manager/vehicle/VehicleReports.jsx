import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Wrench, 
  BarChart3, 
  Download, 
  RefreshCw, 
  Car, 
  FileSpreadsheet, 
  ShieldAlert,
  ArrowUpDown
} from "lucide-react";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-200 hover:shadow-md ${className}`}>{children}</div>
);

const formatMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `LKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "LKR 0.00";
};

export default function VehicleReports() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Date filters
  const [startDate, setStartDate] = useState(() => {
    // Default to first day of current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    // Default to today
    return new Date().toISOString().split("T")[0];
  });

  const [sortField, setSortField] = useState("totalRevenue");
  const [sortAsc, setSortAsc] = useState(false);

  const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
  const config = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token]
  );

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get(`${backendBaseUrl}/manager/vehicle-reports`, { params, ...config });
      setReportData(res.data?.data || null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load reports");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [backendBaseUrl, startDate, endDate, config]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Sorting for vehicle summary
  const sortedVehicles = useMemo(() => {
    if (!reportData?.vehicleSummary) return [];
    const list = [...reportData.vehicleSummary];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle numeric comparisons
      if (typeof aVal === 'string' && !isNaN(Number(aVal))) aVal = Number(aVal);
      if (typeof bVal === 'string' && !isNaN(Number(bVal))) bVal = Number(bVal);

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [reportData, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // CSV Export functions
  const exportToCSV = (data, filename, headers) => {
    const csvRows = [];
    csvRows.push(headers.join(","));

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        const escaped = String(value ?? "").replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportUtilization = () => {
    if (!reportData?.vehicleSummary) return;
    const headers = ["plateNumber", "brand", "model", "status", "pricePerDay", "totalBookings", "totalDays", "totalRevenue"];
    exportToCSV(reportData.vehicleSummary, `vehicle_utilization_${startDate}_to_${endDate}`, headers);
    toast.success("Utilization report exported!");
  };

  const handleExportServiceCosts = () => {
    if (!reportData?.serviceSummary) return;
    const headers = ["plateNumber", "brand", "model", "totalLogs", "totalCost"];
    exportToCSV(reportData.serviceSummary, `vehicle_service_costs_${startDate}_to_${endDate}`, headers);
    toast.success("Service costs report exported!");
  };

  // Aggregated totals
  const aggregates = useMemo(() => {
    if (!reportData) return { totalRevenue: 0, totalServiceCosts: 0, netIncome: 0, bookingCount: 0 };
    
    const totalRev = reportData.bookingStats?.totalRevenue || 0;
    const totalServ = reportData.serviceSummary?.reduce((sum, v) => sum + Number(v.totalCost || 0), 0) || 0;
    const net = totalRev - totalServ;
    const count = reportData.bookingStats?.totalCount || 0;

    return {
      totalRevenue: totalRev,
      totalServiceCosts: totalServ,
      netIncome: net,
      bookingCount: count
    };
  }, [reportData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Fleet Reports & Analytics</h1>
          <p className="text-[#64748b] mt-1">Review vehicle utilization metrics, revenue streams, and service overhead costs.</p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition duration-150 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Date Range Panel */}
      <Card className="bg-[#29384d] text-white">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#1e2a3b] border border-white/20 rounded-xl text-sm outline-none text-white focus:border-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#1e2a3b] border border-white/20 rounded-xl text-sm outline-none text-white focus:border-white"
              />
            </div>
          </div>
          <button
            onClick={fetchReports}
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
          >
            Apply Filters
          </button>
        </div>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium">Aggregating report analytics...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0" />
          <div>
            <h4 className="font-bold text-lg">Error Compiling Reports</h4>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      ) : !reportData ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
          <BarChart3 className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-800 text-lg mt-4">No report data generated</h3>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Aggregated Totals Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="flex items-center justify-between border-l-4 border-l-emerald-500">
              <div>
                <p className="text-sm font-semibold text-slate-500">Gross Rental Revenue</p>
                <h3 className="text-2xl font-black mt-1 text-slate-800">{formatMoney(aggregates.totalRevenue)}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </Card>

            <Card className="flex items-center justify-between border-l-4 border-l-rose-500">
              <div>
                <p className="text-sm font-semibold text-slate-500">Service Costs</p>
                <h3 className="text-2xl font-black mt-1 text-slate-800">{formatMoney(aggregates.totalServiceCosts)}</h3>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <Wrench className="w-6 h-6" />
              </div>
            </Card>

            <Card className="flex items-center justify-between border-l-4 border-l-blue-500">
              <div>
                <p className="text-sm font-semibold text-slate-500">Net Fleet Income</p>
                <h3 className={`text-2xl font-black mt-1 ${aggregates.netIncome >= 0 ? "text-blue-800" : "text-rose-800"}`}>
                  {formatMoney(aggregates.netIncome)}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </Card>

            <Card className="flex items-center justify-between border-l-4 border-l-indigo-500">
              <div>
                <p className="text-sm font-semibold text-slate-500">Bookings Count</p>
                <h3 className="text-2xl font-black mt-1 text-slate-800">{aggregates.bookingCount} Hires</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Calendar className="w-6 h-6" />
              </div>
            </Card>
          </div>

          {/* Booking Status breakdown & Hire Type breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" /> Bookings status distribution
              </h3>
              <div className="divide-y divide-slate-100">
                {Object.keys(reportData.bookingStats?.statusCounts || {}).length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No bookings in the selected time range.</p>
                ) : (
                  Object.entries(reportData.bookingStats.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex justify-between py-2.5 text-sm font-medium">
                      <span className="text-slate-600">{status.replace('_', ' ').toUpperCase()}</span>
                      <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{count} Bookings</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Car className="w-5 h-5 text-teal-500" /> Hire Type distribution
              </h3>
              <div className="grid grid-cols-2 gap-4 h-full items-center">
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 text-center">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">With Driver</span>
                  <h2 className="text-3xl font-black text-teal-800 mt-2">{reportData.bookingStats?.typeCounts?.with_driver || 0}</h2>
                  <p className="text-xs text-slate-500 mt-1">Chauffeur guided hires</p>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-center">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Without Driver</span>
                  <h2 className="text-3xl font-black text-amber-800 mt-2">{reportData.bookingStats?.typeCounts?.without_driver || 0}</h2>
                  <p className="text-xs text-slate-500 mt-1">Self-driven hires</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Vehicle Utilization Summary Table */}
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Car className="w-5 h-5 text-indigo-500" /> Vehicle Utilization & Revenue Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Click column headers to sort. Excludes cancelled, expired, or failed bookings from days hired.</p>
              </div>
              <button
                onClick={handleExportUtilization}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3 text-xs uppercase tracking-wider">Vehicle ID</th>
                    <th className="p-3 text-xs uppercase tracking-wider">Brand / Model</th>
                    <th className="p-3 text-xs uppercase tracking-wider">Plate #</th>
                    <th className="p-3 text-xs uppercase tracking-wider cursor-pointer hover:text-indigo-600" onClick={() => handleSort("totalBookings")}>
                      <span className="flex items-center gap-1">Bookings <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 text-xs uppercase tracking-wider cursor-pointer hover:text-indigo-600" onClick={() => handleSort("totalDays")}>
                      <span className="flex items-center gap-1">Days Hired <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 text-xs uppercase tracking-wider cursor-pointer hover:text-indigo-600" onClick={() => handleSort("totalRevenue")}>
                      <span className="flex items-center gap-1">Gross Revenue <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 text-xs uppercase tracking-wider">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-400">No vehicles recorded.</td>
                    </tr>
                  ) : (
                    sortedVehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 font-medium">
                        <td className="p-3 text-slate-500 font-bold">#{v.id}</td>
                        <td className="p-3 text-slate-800">{v.brand} {v.model}</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
                            {v.plateNumber}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-bold">{v.totalBookings} Hires</td>
                        <td className="p-3 text-slate-700 font-bold">{v.totalDays} Days</td>
                        <td className="p-3 text-indigo-700 font-bold">{formatMoney(v.totalRevenue)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            v.status === "available" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            v.status === "booked" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Service Log Costs Table */}
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-rose-500" /> Fleet Maintenance & Service Costs
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Aggregated costs from vehicle service checklists and logs within the time period.</p>
              </div>
              <button
                onClick={handleExportServiceCosts}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3 text-xs uppercase tracking-wider">Vehicle ID</th>
                    <th className="p-3 text-xs uppercase tracking-wider">Brand / Model</th>
                    <th className="p-3 text-xs uppercase tracking-wider">Plate #</th>
                    <th className="p-3 text-xs uppercase tracking-wider">Services Performed</th>
                    <th className="p-3 text-xs uppercase tracking-wider">Total Maintenance Overhead</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!reportData.serviceSummary || reportData.serviceSummary.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-400">No services recorded.</td>
                    </tr>
                  ) : (
                    reportData.serviceSummary.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 font-medium">
                        <td className="p-3 text-slate-500 font-bold">#{s.id}</td>
                        <td className="p-3 text-slate-800">{s.brand} {s.model}</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
                            {s.plateNumber}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-bold">{s.totalLogs} Services</td>
                        <td className="p-3 text-rose-700 font-black">{formatMoney(s.totalCost)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
