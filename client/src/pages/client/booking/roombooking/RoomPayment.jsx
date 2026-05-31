import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle, Check, ArrowLeft, Loader } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const RoomPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state?.bookingData || null;
  const bookingConfirmation = location.state?.bookingConfirmation || null;

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [billingDetails, setBillingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData && !localStorage.getItem("currentBooking")) {
      alert('❌ No booking information found. Please complete booking first.');
      navigate('/booking', { replace: true });
      return;
    }

    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem("bookingDetails")) || {};
    } catch {
      saved = {};
    }

    const token = localStorage.getItem("customerToken") || sessionStorage.getItem("customerToken");
    let guest = {};
    if (token) {
      try {
        guest = jwtDecode(token) || {};
      } catch {}
    }

    setBillingDetails({
      firstName: saved.firstName || guest.firstName || 'Guest',
      lastName: saved.lastName || guest.lastName || 'Customer',
      email: saved.email || guest.email || 'guest@bluebird.com',
      phone: saved.phone || guest.phoneNumber || '0771234567',
      address: `${saved.addressLine1 || ""} ${saved.addressLine2 || ""}`.trim() || 'No 1, Galle Road',
      city: saved.city || 'Colombo',
      country: saved.country || 'Sri Lanka'
    });
  }, []);

  const selectedRooms = location.state?.selectedRooms || [];
  const passedBookingData = location.state?.bookingData || {};
  
  // Calculate rooms and adults, kids from selectedRooms
  const totalRooms = selectedRooms.length;
  const totalAdults = selectedRooms.reduce((sum, r) => sum + (r.adults || 0), 0);
  const totalKids = selectedRooms.reduce((sum, r) => sum + (r.kids || 0), 0);
  
  // Calculate 50% advance payment
  const totalAmount = Number(passedBookingData?.totalPrice || 0);
  const originalTotalAmount = Number(
    passedBookingData?.originalTotalPrice ||
    selectedRooms.reduce((sum, room) => sum + Number(room.originalTotalPrice || room.totalPrice || 0), 0)
  );
  const totalSavings = Math.max(0, originalTotalAmount - totalAmount);
  const advanceAmount = Number((totalAmount * 0.5).toFixed(2));
  const remainingAmount = Number((totalAmount - advanceAmount).toFixed(2));

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    const token = localStorage.getItem("customerToken") ||
                  sessionStorage.getItem("customerToken");

    let savedBookingDetails = {};
    let airportPickup = null;
    let personalRequest = null;

    try {
      savedBookingDetails = JSON.parse(localStorage.getItem("bookingDetails"));
    } catch {
      savedBookingDetails = {};
    }

    try {
      airportPickup = JSON.parse(localStorage.getItem("airportPickUp"));
    } catch {
      airportPickup = null;
    }

    try {
      personalRequest = localStorage.getItem("personalRequest");
    } catch {
      personalRequest = null;
    }

    if (!token) {
      setError("User not authenticated");
      setProcessing(false);
      return;
    }
    let guest;

    try {
      guest = jwtDecode(token);
    } catch (err) {
      setError("Invalid session. Please login again.");
      setProcessing(false);
      return;
    }

    if (!guest?.id) {
      setError("Invalid user data in token");
      setProcessing(false);
      return;
    }

    try {
      // 1. Create booking in PENDING status first
      const saveRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/roombook/booking`,
        {
          guestId: guest.id,
          checkInDate:
            passedBookingData?.checkInDate || savedBookingDetails?.checkInDate,
          total_price: Number(totalAmount),
          status: "pending",
          rooms: selectedRooms.map(r => ({
            roomId: r.roomId,
            checkIn: r.checkInDate,
            checkOut: r.checkOutDate,
            actualAdults: r.adults,
            actualKids: r.kids,
            actualKidAges: r.actualKidAges || [],
            roomType: r.roomType,
            boardType: r.boardType
          })),
          airportPickup: airportPickup?.enabled
            ? {
                enabled: true,
                pickupDate:
                  passedBookingData?.checkInDate || savedBookingDetails?.checkInDate || null,
                pickupTime: airportPickup?.time || "",
              }
            : null,
          personalRequest,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!saveRes.data?.success || !saveRes.data?.data?.reservationId) {
        throw new Error(saveRes.data?.message || "Failed to register pending booking");
      }

      const reservationId = saveRes.data.data.reservationId;

      // 2. Fetch the secure signature hash from the backend
      const hashRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/payment/payhere-hash`,
        {
          orderId: String(reservationId),
          amount: advanceAmount,
          currency: "LKR"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!hashRes.data?.success || !hashRes.data?.hash) {
        throw new Error("Failed to generate payment signature hash");
      }

      const { hash, merchantId } = hashRes.data;

      // 3. Serialize booking details into localStorage so they are restored on return
      localStorage.setItem("completedBookingDetails", JSON.stringify({
        bookingData: passedBookingData,
        selectedRooms: selectedRooms,
        bookingConfirmation: { bookingId: reservationId }
      }));

      setSuccessMessage("Booking registered. Redirecting to PayHere Secure Portal...");

      // 4. Dynamically construct and submit the HTML checkout form
      setTimeout(() => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://sandbox.payhere.lk/pay/checkout';

        const addField = (name, val) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = val;
          form.appendChild(input);
        };

        addField('merchant_id', merchantId);
        addField('return_url', `${window.location.origin}/booking-confirm?order_id=${reservationId}`);
        addField('cancel_url', `${window.location.origin}/payment`);
        addField('notify_url', "https://465b-175-157-188-97.ngrok-free.app/api/payment/notify");

        // Customer details
        addField('first_name', billingDetails.firstName);
        addField('last_name', billingDetails.lastName);
        addField('email', billingDetails.email);
        addField('phone', billingDetails.phone);
        addField('address', billingDetails.address);
        addField('city', billingDetails.city);
        addField('country', billingDetails.country);

        // Order details
        addField('order_id', reservationId);
        addField('items', `BlueBird Room Booking #${reservationId}`);
        addField('currency', 'LKR');
        addField('amount', advanceAmount.toFixed(2));
        addField('hash', hash);

        document.body.appendChild(form);
        form.submit();
      }, 1000);

    } catch (err) {
      console.error('❌ PayHere Redirection error:', err);
      setError(err.response?.data?.message || err.message || 'Payment initiation failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">

      <main className="grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Booking
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Portal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-8 flex items-center gap-4 rounded-2xl border border-teal-100 bg-teal-50/70 px-5 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-white shadow-md shadow-teal-700/20">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Official Payment Gateway</p>
                    <h2 className="text-2xl font-bold text-stone-900">PayHere Secure Checkout</h2>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Success Alert */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-3">
                    <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                    <p className="text-sm text-emerald-700">{successMessage}</p>
                  </div>
                )}

                {/* Billing Details Review */}
                <div className="mb-8 p-6 bg-stone-50 border border-stone-200 rounded-2xl">
                  <h3 className="text-md font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">Billing & Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-stone-500 text-xs">Customer Name</p>
                      <p className="font-semibold text-stone-800">{billingDetails.firstName} {billingDetails.lastName}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs">Email Address</p>
                      <p className="font-semibold text-stone-800">{billingDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs">Phone Number</p>
                      <p className="font-semibold text-stone-800">{billingDetails.phone}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs">Destination City & Country</p>
                      <p className="font-semibold text-stone-800">{billingDetails.city}, {billingDetails.country}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-stone-500 text-xs">Billing Address</p>
                      <p className="font-semibold text-stone-800">{billingDetails.address}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-950">50% Advance Guarantee</p>
                      <p className="text-xs text-emerald-700/80">Pay half today securely, pay the remaining half at check-in.</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-stone-500 text-[10px] font-bold uppercase tracking-wider">Pay Today</p>
                    <p className="text-3xl font-black text-emerald-800">${advanceAmount.toFixed(2)}</p>
                  </div>
                </div>

                <form onSubmit={handlePayment}>
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-stone-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 mt-6 shadow-lg shadow-teal-700/10 hover:shadow-teal-800/20 active:scale-[0.98]"
                  >
                    {processing ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Initializing PayHere Portal...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Proceed to Pay ${advanceAmount.toFixed(2)} with PayHere
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold mb-1">Payment Information</p>
                    <p>You are paying 50% advance now. The remaining 50% will be due upon check-in.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold text-stone-900 mb-6">Booking Summary</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-stone-200">

                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Check-in:</span>
                    <span className="font-semibold text-stone-900">
                      {passedBookingData?.checkInDate ? new Date(passedBookingData.checkInDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Check-out:</span>
                    <span className="font-semibold text-stone-900">
                      {passedBookingData?.checkOutDate ? new Date(passedBookingData.checkOutDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Rooms:</span>
                    <span className="font-semibold text-stone-900">
                      {totalRooms}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Guests:</span>
                    <span className="font-semibold text-stone-900">
                      {totalAdults} Adults, {totalKids} Kids
                    </span>
                  </div>

                </div>

                {/* Show per-room kid ages if available */}
                {selectedRooms.map((room, idx) => {
                  const ages = Array.isArray(room.actualKidAges) && room.actualKidAges.length > 0
                    ? room.actualKidAges
                    : Array.isArray(room.kidAges) && room.kidAges.length > 0
                      ? room.kidAges
                      : [];

                  if (ages.length === 0) return null;

                  return (
                    <div key={idx} className="mb-3 p-3 rounded-lg bg-white border border-stone-100 text-sm">
                      <div className="font-semibold text-stone-900 mb-2">Room {idx + 1} - Kid ages</div>
                      <div className="flex flex-wrap items-center gap-2">
                        {ages.map((a, i) => (
                          <span key={i} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800 border border-emerald-100">
                            <span className="flex w-4 h-4 rounded-full bg-emerald-300 text-white text-[11px] font-bold items-center justify-center">{i+1}</span>
                            <span>Age {a}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="space-y-2 mb-6">
                  {originalTotalAmount > totalAmount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Original Total:</span>
                      <span className="text-stone-400 line-through">${originalTotalAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Subtotal:</span>
                    <span className="text-stone-900">${totalAmount.toFixed(2)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Discount Savings:</span>
                      <span className="font-semibold text-emerald-700">-${totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Advance (50%):</span>
                    <span className="font-semibold text-emerald-700">${advanceAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Due at check-in:</span>
                    <span className="font-semibold text-stone-900">${remainingAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-stone-100 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-900">Total Amount:</span>
                    <div className="text-right">
                      {originalTotalAmount > totalAmount && (
                        <p className="text-xs text-stone-400 line-through">${originalTotalAmount.toFixed(2)}</p>
                      )}
                      <span className="text-2xl font-bold text-emerald-700">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-emerald-50 rounded-lg flex gap-2">
                  <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                  <p className="text-xs text-emerald-700 font-semibold">Secure payment with encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


export default RoomPayment;