import React, { useState } from "react";
import { Compass, MapPin, X, Phone, Mail, Clock, Eye, Ticket, Calendar, Users, CreditCard, ShieldCheck, Check, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/bluebird logo.png";

export default function ToursTab({
  tours,
  setTours,
  payments,
  isEmptyState,
  filterList
}) {
  const [processingId, setProcessingId] = useState(null);
  const [modifyModal, setModifyModal] = useState({ isOpen: false, tour: null });
  const [selectedTourForDetails, setSelectedTourForDetails] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, tourId: null, isPaid: false, isProcessing: false, reason: "" });
  const navigate = useNavigate();

  const supportContact = import.meta.env.VITE_SUPPORT_CONTACT || "+94 11 234 5678";
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "concierge@bluebirdhotels.com";

  const handlePayment = (tour) => {
    if (!tour.tourId) {
      toast.error("Cannot find the tour package details.");
      return;
    }
    // Navigate to the tour details page with inquiry info
    navigate(`/booking/tour-details?tourId=${tour.tourId}`, {
      state: { inquiry: tour }
    });
  };

  const openCancelDialog = (tourId, isPaid = false) => {
    setConfirmDialog({ isOpen: true, tourId, isPaid, isProcessing: false, reason: "" });
  };

  const handleCancelConfirmed = async () => {
    const { tourId, reason } = confirmDialog;

    if (!reason.trim()) {
      toast.error("Please enter a cancellation reason.");
      return;
    }

    setConfirmDialog(prev => ({ ...prev, isProcessing: true }));
    try {
      setProcessingId(tourId);
      const token = sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");
      const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');
      
      const response = await axios.put(`${backendBaseUrl}/tour-inquiry/${tourId}/cancel`, { reason: reason.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(confirmDialog.isPaid ? "Refund requested and booking canceled." : "Inquiry canceled successfully.");
        setTours(prevTours => prevTours.map(t => t.id === tourId ? { ...t, status: "Canceled", rawStatus: "canceled" } : t));
        setSelectedTourForDetails(null);
      } else {
        toast.error("Failed to cancel inquiry.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred while canceling.");
    } finally {
      setProcessingId(null);
      setConfirmDialog({ isOpen: false, tourId: null, isPaid: false, isProcessing: false, reason: "" });
    }
  };

  // Local Empty State Renderer
  const renderEmptyState = (title, message, iconComponent, buttonText, onClickAction) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/60 backdrop-blur-md border border-blue-50/50 rounded-3xl text-center space-y-5">
      <div className="p-4 bg-cyan-50 rounded-full text-cyan-600 animate-bounce">
        {iconComponent}
      </div>
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

  const filteredTours = filterList(tours, "destination");

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Luxury Excursion Inquiries</h2>
          <p className="text-slate-500 text-xs mt-0.5">Special helicopter flightpaths, reserve sommelier wine tastings, and deep-sea yacht charters.</p>
        </div>
      </div>

      {isEmptyState || filteredTours.length === 0 ? (
        renderEmptyState(
          "No Custom Tours Planned",
          "Elevate your itinerary with off-site excursions curated specifically by our concierge department.",
          <Compass size={36} />,
          "Book Custom Excursion",
          () => navigate("/booking/tour")
        )
      ) : (
        <div className="space-y-6">
          {filteredTours.map(tour => (
            <div
              key={tour.id}
              className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-3xl p-5 md:p-6 shadow-xs hover:shadow-md transition-all duration-300 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-amber-500 tracking-wider uppercase">CURATED EXPERIENCES</span>
                  <h3 className="font-serif font-semibold text-lg text-blue-950">{tour.destination}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400" />
                    {tour.location}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                  tour.refund 
                    ? "bg-rose-5 border-rose-100 text-rose-900" 
                    : tour.rawStatus === "accepted" 
                      ? "bg-blue-5 border-blue-100 text-blue-900" 
                      : tour.rawStatus === "progress" 
                        ? "bg-emerald-5 border-emerald-100 text-emerald-900" 
                        : tour.rawStatus === "canceled"
                          ? "bg-slate-100 border-slate-200 text-slate-500"
                          : "bg-amber-5 border-amber-100 text-amber-900"
                }`}>
                  {tour.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">INQUIRY REF</span>
                  <button
                    onClick={() => setSelectedTourForDetails(tour)}
                    className="font-semibold text-blue-700 hover:text-blue-900 hover:underline outline-none cursor-pointer text-left"
                  >
                    {tour.id}
                  </button>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">REQUESTED DATE</span>
                  <span className="font-semibold text-blue-950">
                    {new Date(tour.requestedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">GROUP CONFIGURATION</span>
                  <span className="font-semibold text-blue-950">{tour.groupSize}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">ESTIMATED RATE</span>
                  <span className="font-serif font-semibold text-blue-950">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {tour.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Concierge Response Chat Bubble */}
              <div className="bg-blue-50/40 border border-blue-100/40 rounded-2xl p-4 flex gap-3">
                <img
                  src={logo}
                  alt="BlueBird Logo"
                  className="w-8 h-8 rounded-full object-contain shrink-0 bg-blue-50/50 p-1 border border-blue-100/20"
                />
                <div className="space-y-1 w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-950">BlueBird Concierge Coordinator</span>
                    <span className="text-[9px] text-slate-400">Last updated: {tour.lastUpdated}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed italic">
                    "{tour.conciergeNotes}"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2.5 pt-2">
                {tour.rawStatus === "progress" ? (
                  <button
                    onClick={() => handlePayment(tour)}
                    disabled={processingId === tour.id}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
                  >
                    {processingId === tour.id ? "Processing..." : "Pay 50% Advance"}
                  </button>
                ) : tour.rawStatus === "pending" ? (
                  <button
                    disabled
                    className="px-5 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed border border-slate-200"
                  >
                    Awaiting Manager Approval for Payment
                  </button>
                ) : null}
                 <button
                  onClick={() => setSelectedTourForDetails(tour)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition cursor-pointer flex items-center justify-center"
                  title="View Excursion Details"
                >
                  <Eye size={13} />
                </button>
                <button
                  onClick={() => setModifyModal({ isOpen: true, tour: tour })}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Modify Excursion Details
                </button>
                {["pending", "progress", "accepted"].includes(tour.rawStatus) && (
                  <button
                    onClick={() => openCancelDialog(tour.id, tour.rawStatus === "accepted")}
                    disabled={processingId === tour.id}
                    className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-semibold text-xs rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {tour.rawStatus === "accepted" ? "Request Refund & Cancel" : "Cancel Booking"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Excursion Modification Support Modal */}
      {modifyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-blue-50/50 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setModifyModal({ isOpen: false, tour: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
                <Compass size={24} />
              </div>
              <h3 className="font-serif font-semibold text-lg text-blue-950">Modify Excursion</h3>
              <p className="text-slate-500 text-xs px-2">
                To request modifications for reservation <span className="font-semibold text-blue-950">{modifyModal.tour?.id}</span>, please contact our guest support desk.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/60">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                  <Phone size={14} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">CALL CONCIERGE</span>
                  <a href={`tel:${supportContact}`} className="text-xs font-semibold text-blue-950 hover:underline">{supportContact}</a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/60">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                  <Mail size={14} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">EMAIL SUPPORT</span>
                  <a href={`mailto:${supportEmail}`} className="text-xs font-semibold text-blue-950 hover:underline">{supportEmail}</a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/60">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                  <Clock size={14} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">SERVICE HOURS</span>
                  <span className="text-xs font-semibold text-blue-950">Daily: 8:00 AM - 8:00 PM (Sri Lanka Time)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModifyModal({ isOpen: false, tour: null })}
              className="w-full py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DETAILED EXCURSION POPUP MODAL */}
      {selectedTourForDetails && (() => {
        const matchingPayment = payments?.find(p => 
          p.category === "Tour Package" && 
          (p.bookingRef === `#${selectedTourForDetails.id}` || 
           p.bookingRef === `#${selectedTourForDetails.id}-BK` || 
           p.refNo?.includes(selectedTourForDetails.id) ||
           p.bookingRef === `#${selectedTourForDetails.realId}`)
        );

        return (
          <>
            <div 
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-45 transition-opacity" 
              onClick={() => setSelectedTourForDetails(null)}
            />
            <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white z-50 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-blue-950 text-white">
                <div>
                  <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest block">Excursion Details Panel</span>
                  <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                    <Ticket size={18} className="text-amber-400" />
                    {selectedTourForDetails.id}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedTourForDetails(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex-1 space-y-6">
                
                {/* Status Banner */}
                <div className={`p-4 border rounded-2xl flex gap-3.5 items-start ${
                  selectedTourForDetails.rawStatus === "accepted" 
                    ? "bg-blue-5 border-blue-200 text-blue-900" 
                    : selectedTourForDetails.rawStatus === "progress" 
                      ? "bg-emerald-5 border-emerald-250 text-emerald-900" 
                      : selectedTourForDetails.rawStatus === "rejected" 
                        ? "bg-rose-5 border-rose-200 text-rose-900" 
                        : "bg-amber-5 border-amber-200 text-amber-900"
                } shadow-2xs`}>
                  <div className="shrink-0 mt-0.5">
                    {selectedTourForDetails.rawStatus === "accepted" && <ShieldCheck className="w-5.5 h-5.5 text-blue-650" />}
                    {selectedTourForDetails.rawStatus === "progress" && <Clock className="w-5.5 h-5.5 text-emerald-600 animate-pulse" />}
                    {selectedTourForDetails.rawStatus === "rejected" && <X size={20} className="text-rose-600" />}
                    {selectedTourForDetails.rawStatus === "pending" && <Clock className="w-5.5 h-5.5 text-amber-600 animate-pulse" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-extrabold uppercase tracking-wider text-[9px] opacity-75">Inquiry Current Status</p>
                    <p className="font-black text-sm uppercase mt-0.5 tracking-wide">{selectedTourForDetails.status}</p>
                    <p className="font-semibold mt-1 opacity-90 leading-relaxed text-[11px]">
                      {selectedTourForDetails.rawStatus === "accepted" 
                        ? "Your excursion package is fully confirmed, approved and advanced payment is successfully verified." 
                        : selectedTourForDetails.rawStatus === "progress" 
                          ? "Your inquiry has been approved by our concierge. Please proceed with the 50% advance payment to finalize booking."
                          : selectedTourForDetails.rawStatus === "rejected" 
                            ? "We regret that this tour inquiry could not be approved at this time." 
                            : "Your excursion booking is currently under review by our luxury tour coordinators."}
                    </p>
                  </div>
                </div>

                {/* Excursion Description Card */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">Curated Experience Details</span>
                  <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Excursion Name:</span>
                      <span className="font-bold text-blue-950">{selectedTourForDetails.destination}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1"><MapPin size={11} /> {selectedTourForDetails.location}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Requested Date:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1"><Calendar size={11} /> {new Date(selectedTourForDetails.requestedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Group Configuration:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1"><Users size={11} /> {selectedTourForDetails.groupSize}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                      <span className="text-slate-500 font-semibold">Total Estimated Rate:</span>
                      <span className="font-serif font-black text-sm text-blue-950">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {selectedTourForDetails.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Billing / Guest Information */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">Guest Information</span>
                  <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Full Name:</span>
                      <span className="font-semibold text-slate-800">{selectedTourForDetails.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email Address:</span>
                      <span className="font-semibold text-slate-800">{selectedTourForDetails.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone Number:</span>
                      <span className="font-semibold text-slate-800">{selectedTourForDetails.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Payment summary section */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">Payment & Refund Details</span>
                  
                  {/* Matching Payment Details */}
                  {matchingPayment ? (
                    <div className="p-4 bg-emerald-50/50 border border-emerald-150 rounded-2xl space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-emerald-800 font-bold flex items-center gap-1"><CreditCard size={12} /> Payment Reference:</span>
                        <span className="font-black text-emerald-950">{matchingPayment.refNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-800">Payment Status:</span>
                        <span className="font-bold text-emerald-800">{matchingPayment.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-800">Method / Channel:</span>
                        <span className="font-semibold text-emerald-800">{matchingPayment.method}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-emerald-200/60">
                        <span className="text-emerald-800 font-bold">Paid Amount:</span>
                        <span className="font-bold text-emerald-950">{matchingPayment.currency} {matchingPayment.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-center text-xs text-slate-500 py-4">
                      <CreditCard className="mx-auto mb-2 text-slate-450" size={18} />
                      No successful advance payment details found for this tour inquiry.
                    </div>
                  )}

                  {/* Tour Refund details */}
                  {selectedTourForDetails.refund ? (
                    <div className="p-4 bg-rose-50/50 border border-rose-150 rounded-2xl space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-rose-800 font-bold flex items-center gap-1"><Compass size={12} /> Refund Reference:</span>
                        <span className="font-black text-rose-950">{selectedTourForDetails.refund.refundRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-800">Refund Status:</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-805 border border-rose-200">
                          {selectedTourForDetails.refund.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-800">Requested Date:</span>
                        <span className="font-semibold text-rose-900">{new Date(selectedTourForDetails.refund.requestedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-805">Days Before Departure:</span>
                        <span className="font-semibold text-rose-900">{selectedTourForDetails.refund.daysBeforeTour} Day(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-805">Cancellation Eligibility:</span>
                        <span className={`font-bold ${selectedTourForDetails.refund.isEligible ? "text-emerald-700" : "text-rose-700"}`}>
                          {selectedTourForDetails.refund.isEligible ? "Eligible (Full Deposit)" : "Not Eligible"}
                        </span>
                      </div>
                      {selectedTourForDetails.refund.clientReason && (
                        <div className="p-2.5 bg-white border border-rose-100 rounded-xl mt-1 text-[11px] text-rose-900">
                          <strong>Your Reason:</strong> "{selectedTourForDetails.refund.clientReason}"
                        </div>
                      )}
                      {selectedTourForDetails.refund.managerNote && (
                        <div className="p-2.5 bg-white border border-rose-100 rounded-xl mt-1 text-[11px] text-rose-900 italic">
                          <strong>Concierge Note:</strong> "{selectedTourForDetails.refund.managerNote}"
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-rose-200/60">
                        <span className="text-rose-800 font-bold">Estimated Refund:</span>
                        <span className="font-bold text-rose-950">LKR {parseFloat(selectedTourForDetails.refund.refundAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : selectedTourForDetails.rawStatus === "canceled" && selectedTourForDetails.rejectionReason ? (
                    <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-[11px] text-slate-600 space-y-1">
                      <p className="font-bold text-slate-700">Cancellation Reason</p>
                      <p className="italic">"{selectedTourForDetails.rejectionReason}"</p>
                    </div>
                  ) : null}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
                {/* Refund & Cancel action — only for accepted (paid) tours without an existing refund */}
                {selectedTourForDetails.rawStatus === "accepted" && !selectedTourForDetails.refund && (
                  <button
                    onClick={() => openCancelDialog(selectedTourForDetails.realId, true)}
                    disabled={processingId === selectedTourForDetails.id}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <AlertTriangle size={13} />
                    {processingId === selectedTourForDetails.id ? "Processing..." : "Request Refund & Cancel Booking"}
                  </button>
                )}
                <button
                  onClick={() => setSelectedTourForDetails(null)}
                  className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
                >
                  Close Panel
                </button>
              </div>

            </div>
          </>
        );
      })()}
      {/* CONFIRM DIALOG — Custom styled, replaces window.confirm */}
      {confirmDialog.isOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[60]"
            onClick={() => !confirmDialog.isProcessing && setConfirmDialog({ isOpen: false, tourId: null, isPaid: false, isProcessing: false })}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                confirmDialog.isPaid ? "bg-rose-50" : "bg-amber-50"
              }`}>
                <AlertTriangle size={24} className={confirmDialog.isPaid ? "text-rose-500" : "text-amber-500"} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-serif text-base font-bold text-blue-950">
                  {confirmDialog.isPaid ? "Request Refund & Cancel Booking" : "Cancel Tour Inquiry"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {confirmDialog.isPaid
                    ? "Your advance payment will be evaluated for a refund based on our cancellation policy. Our concierge team will review and process your refund request within 3–5 business days."
                    : "Are you sure you want to cancel this tour inquiry? This action cannot be undone."}
                </p>
              </div>
              {confirmDialog.isPaid && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                  <strong>Cancellation Policy:</strong> Cancellations made at least 3 day before the excursion date are eligible for a full deposit refund. Last-minute cancellations may not qualify.
                </div>
              )}
              {/* Reason textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  Cancellation Reason
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={confirmDialog.reason}
                  onChange={e => setConfirmDialog(prev => ({ ...prev, reason: e.target.value }))}
                  disabled={confirmDialog.isProcessing}
                  placeholder={confirmDialog.isPaid
                    ? "e.g. Change of travel plans, medical emergency..."
                    : "e.g. Plans changed, no longer available on this date..."}
                  rows={3}
                  maxLength={300}
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-slate-400 disabled:opacity-60 transition"
                />
                <p className="text-[10px] text-slate-400 text-right">{confirmDialog.reason.length}/300</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDialog({ isOpen: false, tourId: null, isPaid: false, isProcessing: false, reason: "" })}
                  disabled={confirmDialog.isProcessing}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelConfirmed}
                  disabled={confirmDialog.isProcessing}
                  className={`flex-1 py-2.5 text-white font-semibold text-xs rounded-xl transition-all disabled:opacity-50 ${
                    confirmDialog.isPaid ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {confirmDialog.isProcessing ? "Processing..." : confirmDialog.isPaid ? "Confirm Refund & Cancel" : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
