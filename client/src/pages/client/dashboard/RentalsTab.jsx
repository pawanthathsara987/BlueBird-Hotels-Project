import React, { useState } from "react";
import { Car, MapPin, X, Clock, Calendar, CreditCard, AlertTriangle, Compass, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/bluebird logo.png";

export default function RentalsTab({ vehicles, setVehicles, isEmptyState, filterList }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, vehicleId: null, isPaid: false, isProcessing: false, reason: "" });
  const [reviewPanel, setReviewPanel] = useState({ isOpen: false, rentalId: null, vehicleRating: 0, driverRating: 0, comment: "", submitting: false });
  const navigate = useNavigate();

  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const getToken = () => sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");

  const handleSubmitVehicleReview = async () => {
    if (reviewPanel.vehicleRating < 1) { toast.error("Please rate the vehicle."); return; }
    setReviewPanel(p => ({ ...p, submitting: true }));
    try {
      await axios.post(
        `${backendBaseUrl}/customers/rentals/${reviewPanel.rentalId}/review`,
        { vehicleRating: reviewPanel.vehicleRating, driverRating: reviewPanel.driverRating || undefined, comment: reviewPanel.comment },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Thank you for your review!");
      const newReview = { vehicle_rating: reviewPanel.vehicleRating, driver_rating: reviewPanel.driverRating, comment: reviewPanel.comment };
      setVehicles(prev => prev.map(v => v.realId === reviewPanel.rentalId ? { ...v, review: newReview } : v));
      if (selectedVehicle?.realId === reviewPanel.rentalId) {
        setSelectedVehicle(prev => ({ ...prev, review: newReview }));
      }
      setReviewPanel({ isOpen: false, rentalId: null, vehicleRating: 0, driverRating: 0, comment: "", submitting: false });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit review.");
      setReviewPanel(p => ({ ...p, submitting: false }));
    }
  };

  const supportContact = import.meta.env.VITE_SUPPORT_CONTACT || "+94 11 234 5678";

  const openCancelDialog = (vehicleId, isPaid = false) => {
    setConfirmDialog({ isOpen: true, vehicleId, isPaid, isProcessing: false, reason: "" });
  };

  const handleCancelConfirmed = async () => {
    const { vehicleId, reason } = confirmDialog;

    if (!reason.trim()) {
      toast.error("Please enter a cancellation reason.");
      return;
    }

    setConfirmDialog(prev => ({ ...prev, isProcessing: true }));
    try {
      const token = sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");
      const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

      const response = await axios.post(
        `${backendBaseUrl}/customers/rentals/${vehicleId}/cancel`,
        { reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(confirmDialog.isPaid ? "Refund requested and rental cancelled." : "Rental cancelled successfully.");
        setVehicles(prev => prev.map(v => v.realId === vehicleId ? { ...v, status: "Cancelled", rawStatus: "cancelled" } : v));
        setSelectedVehicle(null);
      } else {
        toast.error("Failed to cancel rental.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred while cancelling.");
    } finally {
      setConfirmDialog({ isOpen: false, vehicleId: null, isPaid: false, isProcessing: false, reason: "" });
    }
  };

  const renderEmptyState = (title, message, iconComponent, buttonText, onClickAction) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/60 backdrop-blur-md border border-blue-50/50 rounded-3xl text-center space-y-5">
      <div className="p-4 bg-cyan-50 rounded-full text-cyan-600 animate-bounce">{iconComponent}</div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-blue-950">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
      </div>
      {buttonText && (
        <button
          onClick={onClickAction}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-900 to-cyan-700 hover:from-blue-800 hover:to-cyan-600 text-white font-medium text-sm rounded-xl transition-all duration-300 shadow-md shadow-blue-900/10 hover:shadow-blue-900/20 active:scale-95"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  // Status badge colours
  const statusColor = (rawStatus) => {
    if (!rawStatus) return "bg-slate-100 border-slate-200 text-slate-500";
    switch (rawStatus) {
      case "confirmed":
      case "driver_assigned":
      case "balance_paid": return "bg-blue-50 border-blue-100 text-blue-900";
      case "ongoing":       return "bg-emerald-50 border-emerald-100 text-emerald-900";
      case "completed":     return "bg-green-50 border-green-100 text-green-900";
      case "cancelled":     return "bg-slate-100 border-slate-200 text-slate-500";
      case "returned":      return "bg-purple-50 border-purple-100 text-purple-900";
      default:              return "bg-amber-50 border-amber-100 text-amber-900";
    }
  };

  const canCancel = (rawStatus) =>
    ["pending_payment", "confirmed", "driver_assigned", "balance_paid"].includes(rawStatus);

  const filteredVehicles = filterList(vehicles, "model");

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Luxury Fleet Rentals</h2>
          <p className="text-slate-500 text-xs mt-0.5">High-end sports convertibles and premium SUVs parked at VIP airport bays.</p>
        </div>
      </div>

      {isEmptyState || filteredVehicles.length === 0 ? (
        renderEmptyState(
          "No Luxury Vehicles Booked",
          "Arrive in style. Browse our premium global fleet of sports cars and executive limousines with airport runway delivery options.",
          <Car size={36} />,
          "Browse Fleet",
          () => navigate("/booking/vehicle")
        )
      ) : (
        <div className="space-y-4">
          {filteredVehicles.map(v => (
            <div
              key={v.id}
              className="bg-white/80 backdrop-blur-md border border-blue-500 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex gap-0"
            >
              {/* Vehicle Image — full car visible */}
              <div className="w-36 md:w-48 shrink-0 bg-slate-50 flex items-center justify-center border-r border-slate-500 rounded-l-2xl">
                <img
                  src={v.image}
                  alt={v.model}
                  className="w-full h-full object-contain p-3"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                {/* Top row: title + status */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-amber-500 tracking-wider uppercase truncate">{v.bookingNo}</p>
                    <h3 className="font-serif font-semibold text-sm text-blue-950 truncate">{v.model}</h3>
                    <p className="text-[10px] text-slate-400">{v.type}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${statusColor(v.rawStatus)}`}>
                    {v.status}
                  </span>
                </div>

                {/* Pickup/Dropoff row */}
                <div className="grid grid-cols-2 gap-x-3 text-xs mb-3">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block mb-0.5">PICKUP</span>
                    <span className="font-semibold text-blue-950 flex items-center gap-1 truncate">
                      <MapPin size={9} className="text-slate-400 shrink-0" />
                      <span className="truncate">{v.pickupLocation}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(v.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block mb-0.5">DROPOFF</span>
                    <span className="font-semibold text-blue-950 flex items-center gap-1 truncate">
                      <MapPin size={9} className="text-slate-400 shrink-0" />
                      <span className="truncate">{v.dropoffLocation}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(v.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{new Date(v.startDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>

                {/* Bottom row: price + buttons */}
                <div className="flex justify-between items-center gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">TOTAL CHARGE</span>
                    <span className="text-sm font-serif font-semibold text-blue-950">
                      {import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {v.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedVehicle(v)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 font-semibold text-xs rounded-xl transition cursor-pointer"
                    >
                      Details
                    </button>

                    {canCancel(v.rawStatus) && (
                      <button
                        onClick={() => openCancelDialog(v.realId, !!v.payment)}
                        className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 font-semibold text-xs rounded-xl hover:bg-red-100 transition"
                      >
                        {v.payment ? "Refund & Cancel" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DETAILS SLIDE-OVER PANEL ───────────────────────── */}
      {(() => {
        if (!selectedVehicle) return null;
        const v = selectedVehicle;
        return (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
              onClick={() => setSelectedVehicle(null)}
            />
            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-white shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-blue-950 to-slate-800 text-white flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase">Vehicle Rental</span>
                  <h3 className="font-serif font-semibold text-base">{v.model}</h3>
                  <p className="text-[10px] text-slate-300">{v.bookingNo}</p>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Vehicle image — full photo, no cropping */}
                <div className="rounded-2xl overflow-hidden bg-slate-100 relative flex items-center justify-center" style={{ minHeight: "160px" }}>
                  <img src={v.image} alt={v.model} className="w-full max-h-52 object-contain p-2" />
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${statusColor(v.rawStatus)}`}>
                    {v.status}
                  </span>
                </div>

                {/* Booking details */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Booking Details</span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Booking Reference</span>
                    <span className="font-bold text-blue-950">{v.bookingNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hire Type</span>
                    <span className="font-semibold text-blue-950 capitalize">{(v.hireType || "").replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-semibold text-blue-950">{v.numDays} Day{v.numDays !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1"><Calendar size={10} /> Pickup</span>
                    <span className="font-semibold text-blue-950">
                      {new Date(v.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1"><Calendar size={10} /> Return</span>
                    <span className="font-semibold text-blue-950">
                      {new Date(v.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1"><MapPin size={10} /> Pickup Location</span>
                    <span className="font-semibold text-blue-950 text-right max-w-[55%]">{v.pickupLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1"><MapPin size={10} /> Dropoff Location</span>
                    <span className="font-semibold text-blue-950 text-right max-w-[55%]">{v.dropoffLocation}</span>
                  </div>
                  {v.specialRequirements && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 block mb-1">Special Requirements</span>
                      <p className="text-slate-600 italic">"{v.specialRequirements}"</p>
                    </div>
                  )}
                </div>

                {/* Pricing summary */}
                <div className="p-4 bg-blue-50/40 border border-blue-100/60 rounded-2xl space-y-2 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pricing Summary</span>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Payable</span>
                    <span className="font-bold text-blue-950">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {v.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Deposit (50%)</span>
                    <span className="font-semibold text-blue-950">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {v.depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-100 pt-2">
                    <span className="text-slate-600">Balance Due</span>
                    <span className="font-semibold text-blue-950">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {v.balanceAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment details */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Payment & Refund Details</span>
                  {v.payment ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-emerald-800">Payment Status</span>
                        <span className="font-bold text-emerald-800 capitalize">{v.payment.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-800">Method</span>
                        <span className="font-semibold text-emerald-800">{v.payment.method}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-emerald-200/60">
                        <span className="text-emerald-800 font-bold">Paid Amount</span>
                        <span className="font-bold text-emerald-950">{v.payment.currency} {v.payment.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-center text-xs text-slate-500 py-4">
                      <CreditCard className="mx-auto mb-2 text-slate-400" size={18} />
                      No successful payment recorded for this rental.
                    </div>
                  )}

                  {/* Vehicle Refund details */}
                  {v.refund ? (
                    <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-3 text-xs mt-2">
                      <div className="flex justify-between">
                        <span className="text-rose-800 font-bold flex items-center gap-1"><Car size={12} /> Refund Reference</span>
                        <span className="font-black text-rose-950">{v.refund.refundRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-800">Refund Status</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                          {v.refund.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-800">Requested Date</span>
                        <span className="font-semibold text-rose-900">
                          {new Date(v.refund.requestedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-800">Days Before Pickup</span>
                        <span className="font-semibold text-rose-900">{v.refund.daysBeforePickup} Day(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-800">Eligibility</span>
                        <span className={`font-bold ${v.refund.isEligible ? "text-emerald-700" : "text-rose-700"}`}>
                          {v.refund.isEligible ? "Eligible (Full Deposit)" : "Not Eligible"}
                        </span>
                      </div>
                      {v.refund.clientReason && (
                        <div className="p-2.5 bg-white border border-rose-100 rounded-xl text-[11px] text-rose-900">
                          <strong>Your Reason:</strong> "{v.refund.clientReason}"
                        </div>
                      )}
                      {v.refund.managerNote && (
                        <div className="p-2.5 bg-white border border-rose-100 rounded-xl text-[11px] text-rose-900 italic">
                          <strong>Concierge Note:</strong> "{v.refund.managerNote}"
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-rose-200/60">
                        <span className="text-rose-800 font-bold">Estimated Refund</span>
                        <span className="font-bold text-rose-950">
                          {import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {parseFloat(v.refund.refundAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : v.rawStatus === "cancelled" && v.cancellationReason ? (
                    <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-[11px] text-slate-600 space-y-1 mt-2">
                      <p className="font-bold text-slate-700">Cancellation Reason</p>
                      <p className="italic">"{v.cancellationReason}"</p>
                    </div>
                  ) : null}
                </div>

                {/* Support */}
                <div className="p-4 bg-blue-50/40 border border-blue-100/40 rounded-2xl flex gap-3">
                  <img src={logo} alt="BlueBird" className="w-8 h-8 rounded-full object-contain shrink-0 bg-blue-50 p-1 border border-blue-100/20" />
                  <div className="space-y-1 text-xs">
                    <p className="text-[10px] font-bold text-blue-950">BlueBird Fleet Concierge</p>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Need help with your rental? Contact our 24/7 concierge team.
                    </p>
                    <p className="text-blue-700 font-semibold">{supportContact}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
                {/* Write Review — completed rentals with no review yet */}
                {(v.rawStatus === "completed" || v.rawStatus === "returned") && !v.review && (
                  <button
                    onClick={() => setReviewPanel({ isOpen: true, rentalId: v.realId, vehicleRating: 0, driverRating: 0, comment: "", submitting: false })}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Star size={13} /> Write a Review
                  </button>
                )}
                {/* Review submitted display */}
                {v.review && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-amber-800 flex items-center gap-1">
                      <Star size={11} className="fill-amber-500 text-amber-500" /> Your Review
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-amber-900">
                        <span>Vehicle Rating:</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={10} className={i < v.review.vehicle_rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                          ))}
                        </div>
                      </div>
                      {v.review.driver_rating && (
                        <div className="flex justify-between text-[11px] text-amber-900">
                          <span>Driver Rating:</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={10} className={i < v.review.driver_rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                            ))}
                          </div>
                        </div>
                      )}
                      {v.review.comment && (
                        <p className="italic text-amber-700 text-[11px] mt-1 border-t border-amber-100 pt-1">
                          "{v.review.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* Refund & Cancel — only for paid + cancellable + no existing refund */}
                {canCancel(v.rawStatus) && v.payment && !v.refund && (
                  <button
                    onClick={() => openCancelDialog(v.realId, true)}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={13} />
                    Request Refund & Cancel Rental
                  </button>
                )}
                {canCancel(v.rawStatus) && !v.payment && (
                  <button
                    onClick={() => openCancelDialog(v.realId, false)}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
                  >
                    Cancel Rental
                  </button>
                )}
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── CONFIRM DIALOG ────────────────────────────────── */}
      {confirmDialog.isOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[60]"
            onClick={() => !confirmDialog.isProcessing && setConfirmDialog({ isOpen: false, vehicleId: null, isPaid: false, isProcessing: false, reason: "" })}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${confirmDialog.isPaid ? "bg-rose-50" : "bg-amber-50"}`}>
                <AlertTriangle size={24} className={confirmDialog.isPaid ? "text-rose-500" : "text-amber-500"} />
              </div>
              {/* Title */}
              <div className="text-center space-y-2">
                <h3 className="font-serif text-base font-bold text-blue-950">
                  {confirmDialog.isPaid ? "Request Refund & Cancel Rental" : "Cancel Rental"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {confirmDialog.isPaid
                    ? "Your deposit payment will be evaluated for a refund based on our cancellation policy. Our concierge team will process your request within 3–5 business days."
                    : "Are you sure you want to cancel this vehicle rental? This action cannot be undone."}
                </p>
              </div>
              {/* Policy note */}
              {confirmDialog.isPaid && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                  <strong>Cancellation Policy:</strong> Cancellations made at least 5 days before the pickup date are eligible for a full deposit refund. Last-minute cancellations may not qualify.
                </div>
              )}
              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  Cancellation Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={confirmDialog.reason}
                  onChange={e => setConfirmDialog(prev => ({ ...prev, reason: e.target.value }))}
                  disabled={confirmDialog.isProcessing}
                  placeholder={confirmDialog.isPaid
                    ? "e.g. Change of plans, flight cancelled..."
                    : "e.g. No longer need the vehicle on this date..."}
                  rows={3}
                  maxLength={300}
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-slate-400 disabled:opacity-60 transition"
                />
                <p className="text-[10px] text-slate-400 text-right">{confirmDialog.reason.length}/300</p>
              </div>
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDialog({ isOpen: false, vehicleId: null, isPaid: false, isProcessing: false, reason: "" })}
                  disabled={confirmDialog.isProcessing}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  Keep Rental
                </button>
                <button
                  onClick={handleCancelConfirmed}
                  disabled={confirmDialog.isProcessing}
                  className={`flex-1 py-2.5 text-white font-semibold text-xs rounded-xl transition-all disabled:opacity-50 ${
                    confirmDialog.isPaid ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {confirmDialog.isProcessing
                    ? "Processing..."
                    : confirmDialog.isPaid ? "Confirm Refund & Cancel" : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VEHICLE REVIEW DIALOG */}
      {reviewPanel.isOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[60]"
            onClick={() => !reviewPanel.submitting && setReviewPanel({ isOpen: false, rentalId: null, vehicleRating: 0, driverRating: 0, comment: "", submitting: false })}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto">
                <Star size={24} className="text-amber-500 fill-amber-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-serif text-base font-bold text-blue-950">Write a Rental Review</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Share your experience with the vehicle and service.
                </p>
              </div>

              {/* Vehicle Rating Stars */}
              <div className="space-y-2 text-center">
                <span className="text-[11px] font-bold text-slate-600 uppercase block">Vehicle Condition & Comfort *</span>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      onClick={() => setReviewPanel(prev => ({ ...prev, vehicleRating: val }))}
                      disabled={reviewPanel.submitting}
                      className="text-slate-200 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={val <= reviewPanel.vehicleRating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver Rating Stars */}
              <div className="space-y-2 text-center">
                <span className="text-[11px] font-bold text-slate-600 uppercase block">Driver Rating (Optional)</span>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      onClick={() => setReviewPanel(prev => ({ ...prev, driverRating: val }))}
                      disabled={reviewPanel.submitting}
                      className="text-slate-200 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        size={20}
                        className={val <= reviewPanel.driverRating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Review Comments</label>
                <textarea
                  value={reviewPanel.comment}
                  onChange={e => setReviewPanel(prev => ({ ...prev, comment: e.target.value }))}
                  disabled={reviewPanel.submitting}
                  placeholder="Share your thoughts about the vehicle cleanliness, drive quality..."
                  rows={3}
                  maxLength={500}
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-slate-400 disabled:opacity-60 transition"
                />
                <p className="text-[10px] text-slate-400 text-right">{reviewPanel.comment.length}/500</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setReviewPanel({ isOpen: false, rentalId: null, vehicleRating: 0, driverRating: 0, comment: "", submitting: false })}
                  disabled={reviewPanel.submitting}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitVehicleReview}
                  disabled={reviewPanel.submitting}
                  className="flex-1 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-semibold text-xs rounded-xl transition-all disabled:opacity-50"
                >
                  {reviewPanel.submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
