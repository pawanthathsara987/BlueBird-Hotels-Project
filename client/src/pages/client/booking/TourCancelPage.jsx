import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader, XCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/header';
import Footer from '../../../components/footer';

export default function TourCancelPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const bookingId = queryParams.get('bookingId');
  const token = queryParams.get('token');

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [details, setDetails] = useState(null);
  const [reason, setReason] = useState('');

  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

  useEffect(() => {
    const validateToken = async () => {
      if (!bookingId || !token) {
        setError('Invalid cancellation link. Missing booking or token.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${backendBaseUrl}/tour-booking/cancel/validate?bookingId=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(token)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || 'Cancellation link is invalid or expired.');
          setValid(false);
        } else {
          setDetails(data.data);
          setValid(true);
        }
      } catch (err) {
        console.error('Error validating cancellation token:', err);
        setError('Failed to validate cancellation link. Please try again later.');
        setValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [backendBaseUrl, bookingId, token]);

  const handleCancelBooking = async () => {
    if (!valid || canceling) return;

    setCanceling(true);
    setError('');

    try {
      const response = await fetch(`${backendBaseUrl}/tour-booking/cancel/by-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          token,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to cancel booking.');
      } else {
        setResult(data.data);
        setValid(false);
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again later.');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow p-6 md:p-8 border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Cancel Booking</h1>
          <p className="text-slate-600 mb-6">Cancellation refund is eligible only when cancelled at least 4 days before tour start.</p>

          {loading && (
            <div className="flex items-center gap-3 text-slate-700">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Validating cancellation link...</span>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!loading && valid && details && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2 text-sm">
                <p><strong>Booking Ref:</strong> {details.bookingRef}</p>
                <p><strong>Guest:</strong> {details.guestName}</p>
                <p><strong>Tour:</strong> {details.tourName}</p>
                <p><strong>Start Date:</strong> {new Date(details.startDate).toLocaleDateString('en-GB')}</p>
                <p><strong>Refund Eligibility:</strong> {details.refundEligible ? 'Eligible' : 'Not eligible'}</p>
                <p><strong>Refund Amount:</strong> ${Number(details.refundAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-semibold text-slate-700 mb-2">
                  Cancellation Reason (Optional)
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us why you need to cancel"
                />
              </div>

              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={canceling}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {canceling ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {canceling ? 'Cancelling...' : 'Confirm Cancel Booking'}
              </button>
            </div>
          )}

          {!loading && result && (
            <div className="p-5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                Booking cancelled successfully
              </div>
              <p><strong>Booking Ref:</strong> {result.bookingRef}</p>
              <p><strong>Refund Eligible:</strong> {result.refundEligible ? 'Yes' : 'No'}</p>
              <p><strong>Refund Amount:</strong> ${Number(result.refundAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <button
                type="button"
                onClick={() => navigate('/tourBooking')}
                className="mt-2 inline-flex bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Back to Tours
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
