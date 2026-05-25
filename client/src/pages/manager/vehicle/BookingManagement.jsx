import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  Search, 
  Calendar, 
  User, 
  Car, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  SlidersHorizontal, 
  DollarSign, 
  UserCheck, 
  X,
  FileText,
  Clock,
  ShieldAlert
} from "lucide-react";

// Inline helper components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-200 hover:shadow-md ${className}`}>{children}</div>
);

const badgeClassByStatus = (status) => {
  switch ((status || "").toLowerCase()) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 border";
    case "driver_assigned":
      return "bg-teal-50 text-teal-700 border-teal-200 border";
    case "balance_paid":
      return "bg-cyan-50 text-cyan-700 border-cyan-200 border";
    case "ongoing":
      return "bg-blue-50 text-blue-700 border-blue-200 border";
    case "completed":
      return "bg-indigo-50 text-indigo-700 border-indigo-200 border";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200 border";
    case "expired":
      return "bg-slate-150 text-slate-700 border-slate-300 border";
    case "pending_payment":
      return "bg-amber-50 text-amber-700 border-amber-200 border";
    case "payment_failed":
      return "bg-rose-100 text-rose-800 border-rose-300 border";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 border";
  }
};

const formatStatusText = (status) => {
  if (!status) return "";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `LKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "LKR 0.00";
};

export default function BookingManagement() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  
  // Modals state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Modal forms
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentReceiptNo, setPaymentReceiptNo] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [targetStatus, setTargetStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
  const config = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token]
  );

  // Fetch all active drivers
  const fetchDrivers = useCallback(async () => {
    try {
      const res = await axios.get(`${backendBaseUrl}/manager/drivers?status=active`, config);
      setDrivers(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load active drivers:", err);
    }
  }, [backendBaseUrl, config]);

  // Fetch vehicle bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (startDateFilter) params.startDate = startDateFilter;
      if (endDateFilter) params.endDate = endDateFilter;

      const res = await axios.get(`${backendBaseUrl}/manager/vehicle-bookings`, { params, ...config });
      setBookings(res.data?.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [backendBaseUrl, statusFilter, startDateFilter, endDateFilter, config]);

  useEffect(() => {
    fetchBookings();
    fetchDrivers();
  }, [fetchBookings, fetchDrivers]);

  // Filter local bookings by search query
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase().trim();
    return bookings.filter((b) => {
      const customerName = `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.toLowerCase();
      const bookingNo = (b.bookingNo || "").toLowerCase();
      const plateNo = (b.vehicle?.plateNumber || "").toLowerCase();
      const modelName = `${b.vehicle?.brand || ""} ${b.vehicle?.model || ""}`.toLowerCase();
      return (
        bookingNo.includes(q) ||
        customerName.includes(q) ||
        plateNo.includes(q) ||
        modelName.includes(q)
      );
    });
  }, [bookings, searchQuery]);

  // Actions
  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      setSubmitting(true);
      const driverVal = selectedDriverId === "none" ? null : selectedDriverId;
      await axios.put(
        `${backendBaseUrl}/manager/vehicle-bookings/${selectedBooking.id}/assign-driver`,
        { driverId: driverVal },
        config
      );
      toast.success(driverVal ? "Driver assigned successfully!" : "Driver unassigned successfully.");
      setShowDriverModal(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign driver");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCollectBalance = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      setSubmitting(true);
      await axios.put(
        `${backendBaseUrl}/manager/vehicle-bookings/${selectedBooking.id}/collect-balance`,
        { 
          paymentMethod, 
          notes: paymentNotes, 
          receiptNo: paymentReceiptNo 
        },
        config
      );
      toast.success("Balance payment recorded!");
      setShowPaymentModal(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to collect payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      setSubmitting(true);
      await axios.put(
        `${backendBaseUrl}/manager/vehicle-bookings/${selectedBooking.id}/cancel`,
        { cancellationReason },
        config
      );
      toast.success("Booking cancelled successfully.");
      setShowCancelModal(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !targetStatus) return;
    try {
      setSubmitting(true);
      await axios.put(
        `${backendBaseUrl}/manager/vehicle-bookings/${selectedBooking.id}/status`,
        { status: targetStatus },
        config
      );
      toast.success(`Booking status updated to ${formatStatusText(targetStatus)}`);
      setShowStatusModal(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers to trigger modals
  const openDriverModal = (booking) => {
    setSelectedBooking(booking);
    setSelectedDriverId(booking.driverId ? String(booking.driverId) : "none");
    setShowDriverModal(true);
  };

  const openPaymentModal = (booking) => {
    setSelectedBooking(booking);
    setPaymentMethod("cash");
    setPaymentReceiptNo("");
    setPaymentNotes("");
    setShowPaymentModal(true);
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancellationReason("");
    setShowCancelModal(true);
  };

  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setTargetStatus(booking.status);
    setShowStatusModal(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Vehicle Bookings</h1>
          <p className="text-[#64748b] mt-1">Monitor vehicle hire bookings, assign drivers, record payment collections and update states.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition duration-150 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Bookings</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-800">{bookings.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Active Rentals</p>
            <h3 className="text-2xl font-bold mt-1 text-blue-800">
              {bookings.filter(b => b.status === 'ongoing').length}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Car className="w-6 h-6" />
          </div>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Unassigned Drivers</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-800">
              {bookings.filter(b => b.hireType === 'with_driver' && b.status === 'confirmed' && !b.driverId).length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Awaiting Balance</p>
            <h3 className="text-2xl font-bold mt-1 text-rose-800">
              {bookings.filter(b => !b.balancePaidAt && ['confirmed', 'driver_assigned', 'ongoing'].includes(b.status)).length}
            </h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Filter and search panel */}
      <Card className="bg-[#29384d] text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1 space-y-1">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Booking #, Customer, Plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/10 hover:bg-white/15 focus:bg-white focus:text-slate-800 border border-white/20 rounded-xl outline-none text-sm transition"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#1e2a3b] border border-white/20 rounded-xl text-sm outline-none text-white focus:border-white"
            >
              <option value="">All Statuses</option>
              <option value="pending_payment">Pending Deposit</option>
              <option value="confirmed">Confirmed (Paid Deposit)</option>
              <option value="driver_assigned">Driver Assigned</option>
              <option value="balance_paid">Balance Paid</option>
              <option value="ongoing">Ongoing (Active Hire)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider">From Date</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#1e2a3b] border border-white/20 rounded-xl text-sm outline-none text-white focus:border-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider">To Date</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#1e2a3b] border border-white/20 rounded-xl text-sm outline-none text-white focus:border-white"
            />
          </div>
        </div>
      </Card>

      {/* Main content area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium">Retrieving booking logs...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0" />
          <div>
            <h4 className="font-bold text-lg">Error Loading Bookings</h4>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
          <SlidersHorizontal className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-800 text-lg mt-4">No vehicle bookings found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search query to find your bookings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map((booking) => {
            const isWithDriver = booking.hireType === "with_driver";
            const needsDriver = isWithDriver && !booking.driverId;
            const requiresBalance = !booking.balancePaidAt && ["confirmed", "driver_assigned", "ongoing"].includes(booking.status);

            return (
              <Card key={booking.id} className="relative overflow-hidden">
                {/* Visual Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-2 h-full ${
                  booking.status === 'completed' ? 'bg-indigo-500' :
                  booking.status === 'cancelled' ? 'bg-rose-500' :
                  booking.status === 'ongoing' ? 'bg-blue-500' :
                  booking.status === 'balance_paid' ? 'bg-cyan-500' :
                  booking.status === 'driver_assigned' ? 'bg-teal-500' :
                  'bg-amber-500'
                }`} />

                <div className="pl-2 space-y-6">
                  {/* Row 1: Booking Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-extrabold text-slate-800">{booking.bookingNo}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeClassByStatus(booking.status)}`}>
                          {formatStatusText(booking.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold uppercase">
                          {booking.hireType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      {isWithDriver && ["confirmed", "driver_assigned"].includes(booking.status) && (
                        <button
                          onClick={() => openDriverModal(booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs rounded-xl border border-teal-200 transition"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {booking.driverId ? "Reassign Driver" : "Assign Driver"}
                        </button>
                      )}
                      
                      {requiresBalance && (
                        <button
                          onClick={() => openPaymentModal(booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Collect Balance
                        </button>
                      )}

                      {!["completed", "cancelled", "expired"].includes(booking.status) && (
                        <>
                          <button
                            onClick={() => openStatusModal(booking)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Update Status
                          </button>
                          
                          <button
                            onClick={() => openCancelModal(booking)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Customer, Vehicle & Date Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer info */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Customer Details
                      </h4>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 text-sm">
                          {booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : "Walk-in Guest"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{booking.customer?.email || "No email"}</p>
                        <p className="text-xs text-slate-500 font-medium">{booking.customer?.phoneNumber || "No phone"}</p>
                      </div>
                    </div>

                    {/* Vehicle info */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5" /> Vehicle Details
                      </h4>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 text-sm">
                          {booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : "Unknown Vehicle"}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded inline-block">
                          {booking.vehicle?.plateNumber || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">Capacity: {booking.vehicle?.capacity} Passengers</p>
                      </div>
                    </div>

                    {/* Dates and Schedule info */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Rental Schedule
                      </h4>
                      <div className="space-y-1 text-xs text-slate-600 font-semibold">
                        <p className="flex justify-between">
                          <span className="text-slate-400">Pickup:</span>
                          <span className="text-slate-800">{new Date(booking.pickupDatetime).toLocaleString()}</span>
                        </p>
                        <p className="flex justify-between mt-1">
                          <span className="text-slate-400">Return:</span>
                          <span className="text-slate-800">{new Date(booking.returnDatetime).toLocaleString()}</span>
                        </p>
                        <p className="flex justify-between mt-1 border-t border-slate-200 pt-1 font-bold text-indigo-600 text-sm">
                          <span>Duration:</span>
                          <span>{booking.numDays} Days</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Finance details & Driver assignment status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {/* Financial details */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" /> Payments Summary
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold">TOTAL</span>
                          <span className="text-slate-800 block text-xs truncate mt-0.5">{formatMoney(booking.totalPayable)}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-emerald-500 block font-bold flex items-center gap-0.5">
                            DEPOSIT {booking.depositPaidAt && <CheckCircle2 className="w-2.5 h-2.5" />}
                          </span>
                          <span className="text-emerald-700 block text-xs truncate mt-0.5">{formatMoney(booking.depositAmount)}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-rose-500 block font-bold flex items-center gap-0.5">
                            BALANCE {booking.balancePaidAt && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
                          </span>
                          <span className={`${booking.balancePaidAt ? 'text-slate-500 line-through' : 'text-rose-700'} block text-xs truncate mt-0.5`}>
                            {formatMoney(booking.balanceAmount)}
                          </span>
                        </div>
                      </div>
                      {booking.balancePaidAt && (
                        <p className="text-[11px] text-slate-500 font-medium italic mt-1">
                          Balance collected via {booking.balancePaymentMethod?.toUpperCase()} on {new Date(booking.balancePaidAt).toLocaleDateString()}.
                        </p>
                      )}
                    </div>

                    {/* Driver status */}
                    <div className="space-y-2 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Driver Allocation
                        </h4>
                        {!isWithDriver ? (
                          <div className="mt-2 text-xs font-medium text-slate-500">
                            Self-drive booking (no driver required).
                          </div>
                        ) : booking.driver ? (
                          <div className="mt-2 text-xs text-slate-700 font-medium">
                            <span className="font-bold text-slate-800 block text-sm">{booking.driver.fullName}</span>
                            <span className="text-slate-500">NIC: {booking.driver.nicNo} • Phone: {booking.driver.phone}</span>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100 font-bold">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            Awaiting driver assignment
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cancellation summary if cancelled */}
                  {booking.status === "cancelled" && booking.cancellationReason && (
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-xs text-rose-800">
                      <p className="font-bold uppercase tracking-wider text-[10px] text-rose-500">Cancellation Record</p>
                      <p className="mt-1 font-medium italic">"{booking.cancellationReason}"</p>
                      <p className="mt-1 text-[10px] text-rose-400">Cancelled on {new Date(booking.cancelledAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Assign Driver */}
      {showDriverModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#29384d] text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5" /> Driver Assignment
              </h3>
              <button onClick={() => setShowDriverModal(false)} className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignDriver} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Assign a professional chauffeur to booking</p>
                <h4 className="font-bold text-slate-800 mt-1">{selectedBooking.bookingNo}</h4>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Available Drivers</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  required
                >
                  <option value="none">Unassigned / No Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} (Class: {d.licenseClass || "Any"} • Exp: {d.licenseExpiry})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Assigning..." : "Apply Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Collect Balance Payment */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#29384d] text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Collect Balance Payment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCollectBalance} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Balance Due</p>
                <h3 className="text-2xl font-black text-rose-600">{formatMoney(selectedBooking.balanceAmount)}</h3>
                <p className="text-[11px] text-slate-500 font-medium">For Booking {selectedBooking.bookingNo}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  required
                >
                  <option value="cash">Cash Payment</option>
                  <option value="card">Card Payment (Terminal)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Receipt / Reference No</label>
                <input
                  type="text"
                  placeholder="e.g. REC-93821"
                  value={paymentReceiptNo}
                  onChange={(e) => setPaymentReceiptNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Notes</label>
                <textarea
                  placeholder="Additional payment references or hotel receptionist initials..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Update Status */}
      {showStatusModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#29384d] text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-400" /> Update Booking Status
              </h3>
              <button onClick={() => setShowStatusModal(false)} className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Manually force state transition for</p>
                <h4 className="font-bold text-slate-800 mt-1">{selectedBooking.bookingNo}</h4>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  required
                >
                  <option value="pending_payment">Pending Payment</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="driver_assigned">Driver Assigned</option>
                  <option value="balance_paid">Balance Paid</option>
                  <option value="ongoing">Ongoing (Vehicle Hired Out)</option>
                  <option value="completed">Completed (Vehicle Returned)</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Cancel Booking */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Cancel Vehicle Booking
              </h3>
              <button onClick={() => setShowCancelModal(false)} className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCancelBooking} className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Are you sure you want to cancel booking</p>
                <h4 className="font-bold text-slate-800">{selectedBooking.bookingNo}?</h4>
                <p className="text-xs text-rose-500 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-100 mt-2">
                  This action is irreversible. The vehicle allocation will be released back to the fleet catalog.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Reason for Cancellation</label>
                <textarea
                  placeholder="Explain why this rental booking is cancelled..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-rose-500 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
