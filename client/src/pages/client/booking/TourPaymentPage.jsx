import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle, Check, ArrowLeft, Loader } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/header';
import Footer from '../../../components/footer';

export default function TourPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const bookingId = queryParams.get('bookingId') || location.state?.bookingId;
  const bookingData = location.state?.bookingData || null;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(!!bookingId);
  const [booking, setBooking] = useState(null);
  
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

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

  // Fetch booking data if bookingId is provided
  useEffect(() => {
    if (bookingId) {
      const fetchBooking = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${backendBaseUrl}/tour-booking/${bookingId}`);
          const data = await response.json();
          if (data.success) {
            setBooking(data.data);
          } else {
            setError('Failed to load booking details');
          }
        } catch (error) {
          console.error('Error fetching booking:', error);
          setError('Failed to load booking details');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [bookingId, backendBaseUrl]);

  // Calculate 50% advance
  const totalAmount = booking?.totalAmount || bookingData?.totalPrice || 0;
  const advanceAmount = totalAmount * 0.5;
  const remainingAmount = totalAmount - advanceAmount;

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

    try {
      const transactionId = `TXN-${Date.now()}`;
      const actualBookingId = booking?.id || bookingData?.id || bookingId;

      if (!actualBookingId) {
        setError('Booking information not available. Please try again.');
        setProcessing(false);
        return;
      }
      
      // Verify deposit payment with backend
      const response = await fetch(`${backendBaseUrl}/tour-payment/verify/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: actualBookingId,
          transactionId: transactionId,
          paymentMethod: paymentMethod,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Payment verification failed');
      }

      if (responseData.success) {
        setSuccessMessage(
          `✓ Payment successful! 50% advance has been paid.\n` +
          `Transaction ID: ${transactionId}\n` +
          `You will receive confirmation email shortly.`
        );
        
        console.log('Payment verified:', responseData.data);
        
        // Redirect after success
        setTimeout(() => {
          navigate('/tourBooking');
        }, 4000);
      } else {
        setError(responseData.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="w-full h-full flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-xl text-gray-700 mb-6">No booking data found</p>
            <button
              onClick={() => navigate('/tourBooking')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Tours
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading && bookingId) {
    return (
      <div className="w-full h-full flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-xl text-gray-700">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Booking
          </button>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
              <Check className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
                <p className="text-gray-600 mb-8">Pay 50% advance to confirm your booking</p>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Booking Summary */}
                <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-4">Booking Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Name:</span>
                      <span className="font-semibold">{bookingData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold">{bookingData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">{bookingData.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-semibold">{bookingData.numberOfAdults} Adult(s) + {bookingData.numberOfChildren} Child(ren)</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">Select Payment Method</h3>
                  <div className="space-y-3">
                    
                    {/* Credit Card Option */}
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all" 
                      style={{ borderColor: paymentMethod === 'card' ? '#3b82f6' : '#e5e7eb', backgroundColor: paymentMethod === 'card' ? '#eff6ff' : 'white' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                        <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                      </div>
                    </label>

                    {/* Bank Transfer Option */}
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                      style={{ borderColor: paymentMethod === 'bank' ? '#3b82f6' : '#e5e7eb', backgroundColor: paymentMethod === 'bank' ? '#eff6ff' : 'white' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">Bank Transfer</p>
                        <p className="text-sm text-gray-600">Direct bank transfer</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handlePayment} className="space-y-6">
                  
                  {paymentMethod === 'card' ? (
                    <>
                      {/* Cardholder Name */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cardholder Name *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={cardData.cardName}
                          onChange={handleCardChange}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={cardData.cardNumber}
                          onChange={handleCardChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Expiry & CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date *</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={cardData.expiryDate}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">CVV *</label>
                          <input
                            type="password"
                            name="cvv"
                            value={cardData.cvv}
                            onChange={handleCardChange}
                            placeholder="***"
                            maxLength="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Security Notice */}
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <Lock className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700">Your payment is secure and encrypted</p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Bank Name */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name *</label>
                        <input
                          type="text"
                          name="bankName"
                          value={bankData.bankName}
                          onChange={handleBankChange}
                          placeholder="e.g., People's Bank"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Account Holder */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name *</label>
                        <input
                          type="text"
                          name="accountHolder"
                          value={bankData.accountHolder}
                          onChange={handleBankChange}
                          placeholder="Your name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Account Number */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Account Number *</label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={bankData.accountNumber}
                          onChange={handleBankChange}
                          placeholder="Your account number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Bank Instructions */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700 font-semibold mb-2">Bank Transfer Instructions:</p>
                        <p className="text-xs text-blue-600">Our bank details will be sent to your email. Please complete the transfer to confirm your booking.</p>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={processing}
                    className={`w-full font-bold py-4 rounded-lg transition-colors text-lg flex items-center justify-center gap-2 mt-8 ${
                      processing
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                    }`}
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay 50% Advance Now
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 h-fit">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Summary</h3>

                <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-bold text-lg">LKR {totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">50% Advance</span>
                    <span className="font-bold text-lg text-green-600">LKR {advanceAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-semibold">LKR {remainingAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total to Pay */}
                <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">You Will Pay Now</p>
                  <p className="text-3xl font-bold text-green-600">LKR {advanceAmount.toFixed(2)}</p>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <span className="font-bold">50% Advance Payment:</span> Pay now to confirm booking
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">
                      <span className="font-bold">Remaining Balance:</span> LKR {remainingAmount.toFixed(2)} due before tour date
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-700">
                      <span className="font-bold">Cancellation:</span> Free cancellation up to 24 hours before
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
