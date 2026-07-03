import React, { useState, useMemo, useEffect } from "react";
import { 
  Calendar, MapPin, Check, BedDouble, Users, AlertCircle, Info, Search, Filter, 
  FileText, Receipt, XCircle, ArrowRight, HelpCircle, User, CreditCard, Clock, 
  ChevronRight, RefreshCw, Eye, ShieldCheck, Mail, Phone, Home, Ticket
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import bluebirdLogo from "../../../assets/bluebird logo.png";

export default function BookingsTab({
  bookings,
  setBookings,
  isEmptyState,
  handleInitiateCancel,
  filterList,
  profile
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all", "upcoming", "completed", "cancelled"
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [roomToCancel, setRoomToCancel] = useState(null);
  const [showPickupCancelDialog, setShowPickupCancelDialog] = useState(false);

  // Refund Module States
  const [refundEligibility, setRefundEligibility] = useState(null);
  const [selectedRefundRooms, setSelectedRefundRooms] = useState([]);
  const [selectedRefundPickup, setSelectedRefundPickup] = useState(false);
  const [refundCalculation, setRefundCalculation] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundPaymentMethod, setRefundPaymentMethod] = useState("Cash");
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [showAirportPickupInRefundModal, setShowAirportPickupInRefundModal] = useState(false);
  const [refundHistory, setRefundHistory] = useState([]);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [isPickupCancelModalOpen, setIsPickupCancelModalOpen] = useState(false);
  const [isSubmittingPickupCancel, setIsSubmittingPickupCancel] = useState(false);

  const selectedPickupPrice = selectedBooking?.raw?.airportPickup?.price > 0 
    ? parseFloat(selectedBooking.raw.airportPickup.price) 
    : (selectedBooking?.airportPickupFee || 15000);

  useEffect(() => {
    if (selectedBooking) {
      fetchRefundHistory(selectedBooking.realId);
    } else {
      setRefundHistory([]);
    }
  }, [selectedBooking]);

  const fetchRefundHistory = async (bookingId) => {
    try {
      const token = localStorage.getItem("customerToken");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api"}/roombook/refunds/history/${bookingId}`,
        { headers }
      );
      if (response.data.success) {
        setRefundHistory(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching refund history:", error);
    }
  };

  const handleRequestRefundClick = async (preSelectedRoomId = null, preSelectedPickup = false, selectAll = false, targetBooking = null) => {
    // Ensure we filter out click synthetic events passed as parameters
    const actualRoomId = (preSelectedRoomId && typeof preSelectedRoomId === "number") ? preSelectedRoomId : null;
    const actualPickup = typeof preSelectedPickup === "boolean" ? preSelectedPickup : false;
    const shouldSelectAll = typeof selectAll === "boolean" ? selectAll : false;
    const activeBooking = targetBooking || selectedBooking;

    if (!activeBooking) return;

    try {
      const token = localStorage.getItem("customerToken");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api"}/roombook/refunds/eligibility/${activeBooking.realId}`,
        { headers }
      );
      if (response.data.success) {
        setRefundEligibility(response.data);
        setShowAirportPickupInRefundModal(actualPickup || shouldSelectAll);
        
        let roomsInit = actualRoomId ? [actualRoomId] : [];
        let pickupInit = actualPickup;

        if (shouldSelectAll) {
          roomsInit = (response.data.eligibleRooms || []).map(r => r.id);
          pickupInit = !!response.data.eligibleAirportPickup;
        }

        setSelectedRefundRooms(roomsInit);
        setSelectedRefundPickup(pickupInit);
        setRefundReason("");
        setRefundPaymentMethod("Cash");
        setIsRefundModalOpen(true);

        if (roomsInit.length > 0 || pickupInit) {
          try {
            const calcResponse = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api"}/roombook/refunds/calculate`,
              {
                bookingId: activeBooking.realId,
                rooms: roomsInit,
                airportPickup: pickupInit
              },
              { headers }
            );
            if (calcResponse.data.success) {
              setRefundCalculation(calcResponse.data);
            }
          } catch (calcErr) {
            console.error("Error calculating pre-selected refund:", calcErr);
          }
        } else {
          setRefundCalculation(null);
        }
      } else {
        toast.error(response.data.message || "Failed to load refund eligibility.");
      }
    } catch (error) {
      console.error("Error checking refund eligibility:", error);
      toast.error(error.response?.data?.message || "This stays booking is not eligible for refunds.");
    }
  };

  const handleRefundSelectionChange = async (roomId, isRoom, isChecked) => {
    let updatedRooms = [...selectedRefundRooms];
    let updatedPickup = selectedRefundPickup;

    if (isRoom) {
      if (isChecked) {
        updatedRooms.push(roomId);
      } else {
        updatedRooms = updatedRooms.filter(id => id !== roomId);
      }
      
      // Auto-check airport pickup if all eligible rooms are selected
      if (refundEligibility?.eligibleRooms && updatedRooms.length === refundEligibility.eligibleRooms.length) {
        if (refundEligibility.eligibleAirportPickup) {
          updatedPickup = true;
          setSelectedRefundPickup(true);
        }
      }
      setSelectedRefundRooms(updatedRooms);
    } else {
      updatedPickup = isChecked;
      setSelectedRefundPickup(updatedPickup);
    }

    if (updatedRooms.length === 0 && !updatedPickup) {
      setRefundCalculation(null);
      setShowAirportPickupInRefundModal(false);
      return;
    }

    try {
      const token = localStorage.getItem("customerToken");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api"}/roombook/refunds/calculate`,
        {
          bookingId: selectedBooking.realId,
          rooms: updatedRooms,
          airportPickup: updatedPickup
        },
        { headers }
      );
      if (response.data.success) {
        setRefundCalculation(response.data);
      }
    } catch (error) {
      console.error("Error calculating refund:", error);
    }
  };

  const handleCloseRefundModal = () => {
    setIsRefundModalOpen(false);
    setShowAirportPickupInRefundModal(false);
  };

  const handleOpenPickupCancelModal = () => {
    if (!selectedBooking?.raw?.airportPickup || selectedBooking.raw.airportPickup.status === "CANCELLED") {
      return;
    }
    setIsPickupCancelModalOpen(true);
  };

  const handleClosePickupCancelModal = () => {
    setIsPickupCancelModalOpen(false);
  };

  const handleConfirmPickupCancel = async () => {
    if (!selectedBooking?.realId) return;

    setIsSubmittingPickupCancel(true);
    try {
      const token = localStorage.getItem("customerToken");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api"}/customers/bookings/${selectedBooking.realId}/airport-pickup/cancel`,
        {},
        { headers }
      );

      if (response.data.success) {
        const pickupPrice = response.data.refundAmount || selectedPickupPrice;
        setBookings((prev) => prev.map((booking) =>
          booking.realId === selectedBooking.realId
            ? {
                ...booking,
                amount: response.data.newTotal ?? booking.amount,
                raw: booking.raw
                  ? {
                      ...booking.raw,
                      airportPickup: booking.raw.airportPickup
                        ? { ...booking.raw.airportPickup, status: "CANCELLED" }
                        : booking.raw.airportPickup
                    }
                  : booking.raw
              }
            : booking
        ));

        setSelectedBooking((prev) => prev ? {
          ...prev,
          amount: response.data.newTotal ?? prev.amount,
          raw: prev.raw
            ? {
                ...prev.raw,
                airportPickup: prev.raw.airportPickup
                  ? { ...prev.raw.airportPickup, status: "CANCELLED" }
                  : prev.raw.airportPickup
              }
            : prev.raw
        } : prev);

        toast.success(`Airport pickup cancelled successfully. ${CURRENCY} ${pickupPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} removed from the booking total.`);
        setIsPickupCancelModalOpen(false);
      } else {
        toast.error(response.data.message || "Failed to cancel airport pickup.");
      }
    } catch (error) {
      console.error("Error cancelling airport pickup:", error);
      toast.error(error.response?.data?.message || "Failed to cancel airport pickup.");
    } finally {
      setIsSubmittingPickupCancel(false);
    }
  };

  const handleSubmitRefundRequest = async (e) => {
    e.preventDefault();
    if (selectedRefundRooms.length === 0 && !selectedRefundPickup) {
      toast.error("Please select at least one room stay or airport pickup to refund.");
      return;
    }
    setIsSubmittingRefund(true);
    try {
      const token = localStorage.getItem("customerToken");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api"}/roombook/refunds`,
        {
          bookingId: selectedBooking.realId,
          rooms: selectedRefundRooms,
          airportPickup: selectedRefundPickup,
          reason: refundReason,
          paymentMethod: refundPaymentMethod
        },
        { headers }
      );
      if (response.data.success) {
        const activeRooms = selectedBooking?.raw?.bookedRooms?.filter((room) => room.status !== "cancelled") || [];
        const allActiveRoomsSelected = activeRooms.length > 0 && selectedRefundRooms.length === activeRooms.length;
        const shouldCancelPickupNow = selectedRefundPickup || allActiveRoomsSelected;
        const hasAnyRoomCancellation = selectedRefundRooms.length > 0;
        const nextBookingStatus = allActiveRoomsSelected && shouldCancelPickupNow
          ? "cancelled"
          : (hasAnyRoomCancellation || shouldCancelPickupNow)
            ? "cancellation pending"
            : selectedBooking?.status;

        setBookings((prev) => prev.map((booking) => {
          if (booking.realId !== selectedBooking.realId) return booking;

          const nextBookedRooms = booking.raw?.bookedRooms?.map((room) => {
            if (!selectedRefundRooms.includes(room.id)) return room;
            return { ...room, status: "cancelled" };
          }) || booking.raw?.bookedRooms;

          return {
            ...booking,
            status: nextBookingStatus,
            amount: response.data?.data?.amount ? booking.amount : booking.amount,
            raw: booking.raw
              ? {
                  ...booking.raw,
                  status: nextBookingStatus,
                  bookedRooms: nextBookedRooms,
                  airportPickup: booking.raw.airportPickup
                    ? {
                        ...booking.raw.airportPickup,
                        status: shouldCancelPickupNow ? "CANCELLED" : booking.raw.airportPickup.status
                      }
                    : booking.raw.airportPickup
                }
              : booking.raw
          };
        }));

        setSelectedBooking((prev) => prev ? {
          ...prev,
          status: nextBookingStatus,
          raw: prev.raw
            ? {
                ...prev.raw,
                status: nextBookingStatus,
                bookedRooms: prev.raw.bookedRooms?.map((room) => (
                  selectedRefundRooms.includes(room.id)
                    ? { ...room, status: "cancelled" }
                    : room
                )),
                airportPickup: prev.raw.airportPickup
                  ? {
                      ...prev.raw.airportPickup,
                      status: shouldCancelPickupNow ? "CANCELLED" : prev.raw.airportPickup.status
                    }
                  : prev.raw.airportPickup
              }
            : prev.raw
        } : prev);

        toast.success("Refund request successfully submitted and is pending review!");
        setIsRefundModalOpen(false);
        fetchRefundHistory(selectedBooking.realId);
      } else {
        toast.error(response.data.message || "Failed to create refund request.");
      }
    } catch (error) {
      console.error("Error submitting refund request:", error);
      toast.error(error.response?.data?.message || "Failed to submit refund request.");
    } finally {
      setIsSubmittingRefund(false);
    }
  };




  const CURRENCY = process.env.CURRENCY_TYPE || "LKR";

  const getStatusColors = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed") return "bg-emerald-50 border-emerald-250 text-emerald-800";
    if (s === "pending") return "bg-amber-50 border-amber-250 text-amber-850";
    if (s === "cancelled" || s === "rejected") return "bg-rose-50 border-rose-250 text-rose-850";
    if (s === "completed") return "bg-blue-50 border-blue-250 text-blue-800";
    return "bg-slate-50 border-slate-250 text-slate-700";
  };

  const getPaymentColors = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid" || s === "success") return "bg-cyan-50 border-cyan-200 text-cyan-900";
    if (s === "pending") return "bg-orange-50 border-orange-200 text-orange-850";
    if (s === "failed") return "bg-rose-50 border-rose-200 text-rose-700";
    if (s === "refunded") return "bg-purple-50 border-purple-200 text-purple-800";
    return "bg-slate-50 border-slate-200 text-slate-700";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Filter bookings locally by Status
  const getFilteredByTab = (list) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return list.filter(b => {
      const checkInDate = new Date(b.checkIn);
      const statusLower = (b.status || "").toLowerCase();

      if (filterTab === "upcoming") {
        return checkInDate >= today && statusLower !== "cancelled" && statusLower !== "rejected";
      }
      if (filterTab === "completed") {
        return statusLower === "completed" || (checkInDate < today && statusLower === "confirmed");
      }
      if (filterTab === "cancelled") {
        return statusLower === "cancelled" || statusLower === "rejected";
      }
      return true;
    });
  };

  // Filter and search using useMemo for performance
  const filteredAndSearchedBookings = useMemo(() => {
    const tabFiltered = getFilteredByTab(bookings);
    if (!searchTerm.trim()) return tabFiltered;

    const term = searchTerm.toLowerCase().trim();
    return tabFiltered.filter(b => {
      const matchId = (b.id || "").toLowerCase().includes(term);
      const matchHotel = (b.hotelName || "").toLowerCase().includes(term);
      const matchDate = formatDate(b.checkIn).toLowerCase().includes(term) || formatDate(b.checkOut).toLowerCase().includes(term);
      
      const matchRoom = b.raw?.bookedRooms?.some(r => 
        (r.Room?.roomType?.type || "").toLowerCase().includes(term)
      );

      return matchId || matchHotel || matchDate || matchRoom;
    });
  }, [bookings, filterTab, searchTerm]);

  // Print Invoice layout
  const handlePrintInvoice = (booking) => {
    const checkIn = formatDate(booking.checkIn);
    const checkOut = formatDate(booking.checkOut);
    const createdDate = formatDateTime(booking.raw?.createdAt);
    const supportContact = "+94701950195";
    const customerName = profile.name || "Valued Guest";
    const customerEmail = profile.email || "";
    const customerPhone = profile.phone || "";
    const customerCountry = profile.country || "Sri Lanka";
    const boardSummary = booking.raw?.bookedRooms?.map((room) => room.board_type || "Room Only").filter(Boolean).join(", ") || "Room Only";
    const mealPlan = boardSummary;

    const successPayments = booking.raw?.payments?.filter(p => p.status === "success" || p.status === "paid") || [];
    const totalPaid = successPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const balanceDue = Math.max(0, booking.amount - totalPaid);
    const totalRooms = booking.raw?.bookedRooms?.length || booking.rooms?.length || 0;
    const totalPax = (booking.raw?.bookedRooms || []).reduce((sum, room) => sum + (room.adults || 0) + (room.kids || 0), 0) || booking.guestsSummary || "";
    const pickupStatus = (booking.raw?.airportPickup?.status || "").toUpperCase();
    const pickupPrice = pickupStatus !== "CANCELLED"
      ? parseFloat(booking.raw?.airportPickup?.price || booking.airportPickupFee || 0)
      : 0;

    const priceBreakdownRows = booking.raw?.bookedRooms?.map((room, idx) => {
      const rate = parseFloat(room.Room?.roomPrices?.[0]?.price || room.pricePerNight || 0);
      const rowTotal = rate * booking.nights;
      return `
        <tr>
          <td>Room ${idx + 1}: ${room.Room?.roomType?.type || "Deluxe Suite"} (${room.board_type || "Room Only"})</td>
          <td style="text-align: center;">${booking.nights}</td>
          <td style="text-align: right;">${CURRENCY} ${rate.toFixed(2)}</td>
          <td style="text-align: right;">${CURRENCY} ${rowTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join("") || "";

    const hasPickup = booking.raw?.airportPickup;
    const extraChargesRows = hasPickup ? `
      <tr>
        <td colspan="3">Airport Shuttle Transfer Service (Katunayake Fixed Point)</td>
        <td style="text-align: right;">${CURRENCY} ${pickupPrice.toFixed(2)}</td>
      </tr>
    ` : "";

    const baseAmount = booking.amount - (booking.tax || 0);
    const baseWithoutPickup = Math.max(0, baseAmount - pickupPrice);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
      <head>
        <title>Proforma Invoice - ${booking.id}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Georgia, 'Times New Roman', serif; color: #111827; margin: 0; padding: 0; line-height: 1.35; background: #fff; }
          .page { width: 100%; max-width: 900px; margin: 0 auto; padding: 32px 40px 28px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
          .brand { width: 240px; text-align: center; }
          .brand img { width: 120px; height: auto; display: block; margin: 0 auto 8px; }
          .brand .company { font-size: 16px; font-weight: 700; }
          .brand .sub { font-size: 13px; margin-top: 3px; }
          .title-block { text-align: center; flex: 1; padding-top: 12px; }
          .title { font-size: 28px; font-weight: 700; letter-spacing: 0.5px; }
          .meta { width: 250px; font-size: 14px; padding-top: 14px; }
          .meta div { margin-bottom: 1px; }
          .top-grid { display: flex; justify-content: space-between; margin-top: 20px; gap: 24px; }
          .top-left { width: 56%; font-size: 15px; }
          .top-left div { margin-bottom: 2px; }
          .top-right { width: 40%; font-size: 15px; }
          .section-label { margin: 44px 0 12px; font-size: 17px; font-weight: 700; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; }
          th { font-size: 12px; text-transform: uppercase; text-align: left; padding: 10px 8px; border-bottom: 1px solid #111; }
          td { font-size: 14px; padding: 10px 8px; border-bottom: 1px solid #d1d5db; vertical-align: top; }
          .rates td { border-bottom: 0; }
          .rate-line { display: flex; justify-content: space-between; gap: 20px; font-size: 15px; margin-bottom: 4px; }
          .rate-desc { width: 58%; }
          .rate-nights { width: 16%; text-align: center; }
          .rate-amount { width: 26%; text-align: right; font-weight: 700; }
          .totals-box { width: 360px; margin-left: auto; margin-top: 8px; font-size: 15px; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
          .grand-total { font-weight: 700; border-top: 1px solid #111; border-bottom: 3px double #111; padding: 6px 0; margin-top: 4px; }
          .payment-box { margin-top: 24px; padding: 14px 16px; border: 1px solid #d1d5db; }
          .payment-title { font-weight: 700; margin-bottom: 8px; text-transform: uppercase; }
          .footer { margin-top: 38px; text-align: center; font-size: 15px; font-weight: 700; }
          .support { margin-top: 18px; text-align: center; font-size: 14px; }
          .muted { color: #374151; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="brand">
              <img src="${bluebirdLogo}" alt="BlueBird logo" />
              <div class="company">Hotels & Travels (PVT) LTD</div>
            </div>
            <div class="title-block">
              <div class="title">PROFORMA INVOICE</div>
            </div>
            <div class="meta">
              <div>Date: ${createdDate}</div>
              <div>Agent: ${customerName}</div>
              <div>Country: ${customerCountry}</div>
              <div>Purpose: Holiday</div>
            </div>
          </div>

          <div class="top-grid">
            <div class="top-left">
              <div>Guest Name: ${customerName}</div>
              <div>Arrival Date: ${checkIn}</div>
              <div>Departure Date: ${checkOut}</div>
              <div>No of Rooms: ${String(totalRooms).padStart(2, "0")}</div>
              <div>No of Nights: ${String(booking.nights || 0).padStart(2, "0")}</div>
              <div>Pax Count: ${totalPax || booking.guestsSummary || ""}</div>
              <div>Meal Plan: ${mealPlan}</div>
            </div>
            <div class="top-right">
              <div class="muted">Invoice No: INV-${booking.realId}</div>
              <div class="muted">Booking Ref: ${booking.id}</div>
              <div class="muted">Status: ${booking.status}</div>
              <div class="muted">Support: ${supportContact}</div>
            </div>
          </div>

          <div class="section-label">Room Rates:</div>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th style="text-align:center; width: 100px;">Nights</th>
                <th style="text-align:right; width: 160px;">Rate</th>
                <th style="text-align:right; width: 160px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${priceBreakdownRows}
              ${extraChargesRows}
            </tbody>
          </table>

          <div class="totals-box">
            <div class="totals-row">
              <span>Total Amount</span>
              <span>:</span>
              <span>${CURRENCY} ${booking.amount.toFixed(2)}</span>
            </div>
            ${hasPickup ? `
            <div class="totals-row">
              <span>Airport Pickup</span>
              <span>:</span>
              <span>${CURRENCY} ${pickupPrice.toFixed(2)}</span>
            </div>` : ""}
            <div class="totals-row payment-box">
              <span class="payment-title">Payment Details</span>
            </div>
            <div class="totals-row">
              <span>Amount Paid (Deposit)</span>
              <span>:</span>
              <span>${CURRENCY} ${totalPaid.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Balance Due</span>
              <span>:</span>
              <span>${CURRENCY} ${balanceDue.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            We thank you for your stay and hope to see you again in the future....
          </div>
          <div class="support">Support Contact: ${supportContact}</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Print Receipt layout
  const handlePrintReceipt = (booking) => {
    const successPayment = booking.raw?.payments?.find(p => p.status === "success" || p.status === "paid");
    if (!successPayment) {
      toast.error("No active payments found. A receipt statement is only generated for paid bookings.");
      return;
    }

    const checkIn = formatDate(booking.checkIn);
    const checkOut = formatDate(booking.checkOut);
    const paymentDate = formatDateTime(successPayment.createdAt);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
      <head>
        <title>Receipt - ${successPayment.payment_no}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f766e; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 900; color: #0f766e; letter-spacing: 1px; }
          .title { font-size: 28px; font-weight: 800; text-align: right; color: #1e293b; }
          .details { display: flex; justify-content: space-between; margin-top: 30px; }
          .section-title { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
          .info-block { flex: 1; }
          .payment-summary { background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 20px; margin-top: 40px; }
          .summary-title { font-size: 14px; font-weight: bold; color: #115e59; border-bottom: 1px solid #99f6e4; padding-bottom: 8px; margin-bottom: 15px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #334155; }
          .total-paid { font-size: 20px; font-weight: 900; color: #0f766e; border-top: 1px dashed #99f6e4; padding-top: 12px; margin-top: 8px; }
          .footer { margin-top: 150px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">BLUEBIRD RESORTS</div>
            <div style="font-size: 12px; color: #64748b;">Galle Face, Colombo, Sri Lanka</div>
          </div>
          <div>
            <div class="title">PAYMENT RECEIPT</div>
            <div style="font-size: 13px; font-weight: bold;">Receipt No: ${successPayment.payment_no}</div>
            <div style="font-size: 12px; color: #64748b;">Date Paid: ${paymentDate}</div>
          </div>
        </div>

        <div class="details">
          <div class="info-block">
            <div class="section-title">Received From</div>
            <div style="font-weight: bold;">${profile.name || "Valued Guest"}</div>
            <div style="font-size: 12px;">${profile.email || ""}</div>
            <div style="font-size: 12px;">${profile.phone || ""}</div>
          </div>
          <div class="info-block" style="text-align: right;">
            <div class="section-title">Payment For Reservation</div>
            <div style="font-weight: bold;">Booking Reference: ${booking.id}</div>
            <div style="font-size: 12px;">Check-In: ${checkIn} to ${checkOut}</div>
          </div>
        </div>

        <div class="payment-summary">
          <div class="summary-title">Transaction Receipt Details</div>
          <div class="summary-row">
            <span>Payment Method:</span>
            <span style="font-weight: bold; text-transform: uppercase;">${successPayment.method}</span>
          </div>
          <div class="summary-row">
            <span>Transaction Reference ID:</span>
            <span style="font-mono; font-size: 12px;">${successPayment.id}</span>
          </div>
          <div class="summary-row">
            <span>Original Stay Total Price:</span>
            <span>${CURRENCY} ${booking.amount.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Payment Status:</span>
            <span style="color: #0f766e; font-weight: bold; text-transform: uppercase;">${successPayment.status}</span>
          </div>
          <div class="summary-row total-paid">
            <span>Amount Paid:</span>
            <span>${CURRENCY} ${parseFloat(successPayment.amount).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for securing your luxury stay with us.
          <br/>
          For billing support, contact: billing@bluebird.lk | +94 11 234 5678
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getTimelineSteps = (booking) => {
    const status = (booking.status || "").toLowerCase();
    const isPaid = (booking.paymentStatus || "").toLowerCase() === "paid";
    const bookedRooms = booking.raw?.bookedRooms || [];
    const hasCheckedIn = bookedRooms.some(r => (r.status || "").toLowerCase() === "checked_in" || (r.status || "").toLowerCase() === "checked_out");
    const hasCheckedOut = bookedRooms.some(r => (r.status || "").toLowerCase() === "checked_out");
    
    return [
      { label: "Booking Created", date: formatDateTime(booking.raw?.createdAt), active: true, done: true },
      { label: "Payment Completed", date: isPaid ? "Verified Online" : null, active: isPaid, done: isPaid },
      { label: "Booking Confirmed", date: (status === "confirmed" || status === "completed" || hasCheckedIn) ? "Stay Confirmed" : null, active: (status === "confirmed" || status === "completed" || hasCheckedIn), done: (status === "confirmed" || status === "completed" || hasCheckedIn) },
      { label: "Check-in Completed", date: hasCheckedIn ? "Checked In" : null, active: hasCheckedIn, done: hasCheckedIn },
      { label: "Booking Completed", date: hasCheckedOut ? "Checked Out" : null, active: hasCheckedOut, done: hasCheckedOut }
    ];
  };

  const getOverallStayStatus = (booking) => {
    const bookedRooms = booking.raw?.bookedRooms || [];
    const status = (booking.status || "").toLowerCase();
    
    if (bookedRooms.length > 0) {
      const roomStatuses = bookedRooms.map(r => (r.status || "").toLowerCase());
      if (roomStatuses.includes("checked_in")) {
        return { 
          key: "checked_in", 
          label: "Checked In", 
          color: "emerald",
          message: "You are currently checked-in to your room. Enjoy your stay at BlueBird Hotels & Resorts!"
        };
      }
      if (roomStatuses.includes("checked_out")) {
        return { 
          key: "checked_out", 
          label: "Checked Out", 
          color: "blue",
          message: "You have checked-out of this room. Thank you for choosing BlueBird Luxury Hotels!"
        };
      }
    }
    
    if (status === "cancelled" || status === "rejected") {
      return { 
        key: "cancelled", 
        label: "Cancelled", 
        color: "rose",
        message: "This reservation has been cancelled or rejected."
      };
    }
    if (status === "confirmed") {
      return { 
        key: "confirmed", 
        label: "Reserved & Confirmed", 
        color: "indigo",
        message: "Your stay is confirmed! We look forward to welcoming you on your check-in date."
      };
    }
    return {
      key: "pending",
      label: "Pending Verification",
      color: "amber",
      message: "Your reservation is pending document review or payment completion."
    };
  };

  const renderEmptyState = (title, message, iconComponent, buttonText, onClickAction) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-slate-150 rounded-3xl text-center space-y-5 shadow-3xs animate-fadeIn">
      <div className="p-4 bg-slate-50 rounded-full text-blue-900/80 shrink-0">
        {iconComponent}
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="text-slate-500 text-xs leading-relaxed">{message}</p>
      </div>
      {buttonText && (
        <button
          onClick={onClickAction}
          className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-all duration-300 shadow-md cursor-pointer"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Room Booking History</h2>
          <p className="text-slate-500 text-xs mt-0.5 font-sans">Track billing summaries, timelines, receipts, and cancellation details.</p>
        </div>
        <button
          onClick={() => window.location.href = "/booking"}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-3xs cursor-pointer flex items-center gap-1.5 transition-all hover:scale-[1.02]"
        >
          <Home size={13} />
          Book New Stay
        </button>
      </div>

      {/* Filtering Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
          {[
            { id: "all", label: "All Stays" },
            { id: "upcoming", label: "Upcoming" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterTab === tab.id 
                  ? "bg-white text-slate-800 shadow-3xs" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72 flex items-center bg-white border border-slate-250 rounded-xl px-3 py-2">
          <Search size={14} className="text-slate-400 mr-2 shrink-0" />
          <input
            type="search"
            placeholder="Search by ID, date, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-medium text-slate-700 outline-none placeholder-slate-400"
          />
        </div>
      </div>

      {/* Booking List Container */}
      {isEmptyState || filteredAndSearchedBookings.length === 0 ? (
        renderEmptyState(
          "No stays matching criteria",
          "There are no rooms listed or found matching your current filter selection. Try creating a new luxury booking now.",
          <Calendar size={24} />,
          "Book stay now",
          () => window.location.href = "/booking"
        )
      ) : (
        <div className="space-y-6">
          
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-hidden bg-white border border-slate-150 rounded-2xl shadow-3xs">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-left">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking ID</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-in / Out</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nights / Guests</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Status</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Stay Cost</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSearchedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="text-xs font-black text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1.5 outline-none"
                      >
                        <Ticket size={12} />
                        {b.id}
                      </button>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{formatDate(b.raw?.createdAt)}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-xs font-semibold text-slate-800">{formatDate(b.checkIn)}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(b.checkOut)}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-xs font-semibold text-slate-800">{b.nights} Night{b.nights !== 1 ? "s" : ""}</p>
                      <p className="text-[10px] text-slate-400">{b.guestsSummary}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-full border ${getStatusColors(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-full border ${getPaymentColors(b.paymentStatus)}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right text-xs font-black text-slate-900">
                      {CURRENCY} {b.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          title="View complete details"
                          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition cursor-pointer"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(b)}
                          title="Download PDF invoice"
                          className="p-1.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 hover:text-blue-800 transition cursor-pointer"
                        >
                          <FileText size={13} />
                        </button>
                        {b.paymentStatus.toLowerCase() === "paid" && (
                          <button
                            onClick={() => handlePrintReceipt(b)}
                            title="Download paid payment receipt"
                            className="p-1.5 bg-cyan-50 border border-cyan-100 rounded-lg text-cyan-700 hover:text-cyan-900 transition cursor-pointer"
                          >
                            <Receipt size={13} />
                          </button>
                        )}
                        {b.status.toLowerCase() !== "cancelled" && b.status.toLowerCase() !== "completed" && b.status.toLowerCase() !== "cancellation pending" ? (
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              handleRequestRefundClick(null, false, true, b);
                            }}
                            title="Cancel reservation"
                            className="p-1.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 hover:text-rose-800 transition cursor-pointer"
                          >
                            <XCircle size={13} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="md:hidden space-y-4">
            {filteredAndSearchedBookings.map((b) => (
              <div 
                key={b.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-3xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-slate-450 tracking-wider">BOOKING ID</span>
                    <button 
                      onClick={() => setSelectedBooking(b)}
                      className="block text-xs font-black text-blue-700 text-left outline-none cursor-pointer"
                    >
                      {b.id}
                    </button>
                    <span className="block text-[9px] text-slate-400 mt-0.5">{formatDate(b.raw?.createdAt)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full border ${getStatusColors(b.status)}`}>
                      {b.status}
                    </span>
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full border ${getPaymentColors(b.paymentStatus)}`}>
                      {b.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold block">CHECK-IN</span>
                    <span className="font-semibold text-slate-800">{formatDate(b.checkIn)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold block">CHECK-OUT</span>
                    <span className="font-semibold text-slate-800">{formatDate(b.checkOut)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold block">NIGHTS / GUESTS</span>
                    <span className="font-semibold text-slate-800">{b.nights} Nights / {b.guestsSummary}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold block">TOTAL COST</span>
                    <span className="font-black text-slate-900">{CURRENCY} {b.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="flex-1 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold text-center cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handlePrintInvoice(b)}
                    className="flex-1 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-[10px] font-bold text-center cursor-pointer"
                  >
                    Invoice
                  </button>
                  {b.paymentStatus.toLowerCase() === "paid" && (
                    <button
                      onClick={() => handlePrintReceipt(b)}
                      className="flex-1 py-2 bg-cyan-50 border border-cyan-100 text-cyan-800 rounded-lg text-[10px] font-bold text-center cursor-pointer"
                    >
                      Receipt
                    </button>
                  )}
                  {b.status.toLowerCase() !== "cancelled" && b.status.toLowerCase() !== "completed" && b.status.toLowerCase() !== "cancellation pending" ? (
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        handleRequestRefundClick(null, false, true, b);
                      }}
                      className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg cursor-pointer"
                    >
                      <XCircle size={14} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* DETAILED BOOKING POPUP MODAL */}
      {selectedBooking && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity animate-fadeIn" 
            onClick={() => setSelectedBooking(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white z-50 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideLeft">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-blue-950 text-white">
              <div>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest block">Stay Details Panel</span>
                <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                  <Ticket size={18} className="text-amber-400" />
                  {selectedBooking.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 space-y-6">
              
              {/* Status Highlight Banner */}
              {(() => {
                const stayStatus = getOverallStayStatus(selectedBooking);
                const colorClasses = {
                  emerald: "bg-emerald-50 border-emerald-200 text-emerald-805",
                  blue: "bg-blue-50 border-blue-200 text-blue-805",
                  rose: "bg-rose-50 border-rose-255 text-rose-805",
                  indigo: "bg-indigo-50 border-indigo-200 text-indigo-805",
                  amber: "bg-amber-50 border-amber-200 text-amber-900"
                };
                const bgBorderClass = colorClasses[stayStatus.color] || "bg-slate-50 border-slate-200 text-slate-800";
                return (
                  <div className={`p-4 border rounded-2xl flex gap-3.5 items-start ${bgBorderClass} shadow-2xs animate-fadeIn`}>
                    <div className="shrink-0 mt-0.5">
                      {stayStatus.key === "checked_in" && <ShieldCheck className="w-5.5 h-5.5 text-emerald-600 animate-pulse" />}
                      {stayStatus.key === "checked_out" && <Check className="w-5.5 h-5.5 text-blue-600" />}
                      {stayStatus.key === "cancelled" && <XCircle className="w-5.5 h-5.5 text-rose-600" />}
                      {stayStatus.key === "confirmed" && <Calendar className="w-5.5 h-5.5 text-indigo-650" />}
                      {stayStatus.key === "pending" && <Clock className="w-5.5 h-5.5 text-amber-600 animate-pulse" />}
                    </div>
                    <div className="text-xs">
                      <p className="font-extrabold uppercase tracking-wider text-[9px] opacity-75">Reservation Current Status</p>
                      <p className="font-black text-sm uppercase mt-0.5 tracking-wide">{stayStatus.label}</p>
                      <p className="font-semibold mt-1 opacity-90 leading-relaxed text-[11px]">{stayStatus.message}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Timeline Feature */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">Stay Milestone Timeline</span>
                <div className="relative pl-6 space-y-4 border-l border-slate-200">
                  {getTimelineSteps(selectedBooking).map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[34px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        step.done 
                          ? "bg-emerald-600 border-emerald-600 text-white" 
                          : step.active 
                            ? "bg-amber-400 border-amber-400 text-white" 
                            : "bg-white border-slate-200"
                      }`}>
                        {step.done && <Check size={8} className="stroke-[3]" />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${step.done ? "text-slate-800" : "text-slate-400"}`}>{step.label}</p>
                        {step.date && <p className="text-[10px] text-slate-400 mt-0.5">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stays info */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">Accommodation details</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">CHECK-IN</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={12} className="text-blue-700" />
                      {formatDate(selectedBooking.checkIn)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">CHECK-OUT</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={12} className="text-blue-700" />
                      {formatDate(selectedBooking.checkOut)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">ROOM DETAILS</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <BedDouble size={12} className="text-cyan-700" />
                      {selectedBooking.rooms.length} Room(s) ({selectedBooking.nights} Nights)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">OCCUPANCY SUMMARY</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Users size={12} className="text-cyan-700" />
                      {selectedBooking.guestsSummary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Room details breakdown list */}
              <div className="space-y-2.5">
                {selectedBooking.raw?.bookedRooms?.map((room, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-xl flex gap-3 items-start">
                    {room.Room?.roomType?.image_url ? (
                      <img 
                        src={room.Room.roomType.image_url} 
                        alt={room.Room?.roomType?.type || "Room"} 
                        className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0 shadow-3xs"
                      />
                    ) : (
                      <BedDouble size={18} className="text-blue-700 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 text-xs">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-800">{room.Room?.roomType?.type || "Deluxe Suite"}</p>
                        <span className="text-[10px] font-black text-blue-900 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5">
                          {room.board_type || "Room Only"}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px] mt-1">
                        Occupancy capacity: {room.adults} Adult(s) {room.kids > 0 ? `, ${room.kids} Child(ren)` : ""}
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        Room Assigned: <span className="font-bold text-slate-700">{room.Room?.room_number ? `Room ${room.Room.room_number}` : "Assigning upon arrival"}</span>
                      </p>
                      {room.status === "cancelled" ? (
                        <span className="text-rose-600 font-extrabold text-[9px] block mt-1.5 uppercase tracking-wide">🚫 Cancelled</span>
                      ) : (room.status === "checked_in" || room.status === "checked_out") ? (
                        <span className="text-emerald-600 font-extrabold text-[9px] block mt-1.5 uppercase tracking-wide">✓ Checked In</span>
                      ) : (selectedBooking.status.toLowerCase() !== "cancelled" && selectedBooking.status.toLowerCase() !== "completed" && selectedBooking.status.toLowerCase() !== "cancellation pending") ? (
                        <button
                          onClick={() => handleRequestRefundClick(room.id, false)}
                          className="mt-2 text-rose-600 hover:text-rose-800 font-bold text-[9px] hover:underline cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                        >
                          <XCircle size={11} className="text-rose-500" />
                          Cancel this room
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* Airport Shuttle Information (if requested) */}
              {selectedBooking.raw?.airportPickup && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <MapPin size={14} className="text-emerald-700" />
                    Airport Shuttle Pickup Info (Active)
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-emerald-800 font-semibold">
                    <p>Location: Katunayake (Fixed)</p>
                    <p>Date: {formatDate(selectedBooking.raw.airportPickup.pickup_date)}</p>
                    <p>Time: {selectedBooking.raw.airportPickup.pickup_time}</p>
                    <p>Flight No: {selectedBooking.raw.airportPickup.flight_number || "—"}</p>
                    <p>Passengers: {selectedBooking.raw.airportPickup.passenger_count || 1}</p>
                    <p>Baggage: {selectedBooking.raw.airportPickup.baggage_count || 0}</p>
                    <p>Status: {selectedBooking.raw.airportPickup.status}</p>
                    <p>Pickup Type: Private Shuttle</p>
                    {selectedBooking.raw.airportPickup.status === "CANCELLED" ? (
                      <p className="col-span-2 text-rose-600 font-extrabold uppercase text-[10px] tracking-wide mt-1.5 flex items-center gap-1">
                        🚫 Airport Shuttle Cancelled
                      </p>
                    ) : (selectedBooking.status.toLowerCase() !== "cancelled" && selectedBooking.status.toLowerCase() !== "completed" && selectedBooking.status.toLowerCase() !== "cancellation pending") ? (
                      <button
                        onClick={handleOpenPickupCancelModal}
                        className="col-span-2 mt-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-105 border border-rose-200 text-rose-700 font-extrabold rounded-lg text-[9px] hover:underline cursor-pointer flex items-center justify-center gap-1.5 w-full uppercase tracking-wider transition-all"
                      >
                        <XCircle size={12} className="text-rose-500" />
                        Cancel Airport Pickup Shuttle
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Customer Contact Details */}
              <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Customer Information</span>
                <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <p className="flex items-center gap-2"><User size={13} className="text-slate-400" /> {profile.name || "Valued Guest"}</p>
                  <p className="flex items-center gap-2"><Mail size={13} className="text-slate-400" /> {profile.email || ""}</p>
                  <p className="flex items-center gap-2"><Phone size={13} className="text-slate-400" /> {profile.phone || ""}</p>
                </div>
              </div>

              {/* Payment Summary breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">Stay billing breakdown</span>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>Base stay price:</span>
                    <span>{CURRENCY} {(selectedBooking.amount - (selectedBooking.raw?.airportPickup && selectedBooking.raw.airportPickup.status !== "CANCELLED" ? selectedPickupPrice : 0) - selectedBooking.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {selectedBooking.raw?.airportPickup && selectedBooking.raw.airportPickup.status !== "CANCELLED" && (
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Additional shuttle charges:</span>
                      <span>{CURRENCY} {selectedPickupPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Taxes (${selectedBooking.taxPercentage}%):</span>
                    <span>{CURRENCY} {selectedBooking.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-2.5 border-t border-slate-250 font-black text-slate-900 text-sm">
                    <span>Total stay charge:</span>
                    <span>{CURRENCY} {selectedBooking.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Payment History transaction ID */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">Transaction logs</span>
                {selectedBooking.raw?.payments && selectedBooking.raw.payments.length > 0 ? (
                  selectedBooking.raw.payments.map((payment, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/50 border border-slate-200/50 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700">
                      <div>
                        <p className="font-bold uppercase text-slate-800">{payment.method} Transaction</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">Ref ID: {payment.payment_no || payment.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">{CURRENCY} {parseFloat(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 text-[8px] font-black uppercase rounded-full border ${getPaymentColors(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 italic">No payments transaction logs recorded for this booking statement.</p>
                )}
              </div>

              {/* Refund Requests History */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5">Refund Requests history</span>
                {refundHistory && refundHistory.length > 0 ? (
                  refundHistory.map((refund, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700">
                      <div>
                        <p className="font-bold text-slate-800">Refund: {refund.refund_no}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Requested on: {new Date(refund.request_date).toLocaleDateString()}</p>
                        {refund.reason && <p className="text-[10px] text-slate-500 italic mt-0.5">Reason: "{refund.reason}"</p>}
                        {refund.transaction_ref && <p className="text-[10px] text-mono text-slate-400">Ref: {refund.transaction_ref}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-black text-rose-700">-{CURRENCY} {parseFloat(refund.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 text-[8px] font-black uppercase rounded-full border ${
                          refund.status === "COMPLETED" || refund.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : refund.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-250 animate-pulse"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {refund.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 italic">No refund requests submitted for this booking.</p>
                )}
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
              <button
                onClick={() => handlePrintInvoice(selectedBooking)}
                className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold text-center cursor-pointer flex justify-center items-center gap-1.5 hover:scale-[1.02] transition-all"
              >
                <FileText size={13} />
                Invoice
              </button>
              {selectedBooking.paymentStatus.toLowerCase() === "paid" && (
                <button
                  onClick={() => handlePrintReceipt(selectedBooking)}
                  className="flex-1 py-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold text-center cursor-pointer flex justify-center items-center gap-1.5 hover:scale-[1.02] transition-all"
                >
                  <Receipt size={13} />
                  Receipt
                </button>
              )}
              {selectedBooking.status.toLowerCase() !== "cancelled" && selectedBooking.status.toLowerCase() !== "completed" && (
                <button
                  onClick={() => handleRequestRefundClick(null, false)}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center cursor-pointer flex justify-center items-center gap-1 hover:scale-[1.02] transition-all"
                >
                  <RefreshCw size={13} className="animate-spin-slow" />
                  Request Refund
                </button>
              )}
              {selectedBooking.status.toLowerCase() !== "cancelled" && selectedBooking.status.toLowerCase() !== "completed" && selectedBooking.status.toLowerCase() !== "cancellation pending" ? (
                <button
                  onClick={() => {
                    handleRequestRefundClick(null, false, true);
                  }}
                  className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold text-center cursor-pointer hover:scale-[1.02] transition-all"
                >
                  Cancel Booking
                </button>
              ) : null}
            </div>

          </div>
        </>
      )}



      {/* Dynamic Refund Request Selection Modal */}
      {isRefundModalOpen && refundEligibility && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-55 animate-fadeIn"
            onClick={handleCloseRefundModal}
          />
          <div className="fixed inset-0 flex items-center justify-center z-55 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-6 h-6 text-indigo-650 animate-spin-slow animate-pulse" />
                  <h4 className="font-serif font-bold text-base text-slate-800">Request Booking Refund</h4>
                </div>
                <button 
                  onClick={handleCloseRefundModal}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitRefundRequest} className="space-y-4 text-xs">
                {/* Eligible Stays List */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Select items to refund:</span>
                  
                  {/* Rooms list */}
                  {refundEligibility.eligibleRooms && refundEligibility.eligibleRooms.length > 0 ? (
                    <div className="space-y-2">
                      <p className="font-bold text-slate-700">Rooms Stay Service:</p>
                      {refundEligibility.eligibleRooms.map((room) => (
                        <label 
                          key={room.id} 
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedRefundRooms.includes(room.id)
                              ? "bg-indigo-50/50 border-indigo-250 shadow-3xs"
                              : "bg-slate-50/50 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            className="mt-1 accent-indigo-600"
                            checked={selectedRefundRooms.includes(room.id)}
                            onChange={(e) => handleRefundSelectionChange(room.id, true, e.target.checked)}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between font-bold">
                              <span>Room {room.roomNumber} ({room.roomType})</span>
                              <span className="text-slate-800">{CURRENCY} {room.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                              <span>{new Date(room.checkIn).toLocaleDateString()} - {new Date(room.checkOut).toLocaleDateString()} ({room.nights} Night(s))</span>
                              {room.penaltyApplied ? (
                                <span className="text-rose-605 font-bold">Late Cancel Penalty: 50% deposit retained</span>
                              ) : (
                                <span className="text-emerald-650 font-bold">Free cancellation (100% refundable)</span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No eligible room stays available to refund.</p>
                  )}

                  {/* Airport pickup */}
                  {showAirportPickupInRefundModal && refundEligibility.eligibleAirportPickup && (
                    <div className="space-y-2 pt-2">
                      <p className="font-bold text-slate-700">Airport Transfer Shuttle Service:</p>
                      <label 
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedRefundPickup
                            ? "bg-indigo-50/50 border-indigo-250 shadow-3xs"
                            : "bg-slate-50/50 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input 
                          type="checkbox"
                          className="mt-1 accent-indigo-600"
                          checked={selectedRefundPickup}
                          onChange={(e) => handleRefundSelectionChange(null, false, e.target.checked)}
                          disabled={refundEligibility?.eligibleRooms && selectedRefundRooms.length === refundEligibility.eligibleRooms.length}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between font-bold">
                            <span>Airport Pickup ({refundEligibility.eligibleAirportPickup.location})</span>
                            <span className="text-slate-800">{CURRENCY} {refundEligibility.eligibleAirportPickup.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Scheduled: {new Date(refundEligibility.eligibleAirportPickup.pickupDate).toLocaleDateString()} at {refundEligibility.eligibleAirportPickup.pickupTime}
                          </p>
                          {refundEligibility?.eligibleRooms && selectedRefundRooms.length === refundEligibility.eligibleRooms.length && (
                            <p className="text-[10px] text-indigo-650 font-bold mt-1">
                              * Airport pickup must be cancelled when cancelling all room bookings.
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Calculation breakdown */}
                {refundCalculation && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Refund Breakdown</span>
                    <div className="flex justify-between">
                      <span>Room stay subtotal:</span>
                      <span>{CURRENCY} {refundCalculation.roomTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {refundCalculation.airportPickup > 0 && (
                      <div className="flex justify-between">
                        <span>Shuttle charges subtotal:</span>
                        <span>{CURRENCY} {refundCalculation.airportPickup.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-rose-650 font-bold">
                      <span>Cancellation fee/penalties:</span>
                      <span>-{CURRENCY} {refundCalculation.cancellationFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900 text-sm">
                      <span>Expected Refund:</span>
                      <span>{CURRENCY} {refundCalculation.refundAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({refundCalculation.refundPercentage}%)</span>
                    </div>
                    {refundCalculation.refundAmount === refundCalculation.totalPaid && refundCalculation.totalPaid < (refundCalculation.roomTotal + refundCalculation.airportPickup - refundCalculation.cancellationFee) && (
                      <p className="text-[9px] text-rose-600 font-bold leading-normal mt-1 animate-pulse">
                        * Note: Refund is capped at {CURRENCY} {refundCalculation.totalPaid.toLocaleString()} (total amount paid by you).
                      </p>
                    )}
                  </div>
                )}

                {/* Refund Form inputs */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700">Preferred Refund Method:</label>
                    <select
                      value={refundPaymentMethod}
                      onChange={(e) => setRefundPaymentMethod(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-750 focus:outline-indigo-650"
                    >
                      <option value="Cash">Cash (Collect at Reception)</option>
                      <option value="Card">Card Reversal</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700">Reason for Cancellation:</label>
                    <textarea
                      required
                      placeholder="Please tell us why you are canceling..."
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-750 focus:outline-indigo-650 h-20 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseRefundModal}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer text-center"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRefund || (selectedRefundRooms.length === 0 && !selectedRefundPickup)}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-750 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingRefund ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Refund Request"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Airport Pickup Cancel Confirmation Modal */}
      {isPickupCancelModalOpen && selectedBooking?.raw?.airportPickup && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-55 animate-fadeIn"
            onClick={handleClosePickupCancelModal}
          />
          <div className="fixed inset-0 flex items-center justify-center z-55 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-rose-600" />
                  <h4 className="font-serif font-bold text-base text-slate-800">Cancel Airport Pickup</h4>
                </div>
                <button
                  onClick={handleClosePickupCancelModal}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <p className="text-slate-600 leading-relaxed">
                  This will cancel only the airport pickup service. Your room booking will remain active.
                </p>

                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5 font-semibold text-slate-700">
                  <p>Flight No: {selectedBooking.raw.airportPickup.flight_number || "—"}</p>
                  <p>Passengers: {selectedBooking.raw.airportPickup.passenger_count || 1}</p>
                  <p>Baggage: {selectedBooking.raw.airportPickup.baggage_count || 0}</p>
                  <p>Pickup: {formatDate(selectedBooking.raw.airportPickup.pickup_date)} {selectedBooking.raw.airportPickup.pickup_time || ""}</p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3 text-amber-900 font-semibold">
                  Cancellation will remove the shuttle charge from the booking total.
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleClosePickupCancelModal}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer text-center"
                >
                  Keep Pickup
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPickupCancel}
                  disabled={isSubmittingPickupCancel}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  {isSubmittingPickupCancel ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Pickup"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
