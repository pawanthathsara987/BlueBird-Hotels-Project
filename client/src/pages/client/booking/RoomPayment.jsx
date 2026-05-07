import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle, Check, ArrowLeft, Loader } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const RoomPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state?.bookingData || null;
  console.log(bookingData);
  const bookingConfirmation = location.state?.bookingConfirmation || null;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [cardData, setCardData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [bankData, setBankData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData && !localStorage.getItem("currentBooking")) {
      alert('❌ No booking information found. Please complete booking first.');
      navigate('/booking', { replace: true });
    }
  }, []);

  const selectedRooms = location.state?.selectedRooms || [];
  const passedBookingData = location.state?.bookingData || {};
  
  // Calculate rooms and adults, kids from selectedRooms
  const totalRooms = selectedRooms.length;
  const totalAdults = selectedRooms.reduce((sum, r) => sum + (r.adults || 0), 0);
  const totalKids = selectedRooms.reduce((sum, r) => sum + (r.kids || 0), 0);
  
  // Calculate 50% advance payment
  const totalAmount = Number(passedBookingData?.totalPrice || 0);
  const advanceAmount = Number((totalAmount * 0.5).toFixed(2));
  const remainingAmount = Number((totalAmount - advanceAmount).toFixed(2));

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateCardPayment = () => {
    if (!cardData.cardName.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    if (!cardData.cardNumber.trim() || cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Valid 16-digit card number is required');
      return false;
    }
    if (!cardData.expiryDate || !/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      setError('Expiry date must be in MM/YY format');
      return false;
    }
    if (!cardData.cvv || cardData.cvv.length !== 3) {
      setError('Valid 3-digit CVV is required');
      return false;
    }
    return true;
  };

  const validateBankPayment = () => {
    if (!bankData.bankName.trim()) {
      setError('Bank name is required');
      return false;
    }
    if (!bankData.accountNumber.trim()) {
      setError('Account number is required');
      return false;
    }
    if (!bankData.accountHolder.trim()) {
      setError('Account holder name is required');
      return false;
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    // Validate payment method
    if (paymentMethod === 'card' && !validateCardPayment()) {
      return;
    }
    if (paymentMethod === 'bank' && !validateBankPayment()) {
      return;
    }

    setProcessing(true);

    const token = localStorage.getItem("customerToken") ||
                  sessionStorage.getItem("customerToken");

    if (!token) {
      setError("User not authenticated");
      return;
    }
    let guest;

    try {
      guest = jwtDecode(token);
    } catch (err) {
      setError("Invalid session. Please login again.");
      return;
    }

    if (!guest?.id) {
      setError("Invalid user data in token");
      return;
    }

    try {
      const paymentPayload = {
        bookingId: bookingConfirmation?.booking_id,
        userId: guest.id,
        amount: advanceAmount,
        paymentMethod,
        bookingType: 'room',
        ...(paymentMethod === 'card' && { card: cardData }),
        ...(paymentMethod === 'bank' && { bank: bankData }),
      };

      // Simulate payment processing (replace with actual API call)
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Simulate successful payment
          resolve({
            success: true,
            message: 'Payment processed successfully',
            paymentId: `PAY_${Date.now()}`,
            data: paymentPayload
          });
        }, 2000);
      });

      if (response.success) {
        try {
          const saveRes = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/roombook/booking`,
            {
              guestId: guest.id,
              total_price: Number(totalAmount),
              rooms: selectedRooms.map(r => ({
                roomId: r.roomId,
                checkIn: r.checkInDate,
                checkOut: r.checkOutDate,
                adults: r.adults,
                kids: r.kids
              }))
            }
          );

        } catch (err) {
          console.error("❌ Failed to save booking:", err);
          setError("Payment done, but booking save failed");
          return;
        }

        setSuccessMessage('✅ Payment successful! Your room booking is confirmed.');

        // Redirect to booking confirmation after 2 seconds
        setTimeout(() => {
          localStorage.removeItem("bookingDetails");
          navigate('/booking-confirm', {
            state: {
              bookingData: passedBookingData,
              selectedRooms,
              bookingConfirmation,
              paymentConfirmation: response.data
            }
          });
        }, 2000);
      } else {
        throw new Error(response.message || 'Payment failed');
      }

    } catch (error) {
      console.error('❌ Payment error:', error);
      setError(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
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
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">Payment Details</h2>

                {/* Error Alert */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Success Alert */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-700">{successMessage}</p>
                  </div>
                )}

                {/* Payment Method Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-stone-700 mb-4">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-lg border-2 transition flex items-center justify-center gap-2 font-semibold ${
                        paymentMethod === 'card'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-700'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300'
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-4 rounded-lg border-2 transition flex items-center justify-center gap-2 font-semibold ${
                        paymentMethod === 'bank'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-700'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300'
                      }`}
                    >
                      <Lock className="h-5 w-5" />
                      Bank Transfer
                    </button>
                  </div>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardName"
                        value={cardData.cardName}
                        onChange={handleCardChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                          handleCardChange({
                            target: { name: 'cardNumber', value: value.replace(/(\d{4})/g, '$1 ').trim() }
                          });
                        }}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        disabled={processing}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={cardData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            handleCardChange({ target: { name: 'expiryDate', value } });
                          }}
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                          disabled={processing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                            handleCardChange({ target: { name: 'cvv', value } });
                          }}
                          placeholder="123"
                          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                          disabled={processing}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 mt-6"
                    >
                      {processing ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5" />
                          Pay ${advanceAmount.toFixed(2)} (50% Advance)
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Bank Transfer Form */}
                {paymentMethod === 'bank' && (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        name="bankName"
                        value={bankData.bankName}
                        onChange={handleBankChange}
                        placeholder="ABC Bank"
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={bankData.accountNumber}
                        onChange={handleBankChange}
                        placeholder="1234567890"
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Account Holder</label>
                      <input
                        type="text"
                        name="accountHolder"
                        value={bankData.accountHolder}
                        onChange={handleBankChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        disabled={processing}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 mt-6"
                    >
                      {processing ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          Pay ${advanceAmount.toFixed(2)} (50% Advance)
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
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

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Subtotal:</span>
                    <span className="text-stone-900">${totalAmount.toFixed(2)}</span>
                  </div>
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
                    <span className="text-2xl font-bold text-emerald-700">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-emerald-50 rounded-lg flex gap-2">
                  <Check className="h-4 w-4 text-emerald-700 flex-shrink-0" />
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