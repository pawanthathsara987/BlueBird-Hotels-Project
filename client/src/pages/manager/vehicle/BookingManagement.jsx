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
  ShieldAlert,
  Printer
} from "lucide-react";
import FinalBillModal from "./FinalBillModal";

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
    case "returned":
      return "bg-violet-50 text-violet-700 border-violet-200 border";
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

  const currency = import.meta.env.VITE_CURRENCY_TYPE || "LKR";

  return Number.isFinite(amount) ? `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `${currency} 0.00`;
};

// Valid status transitions — must match the backend state machine
const VALID_TRANSITIONS = {
  pending_payment: ['confirmed', 'payment_failed', 'cancelled', 'expired'],
  confirmed: ['driver_assigned', 'balance_paid', 'ongoing', 'cancelled'],
  payment_failed: ['pending_payment', 'cancelled', 'expired'],
  driver_assigned: ['confirmed', 'balance_paid', 'ongoing', 'cancelled'],
  balance_paid: ['ongoing', 'cancelled'],
  ongoing: ['returned', 'cancelled'],
  returned: ['completed'],
  completed: [],
  cancelled: [],
  expired: ['pending_payment'],
};

const STATUS_LABELS = {
  pending_payment: 'Pending Payment',
  confirmed: 'Confirmed',
  payment_failed: 'Payment Failed',
  driver_assigned: 'Driver Assigned',
  balance_paid: 'Balance Paid',
  ongoing: 'Ongoing (Vehicle Hired Out)',
  returned: 'Returned (Pending Inspection)',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
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
  const [showBillModal, setShowBillModal] = useState(false);

  // Modal forms
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentReceiptNo, setPaymentReceiptNo] = useState("");
  const [paymentReceiptImage, setPaymentReceiptImage] = useState(null);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [targetStatus, setTargetStatus] = useState("");

  // Bill generation state
  const [billPreview, setBillPreview] = useState(null);
  const [manualDamageFee, setManualDamageFee] = useState("");
  const [manualFuelFee, setManualFuelFee] = useState("");
  const [billExtraNotes, setBillExtraNotes] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
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
      const isFinal = selectedBooking.status === "completed";
      const endpoint = isFinal ? "collect-final-settlement" : "collect-balance";

      const formData = new FormData();
      formData.append("paymentMethod", paymentMethod);
      if (paymentNotes) formData.append("notes", paymentNotes);
      if (paymentReceiptNo) formData.append("receiptNo", paymentReceiptNo);
      if (paymentReceiptImage) formData.append("receiptImage", paymentReceiptImage);

      await axios.put(
        `${backendBaseUrl}/manager/vehicle-bookings/${selectedBooking.id}/${endpoint}`,
        formData,
        config
      );
      toast.success(isFinal ? "Final settlement payment recorded!" : "Balance payment recorded!");
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
      const res = await axios.put(
        `${backendBaseUrl}/manager/vehicle-bookings/${selectedBooking.id}/status`,
        { status: targetStatus },
        config
      );
      toast.success(res.data.message || `Booking status updated to ${formatStatusText(targetStatus)}`);
      setShowStatusModal(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkReturned = async (booking) => {
    if (!window.confirm(`Mark booking ${booking.bookingNo} as returned? This indicates the vehicle has been physically returned and is ready for inspection.`)) return;
    try {
      const res = await axios.put(
        `${backendBaseUrl}/manager/vehicle-bookings/${booking.id}/status`,
        { status: 'returned' },
        config
      );
      toast.success(res.data.message || "Vehicle marked as returned. You can now inspect and generate the final bill.");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark as returned");
    }
  };

  const handlePrintBill = (booking) => {
    const totalExtras =
      Number(booking.finalBill?.lateFee || 0) +
      Number(booking.finalBill?.extraMileageFee || 0) +
      Number(booking.finalBill?.damageFee || 0);

    const content = `
      <html>
        <head>
          <title>Final Settlement Bill - ${booking.bookingNo}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #3b82f6; font-size: 28px; font-weight: 800; }
            .header h2 { margin: 5px 0 0; color: #64748b; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .details-grid { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .detail-group p { margin: 8px 0; font-size: 14px; }
            .detail-group strong { color: #475569; display: inline-block; width: 140px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 16px 12px; text-align: left; border-bottom: 1px solid #f1f5f9; }
            th { background-color: #f8fafc; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
            td { font-size: 15px; color: #334155; }
            .val-col { text-align: right; font-variant-numeric: tabular-nums; }
            .total-row td { font-weight: 700; font-size: 16px; color: #0f172a; border-top: 2px solid #e2e8f0; }
            .final-total td { background-color: #eff6ff; color: #1d4ed8; font-size: 20px; font-weight: 800; padding: 20px 12px; border-top: 2px solid #bfdbfe; border-bottom: 2px solid #bfdbfe; }
            .footer { text-align: center; font-size: 13px; color: #94a3b8; margin-top: 60px; }
            @media print {
              body { padding: 0; }
              .header { border-bottom: 1px solid #000; }
              .details-grid { border: none; border-bottom: 1px solid #000; border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BlueBird Hotels</h1>
            <h2>Vehicle Rental - Final Settlement</h2>
          </div>
          
          <div class="details-grid">
            <div class="detail-group">
              <p><strong>Booking Ref:</strong> <span style="font-weight: 700; color: #0f172a;">${booking.bookingNo}</span></p>
              <p><strong>Customer:</strong> ${booking.customer?.firstName} ${booking.customer?.lastName}</p>
              <p><strong>Phone:</strong> ${booking.customer?.phoneNumber || 'N/A'}</p>
            </div>
            <div class="detail-group">
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Vehicle:</strong> ${booking.vehicle?.brand} ${booking.vehicle?.model} (${booking.vehicle?.plateNumber})</p>
              <p><strong>Hire Type:</strong> ${booking.hireType.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Charge Description</th>
                <th class="val-col">Amount (${import.meta.env.VITE_CURRENCY_TYPE || "LKR"})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Base Vehicle Rate (${booking.numDays} days)</td>
                <td class="val-col">${formatMoney(booking.subtotal)}</td>
              </tr>
              <tr>
                <td>Late Return Fee</td>
                <td class="val-col">${formatMoney(booking.finalBill?.lateFee)}</td>
              </tr>
              <tr>
                <td>Extra Mileage Fee</td>
                <td class="val-col">${formatMoney(booking.finalBill?.extraMileageFee)}</td>
              </tr>
              <tr>
                <td>Damage Fee</td>
                <td class="val-col">${formatMoney(booking.finalBill?.damageFee)}</td>
              </tr>
              <tr class="total-row">
                <td>Total Extra Charges</td>
                <td class="val-col">${formatMoney(totalExtras)}</td>
              </tr>
              <tr>
                <td style="padding-top: 30px; font-weight: 600; color: #64748b;">Subtotal (Base + Extras)</td>
                <td class="val-col" style="padding-top: 30px; font-weight: 600; color: #64748b;">${formatMoney(Number(booking.subtotal) + totalExtras)}</td>
              </tr>
              <tr>
                <td>Less: Advance Deposit Paid</td>
                <td class="val-col" style="color: #10b981; font-weight: 600;">- ${formatMoney(booking.depositAmount)}</td>
              </tr>
              <tr class="final-total">
                <td>Final Balance Payable</td>
                <td class="val-col">${formatMoney(booking.balanceAmount)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Thank you for choosing BlueBird Hotels. Have a safe journey!</p>
            <p>Printed on: ${new Date().toLocaleString()}</p>
          </div>
          
          <script>
            window.onload = () => { 
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
    } else {
      toast.error("Please allow popups to print the bill");
    }
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${backendBaseUrl}/manager/vehicle-bookings/${selectedBooking.id}/generate-bill`,
        {
          manualDamageFee: manualDamageFee ? parseFloat(manualDamageFee) : 0,
          manualFuelFee: manualFuelFee ? parseFloat(manualFuelFee) : 0,
          extraNotes: billExtraNotes,
        },
        config
      );
      toast.success(res.data.message);
      setShowBillModal(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate bill");
    } finally {
      setSubmitting(false);
    }
  };

  const openBillModal = async (booking) => {
    setSelectedBooking(booking);
    setBillPreview(null);
    setManualDamageFee("");
    setManualFuelFee("");
    setBillExtraNotes("");
    setShowBillModal(true);
    setPreviewLoading(true);

    try {
      const res = await axios.get(`${backendBaseUrl}/manager/vehicle-bookings/${booking.id}/bill-preview`, config);
      setBillPreview(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to preview bill");
      setShowBillModal(false);
    } finally {
      setPreviewLoading(false);
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
    const validNext = (VALID_TRANSITIONS[booking.status] || [])
      .filter(s => s !== "confirmed" && s !== "balance_paid")
      .filter(s => !(booking.hireType === "without_driver" && s === "driver_assigned"));
    setTargetStatus(validNext.length > 0 ? validNext[0] : booking.status);
    setShowStatusModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 text-slate-900">
      {/* Premium Dashboard Header Card */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Calendar size={12} className="animate-pulse" />
              Bookings Center
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Vehicle Hire Bookings
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
            Monitor vehicle hire logs, assign drivers, record deposit/balance payments, and update lifecycle states.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto shrink-0">
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 transition-colors shadow-sm text-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto space-y-6">

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
      <Card className="bg-white border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1 space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Booking #, Customer, Plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="">All Statuses</option>
              <option value="pending_payment">Pending Deposit</option>
              <option value="confirmed">Confirmed (Paid Deposit)</option>
              <option value="driver_assigned">Driver Assigned</option>
              <option value="balance_paid">Balance Paid</option>
              <option value="ongoing">Ongoing (Active Hire)</option>
              <option value="returned">Returned (Pending Bill)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From Date</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To Date</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
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
            const totalPaidAtHotel = (booking.payments || []).reduce((sum, p) =>
              (p.type === 'balance' || p.type === 'extra') ? sum + parseFloat(p.amount) : sum
              , 0);
            const remainingBalance = parseFloat(booking.balanceAmount || 0) - totalPaidAtHotel;
            const hasRemainingBalance = remainingBalance > 0.01;
            const isWithDriver = booking.hireType === "with_driver";
            const needsDriver = isWithDriver && !booking.driverId;

            return (
              <Card key={booking.id} className="relative overflow-hidden">
                {/* Visual Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-2 h-full ${booking.status === 'completed' ? 'bg-indigo-500' :
                  booking.status === 'returned' ? 'bg-violet-500' :
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



                      {booking.status === "ongoing" && (
                        <button
                          onClick={() => handleMarkReturned(booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs rounded-xl border border-violet-200 transition"
                        >
                          <Car className="w-3.5 h-3.5" />
                          Mark as Returned
                        </button>
                      )}

                      {booking.status === "returned" && !booking.finalBill && (
                        <button
                          onClick={() => openBillModal(booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Generate Final Bill
                        </button>
                      )}

                      {booking.finalBill && (
                        <button
                          onClick={() => handlePrintBill(booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Download / Print Bill
                        </button>
                      )}

                      {!["completed", "cancelled", "expired", "returned"].includes(booking.status) && (
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
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-850 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" /> Driver Assignment
              </h3>
              <button onClick={() => setShowDriverModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition">
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
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-850 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> {selectedBooking.status === "completed" ? "Collect Final Payment" : "Collect Balance Payment"}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCollectBalance} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total to Collect</p>

                {selectedBooking.status === "completed" ? (
                  <h3 className="text-2xl font-black text-rose-600">
                    {formatMoney(
                      parseFloat(selectedBooking.balanceAmount || 0) - (selectedBooking.payments || []).reduce((sum, p) => (p.type === 'balance' || p.type === 'extra') ? sum + parseFloat(p.amount) : sum, 0)
                    )}
                  </h3>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600 border-b border-slate-200 pb-2 mb-2">
                      <span>Rental Balance</span>
                      <span>{formatMoney(selectedBooking.balanceAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600 border-b border-slate-200 pb-2 mb-2">
                      <span>Security Deposit (Refundable)</span>
                      <span>{formatMoney(200)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800">Total</span>
                      <h3 className="text-2xl font-black text-rose-600">
                        {formatMoney(parseFloat(selectedBooking.balanceAmount || 0) + 200)}
                      </h3>
                    </div>
                  </>
                )}

                <p className="text-[11px] text-slate-500 font-medium mt-2">For Booking {selectedBooking.bookingNo}</p>
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
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Payment Receipt Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentReceiptImage(e.target.files?.[0] || null)}
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
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-850 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" /> Update Booking Status
              </h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition">
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
                {(() => {
                  const validNext = (VALID_TRANSITIONS[selectedBooking.status] || [])
                    .filter(s => s !== "confirmed" && s !== "balance_paid")
                    .filter(s => !(selectedBooking.hireType === "without_driver" && s === "driver_assigned"));
                  return validNext.length === 0 ? (
                    <p className="text-sm text-slate-500 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 italic">
                      This booking is in a terminal state ({formatStatusText(selectedBooking.status)}). No further transitions are available.
                    </p>
                  ) : (
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                      required
                    >
                      {validNext.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s] || formatStatusText(s)}
                        </option>
                      ))}
                    </select>
                  );
                })()}
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

      {/* Final Bill Modal */}
      <FinalBillModal
        show={showBillModal}
        onClose={() => setShowBillModal(false)}
        selectedBooking={selectedBooking}
        billPreview={billPreview}
        previewLoading={previewLoading}
        manualDamageFee={manualDamageFee}
        setManualDamageFee={setManualDamageFee}
        manualFuelFee={manualFuelFee}
        setManualFuelFee={setManualFuelFee}
        billExtraNotes={billExtraNotes}
        setBillExtraNotes={setBillExtraNotes}
        submitting={submitting}
        handleGenerateBill={handleGenerateBill}
        formatMoney={formatMoney}
      />
      </div>
    </div>
  );
}
